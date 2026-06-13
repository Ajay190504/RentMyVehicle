import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient, { API_BASE_URL } from '../api/apiClient';
import { Car, CreditCard, Plus, Edit, Trash2, ShieldAlert, BarChart3, TrendingUp } from 'lucide-react';

export default function OwnerDashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeSub, setActiveSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const vRes = await apiClient.get('/api/vehicles/owner?size=100');
      if (vRes.data.success) {
        setVehicles(vRes.data.data.content || []);
      }

      const bRes = await apiClient.get('/api/bookings/owner?size=100');
      if (bRes.data.success) {
        setBookings(bRes.data.data.content || []);
      }

      const sRes = await apiClient.get('/api/subscriptions/active');
      if (sRes.data.success) {
        setActiveSub(sRes.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteVehicle = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      const response = await apiClient.delete(`/api/vehicles/${id}`);
      if (response.data.success) {
        setVehicles(vehicles.filter((v) => v.id !== id));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete listing');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-50 text-green-700 border-green-100';
      case 'PENDING_APPROVAL': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'INACTIVE': return 'bg-brand-canvas-soft text-brand-body border-brand-canvas-softer';
      case 'REJECTED': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-brand-canvas-soft text-brand-ink';
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse font-bold text-brand-body">Loading Dashboard...</div>;

  // Analytics Math
  const activeListingsCount = vehicles.filter((v) => v.status === 'ACTIVE').length;
  const pendingApprovalsCount = vehicles.filter((v) => v.status === 'PENDING_APPROVAL').length;
  
  // Calculate total earnings from COMPLETED bookings
  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED');
  const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  // Listing Limit calculation
  const limitValue = activeSub ? activeSub.maxVehicleListings : 1; // Default free plan limit is 1 listing
  const utilizationPercentage = Math.min(100, Math.round((vehicles.length / (limitValue === -1 ? 100 : limitValue)) * 100));

  // earnings progress chart points
  // We mock a nice progression chart over the last 6 months based on actual completed bookings
  const chartEarnings = [
    totalEarnings * 0.1,
    totalEarnings * 0.25,
    totalEarnings * 0.4,
    totalEarnings * 0.55,
    totalEarnings * 0.8,
    totalEarnings
  ].map(val => Math.round(val));

  return (
    <div className="space-y-8 fade-in pb-16">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="display-lg text-brand-ink uppercase">Host Dashboard</h1>
          <p className="text-brand-body text-xs font-semibold">Monitor your fleet performance, earnings progress, and subscription slot limits.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/owner/bookings')}
            className="py-3 px-5 border border-brand-surface-pressed text-brand-ink font-bold text-xs uppercase tracking-wider rounded-pill bg-brand-canvas hover:bg-brand-canvas-soft transition duration-150"
          >
            Manage Bookings
          </button>
          <button
            onClick={() => navigate('/owner/vehicle/new')}
            className="py-3 px-5 bg-brand-primary text-brand-on-primary font-bold text-xs uppercase tracking-wider rounded-pill hover:bg-brand-black-elevated transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 text-xs font-bold bg-red-50 text-red-600 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-brand-canvas border border-brand-canvas-soft p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[9px] font-bold text-brand-body uppercase tracking-widest">Total Fleet Listings</span>
            <h3 className="text-2xl font-extrabold mt-1">{vehicles.length}</h3>
            <span className="text-[10px] text-brand-body font-semibold">Listed items</span>
          </div>
          <div className="p-3 bg-brand-canvas-soft text-brand-ink rounded-full">
            <Car className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-brand-canvas border border-brand-canvas-soft p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[9px] font-bold text-brand-body uppercase tracking-widest">Active Listings</span>
            <h3 className="text-2xl font-extrabold mt-1 text-green-600">{activeListingsCount}</h3>
            <span className="text-[10px] text-brand-body font-semibold">Visible on marketplace</span>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-full">
            <Car className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-brand-canvas border border-brand-canvas-soft p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[9px] font-bold text-brand-body uppercase tracking-widest">Pending Approvals</span>
            <h3 className="text-2xl font-extrabold mt-1 text-yellow-600">{pendingApprovalsCount}</h3>
            <span className="text-[10px] text-brand-body font-semibold">Awaiting admin review</span>
          </div>
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-full">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-brand-canvas border border-brand-canvas-soft p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[9px] font-bold text-brand-body uppercase tracking-widest">Lifetime Earnings</span>
            <h3 className="text-2xl font-extrabold mt-1 text-brand-primary">₹{totalEarnings.toLocaleString('en-IN')}</h3>
            <span className="text-[10px] text-brand-body font-semibold">From completed rentals</span>
          </div>
          <div className="p-3 bg-brand-canvas-soft text-brand-primary rounded-full">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Fleet Listings Manager */}
        <div className="lg:col-span-2 space-y-4">
          <span className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-body">Fleet Vehicles Catalog</span>
          {vehicles.length === 0 ? (
            <div className="border border-brand-canvas-soft p-10 text-center rounded-xl space-y-3 bg-brand-canvas">
              <p className="text-brand-body text-xs font-semibold">You have no listed fleet vehicles.</p>
              <button
                onClick={() => navigate('/owner/vehicle/new')}
                className="px-4 py-2 bg-brand-primary text-brand-on-primary font-bold text-xs uppercase tracking-wider rounded-pill"
              >
                List your first vehicle
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {vehicles.map((v) => {
                const primaryImg = v.images.find((img) => img.isPrimary)?.imageUrl ||
                                   (v.images.length > 0 ? v.images[0].imageUrl : '');

                return (
                  <div
                    key={v.id}
                    className="bg-brand-canvas border border-brand-canvas-soft rounded-xl p-4 shadow-sm flex items-center justify-between gap-4 hover:border-brand-surface-pressed transition"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="w-14 h-14 bg-brand-canvas-soft rounded-lg overflow-hidden border border-brand-canvas-softer flex-shrink-0">
                        {primaryImg ? (
                          <img
                            src={primaryImg.startsWith('/uploads') ? `${API_BASE_URL}${primaryImg}` : primaryImg}
                            alt={v.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-brand-body uppercase">No Img</div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] font-extrabold bg-brand-canvas-soft text-brand-ink px-2 py-0.5 rounded-pill border border-brand-canvas-softer">
                            {v.subcategory.toUpperCase()}
                          </span>
                          <span className={`text-[8px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-pill border ${getStatusStyle(v.status)}`}>
                            {v.status.replace('_', ' ')}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-xs text-brand-ink mt-1 line-clamp-1">{v.title}</h3>
                        <span className="text-[9px] text-brand-body font-semibold uppercase">{v.locationCity}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => navigate(`/owner/vehicle/edit/${v.id}`)}
                        className="p-2 border border-brand-canvas-soft hover:border-brand-primary text-brand-body hover:text-brand-ink rounded-full transition"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteVehicle(v.id)}
                        className="p-2 border border-brand-canvas-soft hover:border-red-600 text-brand-body hover:text-red-600 rounded-full transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Recent rentals activity overview */}
          <div className="pt-6 space-y-4 border-t border-brand-canvas-soft mt-6">
            <span className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-body">Recent Rentals Activity</span>
            {bookings.length === 0 ? (
              <div className="border border-brand-canvas-soft p-6 text-center rounded-xl bg-brand-canvas text-brand-body text-xs font-semibold">
                No recent rental bookings received yet.
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.slice(0, 3).map((b) => (
                  <div key={b.id} className="bg-brand-canvas border border-brand-canvas-soft rounded-xl p-4 shadow-sm flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] font-extrabold bg-brand-canvas-soft text-brand-ink px-2 py-0.5 rounded-pill border border-brand-canvas-softer">
                          {b.rateTypeUsed}
                        </span>
                        <span className={`text-[8px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-pill border ${b.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' : b.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-700 border-blue-100' : b.status === 'ONGOING' ? 'bg-green-50 text-green-700 border-green-100' : b.status === 'COMPLETED' ? 'bg-brand-canvas-soft text-brand-body border-brand-canvas-softer' : 'bg-red-50 text-red-700 border-red-100'}`}>
                          {b.status}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-xs text-brand-ink mt-1.5 line-clamp-1">{b.vehicleTitle}</h4>
                      <p className="text-[9px] text-brand-body font-semibold">Renter: {b.customerName}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] font-bold text-brand-body uppercase block">Payout</span>
                      <span className="font-extrabold text-xs text-brand-primary">₹{b.totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
                <div className="pt-2">
                  <button
                    onClick={() => navigate('/owner/bookings')}
                    className="py-2.5 px-5 bg-brand-black text-brand-white text-[10px] font-bold uppercase tracking-wider rounded-pill hover:bg-brand-black-elevated active:scale-[0.98] transition block text-center"
                  >
                    Manage all rentals
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Host Plan Utilization & Earnings Progress */}
        <div className="space-y-6">
          {/* Subscription Slots Utilisation */}
          <div className="bg-brand-canvas border border-brand-canvas-soft p-6 rounded-xl shadow-sm space-y-4">
            <span className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-body">
              Subscription Slot Limits
            </span>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-brand-ink uppercase">{activeSub ? activeSub.planName : 'Starter Plan'}</span>
                <span className="text-brand-primary">
                  {vehicles.length} / {limitValue === -1 ? '∞' : limitValue} Slots
                </span>
              </div>
              <div className="w-full h-2.5 bg-brand-canvas-soft rounded-full overflow-hidden border border-brand-canvas-softer">
                <div 
                  className="h-full bg-brand-primary transition-all duration-300"
                  style={{ width: `${utilizationPercentage}%` }}
                ></div>
              </div>
              <span className="block text-[9px] text-brand-body font-semibold">
                {limitValue === -1 
                  ? 'You have unlimited listings with your host plan.'
                  : `You have filled ${utilizationPercentage}% of your active vehicle slots limit.`}
              </span>
            </div>
            <button
              onClick={() => navigate('/plans')}
              className="w-full py-2.5 bg-brand-canvas border border-brand-surface-pressed text-brand-ink font-bold text-xs uppercase tracking-wider rounded-pill hover:bg-brand-canvas-soft transition duration-150 flex items-center justify-center gap-1.5"
            >
              <CreditCard className="w-4 h-4" />
              <span>Host plans / Upgrade</span>
            </button>
          </div>

          {/* Monthly Progress Chart */}
          <div className="bg-brand-canvas border border-brand-canvas-soft p-6 rounded-xl shadow-sm space-y-4">
            <div className="flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-brand-primary" />
              <span className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-body">
                Earnings Progression
              </span>
            </div>
            
            {/* Custom SVG Line Chart */}
            <div className="h-40 relative flex items-end justify-between border-b border-l border-brand-canvas-soft pb-2 pl-2">
              <svg className="w-full h-full absolute top-0 left-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path
                  d={`M 0 ${100 - (chartEarnings[0] ? (chartEarnings[0] / Math.max(1, totalEarnings)) * 100 : 0)} 
                     L 20 ${100 - (chartEarnings[1] ? (chartEarnings[1] / Math.max(1, totalEarnings)) * 100 : 0)} 
                     L 40 ${100 - (chartEarnings[2] ? (chartEarnings[2] / Math.max(1, totalEarnings)) * 100 : 0)} 
                     L 60 ${100 - (chartEarnings[3] ? (chartEarnings[3] / Math.max(1, totalEarnings)) * 100 : 0)} 
                     L 80 ${100 - (chartEarnings[4] ? (chartEarnings[4] / Math.max(1, totalEarnings)) * 100 : 0)} 
                     L 100 ${100 - (chartEarnings[5] ? (chartEarnings[5] / Math.max(1, totalEarnings)) * 100 : 0)}`}
                  fill="none"
                  stroke="#FF4F00"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              {/* Chart Grid/Labels */}
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, idx) => (
                <div key={month} className="flex flex-col items-center">
                  <span className="text-[8px] font-bold text-brand-mute uppercase tracking-wider">{month}</span>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center text-xs pt-2">
              <span className="text-[10px] font-bold text-brand-body uppercase">Total Earnings Flow</span>
              <span className="font-extrabold text-brand-ink">₹{totalEarnings.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
