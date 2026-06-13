import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import apiClient, { API_BASE_URL } from '../api/apiClient';
import { AlertTriangle, ArrowLeft, Calendar, UserCheck, Check } from 'lucide-react';

export default function BookingConfirmation() {
  const { bookingDraft, clearBookingDraft } = useCartStore();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (!bookingDraft) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-brand-body text-xs font-bold uppercase tracking-wider">No booking draft found.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-brand-primary text-brand-on-primary font-bold text-xs uppercase tracking-wider rounded-pill"
        >
          Return Home
        </button>
      </div>
    );
  }

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        vehicleId: bookingDraft.vehicleId,
        rateTypeUsed: bookingDraft.rateTypeUsed,
        startDatetime: bookingDraft.startDatetime,
        endDatetime: bookingDraft.endDatetime,
        operatorRequested: bookingDraft.operatorRequested,
      };

      const response = await apiClient.post('/api/bookings', payload);
      if (response.data.success) {
        setSuccess(true);
        clearBookingDraft();
      } else {
        setError(response.data.message || 'Booking failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Booking validation failed. Overlap detected.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 bg-brand-canvas border border-brand-canvas-soft rounded-xl shadow-sm space-y-6 fade-in">
        <div className="inline-flex p-4 bg-brand-canvas-soft rounded-full text-brand-ink">
          <Check className="w-10 h-10" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold uppercase tracking-tight">Reservation Requested</h1>
          <p className="text-brand-body text-xs mt-2 font-medium">
            Your booking request has been submitted. The vehicle owner has been notified and will verify the schedule.
          </p>
        </div>
        <div className="pt-4 flex flex-col gap-2">
          <button
            onClick={() => navigate('/bookings')}
            className="py-3 bg-brand-primary text-brand-on-primary font-bold text-xs uppercase tracking-wider rounded-pill hover:bg-brand-black-elevated transition"
          >
            View My Bookings
          </button>
          <button
            onClick={() => navigate('/')}
            className="py-3 bg-brand-canvas border border-brand-canvas-soft text-brand-ink font-bold text-xs uppercase tracking-wider rounded-pill hover:bg-brand-canvas-soft transition"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 fade-in">
      <button
        onClick={() => navigate(`/vehicle/${bookingDraft.vehicleId}`)}
        className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      <h1 className="display-lg text-brand-ink uppercase">Confirm Booking</h1>

      {error && (
        <div className="p-4 text-xs font-bold bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-brand-canvas border border-brand-canvas-soft rounded-xl p-6 shadow-sm space-y-6">
        {/* Vehicle Row */}
        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 bg-brand-canvas-soft rounded-lg overflow-hidden border border-brand-canvas-softer flex-shrink-0">
            {bookingDraft.vehicleImageUrl ? (
              <img
                src={bookingDraft.vehicleImageUrl.startsWith('/uploads') ? `${API_BASE_URL}${bookingDraft.vehicleImageUrl}` : bookingDraft.vehicleImageUrl}
                alt={bookingDraft.vehicleTitle}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-brand-body uppercase">No Img</div>
            )}
          </div>
          <div>
            <span className="text-[9px] font-bold bg-brand-canvas-soft text-brand-body px-2 py-0.5 rounded-pill uppercase border border-brand-canvas-softer">
              {bookingDraft.vehicleCategory}
            </span>
            <h3 className="font-extrabold text-sm text-brand-black mt-1.5 line-clamp-1">{bookingDraft.vehicleTitle}</h3>
          </div>
        </div>

        <hr className="border-brand-canvas-soft" />

        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <Calendar className="w-4 h-4 text-brand-ink flex-shrink-0 mt-0.5" />
            <div>
              <span className="block text-[9px] font-extrabold uppercase tracking-widest text-brand-body">Rental Period</span>
              <p className="text-xs font-bold mt-1">
                {formatDate(bookingDraft.startDatetime)} <span className="text-brand-body font-normal lowercase">to</span> {formatDate(bookingDraft.endDatetime)}
              </p>
              <span className="text-xs text-brand-primary font-extrabold mt-1 block uppercase">
                ({bookingDraft.units} {bookingDraft.rateTypeUsed.toLowerCase()} total)
              </span>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <UserCheck className="w-4 h-4 text-brand-ink flex-shrink-0 mt-0.5" />
            <div>
              <span className="block text-[9px] font-extrabold uppercase tracking-widest text-brand-body">Operator Inclusion</span>
              <p className="text-xs font-bold mt-1">
                {bookingDraft.operatorRequested ? 'Professional Operator Requested' : 'Self-Driven / None'}
              </p>
            </div>
          </div>
        </div>

        <hr className="border-brand-canvas-soft" />

        {/* Pricing Summary */}
        <div className="space-y-3">
          <span className="block text-[9px] font-extrabold uppercase tracking-widest text-brand-body">Fare Summary</span>
          <div className="flex justify-between text-xs font-bold text-brand-body">
            <span>Rate Tier</span>
            <span>₹{bookingDraft.rateValue.toLocaleString('en-IN')} / {bookingDraft.rateTypeUsed.toLowerCase()}</span>
          </div>
          <div className="flex justify-between text-xs font-bold text-brand-body">
            <span>Multiplier</span>
            <span>× {bookingDraft.units}</span>
          </div>
          {bookingDraft.operatorRequested && (
            <div className="flex justify-between text-xs font-bold text-brand-body">
              <span>Operator Fee</span>
              <span>₹{(bookingDraft.rateTypeUsed === 'HOURLY' ? 150 : bookingDraft.rateTypeUsed === 'DAILY' ? 1000 : 15000).toLocaleString('en-IN')} × {bookingDraft.units}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-3 border-t border-brand-canvas-soft">
            <span className="text-xs font-extrabold uppercase">Estimated Total</span>
            <span className="text-lg font-extrabold text-brand-primary">₹{bookingDraft.totalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full py-3.5 bg-brand-primary text-brand-on-primary font-bold text-xs uppercase tracking-wider rounded-pill hover:bg-brand-black-elevated transition flex items-center justify-center"
        >
          {loading ? 'Processing Order...' : 'Confirm & Request Reservation'}
        </button>
      </div>
    </div>
  );
}
