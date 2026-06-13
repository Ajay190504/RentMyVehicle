import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { useAuthStore } from '../store/useAuthStore';
import { Check, ShieldAlert, Award, Zap } from 'lucide-react';

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState([]);
  const [activeSub, setActiveSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    // Load Razorpay Checkout Script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    const fetchData = async () => {
      try {
        const plansRes = await apiClient.get('/api/plans');
        if (plansRes.data.success) {
          setPlans(plansRes.data.data);
        }

        if (user && user.role === 'OWNER') {
          const subRes = await apiClient.get('/api/subscriptions/active');
          if (subRes.data.success) {
            setActiveSub(subRes.data.data);
          }
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load subscription details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleSubscribe = async (planId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'OWNER') {
      setError('Only owners can subscribe to a listing plan.');
      return;
    }

    setCheckoutLoading(true);
    setError('');
    setSuccess('');

    try {
      // Create Razorpay Order
      const response = await apiClient.post('/api/subscriptions/create-order', { planId });
      if (response.data.success) {
        const orderData = response.data.data;
        const { orderId, amount, keyId, planName } = orderData;

        // If orderId is a developer mock, handle local verification directly
        if (orderId.startsWith('order_mock_') || keyId === 'rzp_test_dummy') {
          setTimeout(async () => {
            try {
              const mockPaymentId = 'pay_mock_' + Math.random().toString(36).substring(2, 11);
              const mockSignature = 'signature_mock_' + Math.random().toString(36).substring(2, 11);
              
              const verifyResponse = await apiClient.post('/api/subscriptions/verify', {
                planId,
                razorpayOrderId: orderId,
                razorpayPaymentId: mockPaymentId,
                razorpaySignature: mockSignature
              });

              if (verifyResponse.data.success) {
                setSuccess(`Successfully subscribed to ${planName} plan (Developer Mock Payment)!`);
                setActiveSub(verifyResponse.data.data);
                setTimeout(() => navigate('/owner'), 1500);
              }
            } catch (err) {
              setError(err.response?.data?.message || 'Payment mock verification failed');
            } finally {
              setCheckoutLoading(false);
            }
          }, 1000);
        } else {
          // Trigger Real Razorpay Checkout (Test Mode)
          const options = {
            key: keyId,
            amount: amount * 100, // paise
            currency: 'INR',
            name: 'RentMyVehicle',
            description: `Subscription: ${planName}`,
            order_id: orderId,
            handler: async (paymentResponse) => {
              try {
                const verifyResponse = await apiClient.post('/api/subscriptions/verify', {
                  planId,
                  razorpayOrderId: paymentResponse.razorpay_order_id,
                  razorpayPaymentId: paymentResponse.razorpay_payment_id,
                  razorpaySignature: paymentResponse.razorpay_signature
                });

                if (verifyResponse.data.success) {
                  setSuccess(`Successfully subscribed to ${planName} plan!`);
                  setActiveSub(verifyResponse.data.data);
                  setTimeout(() => navigate('/owner'), 1500);
                }
              } catch (err) {
                setError(err.response?.data?.message || 'Payment signature validation failed');
              }
            },
            prefill: {
              name: user.name,
              email: user.email,
              contact: user.phone
            },
            theme: {
              color: '#000000'
            },
            modal: {
              ondismiss: () => {
                setCheckoutLoading(false);
              }
            }
          };
          
          const rzp = new window.Razorpay(options);
          rzp.open();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initialize subscription checkout');
      setCheckoutLoading(false);
    }
  };

  const getPlanIcon = (name) => {
    if (name.toLowerCase() === 'starter') return Zap;
    if (name.toLowerCase() === 'professional') return Award;
    return ShieldAlert;
  };

  if (loading) return <div className="p-8 text-center animate-pulse font-medium text-brand-body">Loading plans...</div>;

  return (
    <div className="space-y-10 fade-in max-w-5xl mx-auto py-4">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-brand-ink">Flexible owner plans</h1>
        <p className="text-brand-body text-sm md:text-base">
          Choose a plan to list your vehicles and start earning. Upgrade, downgrade, or cancel anytime.
        </p>
      </div>

      {activeSub && (
        <div className="max-w-md mx-auto p-5 border border-brand-ink bg-brand-canvas text-brand-ink rounded-xl flex flex-col items-center gap-2">
          <span className="font-bold text-sm flex items-center gap-1.5">
            <Check className="w-4 h-4 bg-brand-black text-brand-white rounded-full p-0.5" />
            <span>Active plan: {activeSub.planName}</span>
          </span>
          <span className="text-xs font-medium text-brand-body">
            Quota: listings used / {activeSub.maxVehicleListings === -1 ? 'unlimited' : activeSub.maxVehicleListings} max
          </span>
          <span className="text-[10px] text-brand-mute uppercase tracking-wider">
            Expires on: {new Date(activeSub.endDate).toLocaleDateString('en-IN')}
          </span>
        </div>
      )}

      {error && (
        <div className="max-w-md mx-auto p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold text-center">
          {error}
        </div>
      )}

      {success && (
        <div className="max-w-md mx-auto p-4 bg-brand-canvas-soft border border-brand-surface-pressed text-brand-ink rounded-xl text-xs font-bold text-center">
          {success}
        </div>
      )}

      {/* Plan Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
        {plans.map((plan) => {
          const PlanIcon = getPlanIcon(plan.name);
          const isCurrentPlan = activeSub && activeSub.planId === plan.id;
          
          return (
            <div
              key={plan.id}
              className={`flex flex-col justify-between relative transition duration-300 rounded-xl p-6 ${
                plan.isFeaturedListing
                  ? 'bg-brand-black text-brand-white scale-100 md:scale-105 z-10'
                  : 'bg-brand-canvas-soft text-brand-ink border border-brand-surface-pressed hover:border-brand-hairline-mid'
              }`}
            >
              {plan.isFeaturedListing && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-white text-brand-black text-[9px] uppercase font-bold tracking-wider px-3.5 py-1 rounded-pill">
                  Most popular
                </span>
              )}

              <div>
                <div className="flex justify-between items-start">
                  <div className={`p-3 rounded-lg ${plan.isFeaturedListing ? 'bg-brand-black-elevated' : 'bg-brand-canvas'}`}>
                    <PlanIcon className={`w-6 h-6 ${plan.isFeaturedListing ? 'text-brand-white' : 'text-brand-black'}`} />
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-pill uppercase ${
                    plan.isFeaturedListing ? 'bg-brand-black-elevated text-brand-white' : 'bg-brand-canvas text-brand-body border border-brand-surface-pressed'
                  }`}>
                    30 days
                  </span>
                </div>

                <h3 className="font-bold text-xl mt-5">{plan.name}</h3>
                <p className={`text-xs mt-2 font-normal leading-relaxed ${plan.isFeaturedListing ? 'text-brand-mute' : 'text-brand-body'}`}>
                  {plan.description}
                </p>

                <div className="my-6">
                  <span className="text-3xl font-bold">₹{plan.price.toLocaleString('en-IN')}</span>
                  <span className={`text-xs font-normal ${plan.isFeaturedListing ? 'text-brand-mute' : 'text-brand-body'}`}>/month</span>
                </div>

                <hr className={`mb-6 ${plan.isFeaturedListing ? 'border-brand-black-elevated' : 'border-brand-surface-pressed'}`} />

                <ul className="space-y-3">
                  <li className="flex items-center gap-2.5 text-xs font-medium">
                    <Check className={`w-4 h-4 rounded-full p-0.5 flex-shrink-0 ${plan.isFeaturedListing ? 'bg-brand-white text-brand-black' : 'bg-brand-black text-brand-white'}`} />
                    <span>
                      {plan.maxVehicleListings === -1 ? 'Unlimited vehicle listings' : `Up to ${plan.maxVehicleListings} vehicle listings`}
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5 text-xs font-medium">
                    <Check className={`w-4 h-4 rounded-full p-0.5 flex-shrink-0 ${plan.isFeaturedListing ? 'bg-brand-white text-brand-black' : 'bg-brand-black text-brand-white'}`} />
                    <span>Instant client bookings</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-xs font-medium">
                    <Check className={`w-4 h-4 rounded-full p-0.5 flex-shrink-0 ${plan.isFeaturedListing ? 'bg-brand-white text-brand-black' : 'bg-brand-black text-brand-white'}`} />
                    <span>Image upload hosting included</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={checkoutLoading || isCurrentPlan}
                className={`w-full py-3 mt-8 font-medium rounded-pill text-sm transition active:scale-[0.98] ${
                  isCurrentPlan
                    ? plan.isFeaturedListing
                      ? 'bg-brand-black-elevated text-brand-mute border border-brand-black-elevated cursor-not-allowed'
                      : 'bg-brand-surface-pressed text-brand-mute border border-brand-surface-pressed cursor-not-allowed'
                    : plan.isFeaturedListing
                    ? 'bg-brand-white text-brand-black hover:bg-brand-canvas-soft'
                    : 'bg-brand-black text-brand-white hover:bg-brand-black-elevated'
                }`}
              >
                {isCurrentPlan ? 'Current active plan' : checkoutLoading ? 'Initiating checkout...' : 'Subscribe'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
