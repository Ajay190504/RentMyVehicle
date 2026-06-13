import React, { useState, useEffect } from 'react';
import apiClient, { API_BASE_URL } from '../api/apiClient';
import { Calendar, User, Clock, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function CustomerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/api/bookings/customer?page=${page}&size=10`);
      if (response.data.success) {
        setBookings(response.data.data.content || []);
        setTotalPages(response.data.data.totalPages || 0);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch booking history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const response = await apiClient.post(`/api/bookings/${bookingId}/cancel`);
      if (response.data.success) {
        fetchBookings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-brand-canvas-soft text-brand-body border-brand-surface-pressed';
      case 'CONFIRMED':
        return 'bg-brand-black text-brand-white border-brand-black';
      case 'ONGOING':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'COMPLETED':
        return 'bg-brand-canvas border-brand-surface-pressed text-brand-body';
      case 'CANCELLED':
        return 'bg-red-50 text-red-600 border-red-200';
      default:
        return 'bg-brand-canvas-soft text-brand-ink border-brand-surface-pressed';
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div className="space-y-8 fade-in max-w-4xl mx-auto py-4">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-brand-ink">My bookings</h1>
        <p className="text-brand-body text-sm font-normal">Track your vehicle reservation history and receipts.</p>
      </div>

      {error && (
        <div className="p-4 text-sm bg-red-50 text-red-600 rounded-xl border border-red-200 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-brand-canvas border border-brand-canvas-soft rounded-xl h-32 animate-pulse"></div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-brand-canvas border border-brand-canvas-soft rounded-xl p-16 text-center space-y-4">
          <p className="text-brand-body font-medium text-lg">You have no reservations yet.</p>
          <p className="text-brand-mute text-sm">Find a vehicle to start your journey.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-brand-canvas border border-brand-canvas-soft rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-brand-surface-pressed transition duration-150"
            >
              {/* Left Side: Image & Vehicle details */}
              <div className="flex gap-5 items-center w-full md:w-auto">
                <div className="w-24 h-24 bg-brand-canvas-soft rounded-lg overflow-hidden border border-brand-canvas-soft flex-shrink-0">
                  {booking.vehicleImageUrl ? (
                    <img
                      src={booking.vehicleImageUrl.startsWith('/uploads') ? `${API_BASE_URL}${booking.vehicleImageUrl}` : booking.vehicleImageUrl}
                      alt={booking.vehicleTitle}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-medium text-brand-body">No image</div>
                  )}
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-medium bg-brand-canvas-soft text-brand-body px-2.5 py-0.5 rounded-pill border border-brand-surface-pressed uppercase">
                      {booking.vehicleCategory}
                    </span>
                    <span className={`text-[10px] font-medium uppercase tracking-wider px-2.5 py-0.5 rounded-pill border ${getStatusStyle(booking.status)}`}>
                      {booking.status.toLowerCase()}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-brand-ink truncate leading-tight">{booking.vehicleTitle}</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-brand-body font-normal">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-brand-body" />
                      <span>{formatDate(booking.startDatetime)}</span>
                    </span>
                    <span className="hidden sm:inline text-brand-mute"><ArrowRight className="w-3.5 h-3.5" /></span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-brand-body" />
                      <span>{formatDate(booking.endDatetime)}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side: Price & Actions */}
              <div className="w-full md:w-auto flex md:flex-col justify-between items-center md:items-end gap-4 pt-4 md:pt-0 border-t md:border-none border-brand-canvas-soft">
                <div className="flex flex-col md:text-right">
                  <span className="text-[10px] font-medium text-brand-body uppercase tracking-wider">Paid amount</span>
                  <span className="font-bold text-xl text-brand-ink">₹{booking.totalAmount.toLocaleString('en-IN')}</span>
                </div>
                {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                  <button
                    onClick={() => handleCancelBooking(booking.id)}
                    className="px-5 py-2.5 border border-brand-black text-brand-ink text-xs font-medium rounded-pill hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition duration-150"
                  >
                    Cancel booking
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-8">
              <button
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="px-6 py-2.5 border border-brand-surface-pressed bg-brand-canvas text-brand-ink rounded-pill text-sm font-medium hover:bg-brand-canvas-soft disabled:opacity-50 disabled:hover:bg-brand-canvas transition duration-150"
              >
                Previous
              </button>
              <span className="text-sm font-medium text-brand-body">
                Page {page + 1} of {totalPages}
              </span>
              <button
                disabled={page === totalPages - 1}
                onClick={() => setPage(page + 1)}
                className="px-6 py-2.5 border border-brand-surface-pressed bg-brand-canvas text-brand-ink rounded-pill text-sm font-medium hover:bg-brand-canvas-soft disabled:opacity-50 disabled:hover:bg-brand-canvas transition duration-150"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
