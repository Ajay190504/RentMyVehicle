import React, { useState, useEffect } from 'react';
import apiClient, { API_BASE_URL } from '../api/apiClient';
import { Calendar, User, Clock, CheckCircle2, AlertTriangle, ArrowRight, Play, XCircle } from 'lucide-react';

export default function OwnerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL, PENDING, CONFIRMED, ONGOING, COMPLETED_CANCELLED
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get(`/api/bookings/owner?page=${page}&size=10`);
      if (response.data.success) {
        setBookings(response.data.data.content || []);
        setTotalPages(response.data.data.totalPages || 0);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch incoming rentals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page]);

  const handleBookingAction = async (bookingId, status) => {
    try {
      const response = await apiClient.patch(`/api/bookings/${bookingId}/status?status=${status}`);
      if (response.data.success) {
        fetchBookings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update rental status');
    }
  };

  const getFilteredBookings = () => {
    if (filter === 'ALL') return bookings;
    if (filter === 'PENDING') return bookings.filter(b => b.status === 'PENDING');
    if (filter === 'CONFIRMED') return bookings.filter(b => b.status === 'CONFIRMED');
    if (filter === 'ONGOING') return bookings.filter(b => b.status === 'ONGOING');
    if (filter === 'COMPLETED_CANCELLED') return bookings.filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED');
    return bookings;
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'CONFIRMED': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'ONGOING': return 'bg-green-50 text-green-700 border-green-100';
      case 'COMPLETED': return 'bg-brand-canvas-soft text-brand-body border-brand-canvas-softer';
      case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-brand-canvas-soft text-brand-ink';
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const filteredList = getFilteredBookings();

  return (
    <div className="space-y-8 fade-in max-w-5xl mx-auto py-4">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-brand-ink">Incoming Rentals</h1>
        <p className="text-brand-body text-sm font-normal">Manage reservations requested by customers for your listed vehicles.</p>
      </div>

      {error && (
        <div className="p-4 text-sm bg-red-50 text-red-600 rounded-xl border border-red-200 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-brand-canvas-soft pb-3">
        {['ALL', 'PENDING', 'CONFIRMED', 'ONGOING', 'COMPLETED_CANCELLED'].map((t) => (
          <button
            key={t}
            onClick={() => { setFilter(t); setPage(0); }}
            className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider rounded-pill transition ${
              filter === t
                ? 'bg-brand-black text-brand-white'
                : 'bg-brand-canvas-soft text-brand-body hover:bg-brand-canvas-softer'
            }`}
          >
            {t.replace('_', ' & ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-brand-canvas border border-brand-canvas-soft rounded-xl h-36 animate-pulse"></div>
          ))}
        </div>
      ) : filteredList.length === 0 ? (
        <div className="bg-brand-canvas border border-brand-canvas-soft rounded-xl p-16 text-center space-y-4">
          <p className="text-brand-body font-medium text-lg">No rentals found in this category.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredList.map((booking) => (
            <div
              key={booking.id}
              className="bg-brand-canvas border border-brand-canvas-soft rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-brand-surface-pressed transition duration-150"
            >
              {/* Vehicle & Renter Details */}
              <div className="flex gap-5 items-center w-full md:w-auto">
                <div className="w-20 h-20 bg-brand-canvas-soft rounded-lg overflow-hidden border border-brand-canvas-soft flex-shrink-0">
                  {booking.vehicleImageUrl ? (
                    <img
                      src={booking.vehicleImageUrl.startsWith('/uploads') ? `${API_BASE_URL}${booking.vehicleImageUrl}` : booking.vehicleImageUrl}
                      alt={booking.vehicleTitle}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] font-medium text-brand-body uppercase">No image</div>
                  )}
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[9px] font-bold bg-brand-canvas-soft text-brand-body px-2.5 py-0.5 rounded-pill border border-brand-surface-pressed uppercase">
                      {booking.vehicleCategory}
                    </span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-pill border ${getStatusStyle(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base text-brand-ink truncate leading-tight">{booking.vehicleTitle}</h3>
                  <p className="text-[10px] text-brand-body font-bold">Renter: {booking.customerName}</p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-[11px] text-brand-body font-medium">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDate(booking.startDatetime)}</span>
                    </span>
                    <span className="hidden sm:inline text-brand-mute"><ArrowRight className="w-3.5 h-3.5" /></span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDate(booking.endDatetime)}</span>
                    </span>
                  </div>
                  {booking.operatorRequested && (
                    <span className="inline-block text-[9px] font-extrabold text-brand-primary uppercase mt-1">★ Operator Requested</span>
                  )}
                </div>
              </div>

              {/* Payout & Actions */}
              <div className="w-full md:w-64 flex md:flex-col justify-between items-center md:items-end gap-4 pt-4 md:pt-0 border-t md:border-none border-brand-canvas-soft">
                <div className="flex flex-col md:text-right">
                  <span className="text-[10px] font-bold text-brand-body uppercase tracking-wider">Payout</span>
                  <span className="font-extrabold text-xl text-brand-primary">₹{booking.totalAmount.toLocaleString('en-IN')}</span>
                </div>

                {/* Confirm / Reject */}
                {booking.status === 'PENDING' && (
                  <div className="flex gap-2 w-full md:w-auto">
                    <button
                      onClick={() => handleBookingAction(booking.id, 'CONFIRMED')}
                      className="px-4 py-2 bg-brand-primary text-brand-on-primary text-[10px] font-bold uppercase tracking-wider rounded-pill hover:bg-brand-black-elevated transition"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Reject this request?')) {
                          handleBookingAction(booking.id, 'CANCELLED');
                        }
                      }}
                      className="px-4 py-2 border border-brand-canvas-soft text-[10px] font-bold uppercase tracking-wider rounded-pill hover:border-red-600 hover:text-red-600 transition"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {/* Start / Cancel */}
                {booking.status === 'CONFIRMED' && (
                  <div className="flex gap-2 w-full md:w-auto">
                    <button
                      onClick={() => handleBookingAction(booking.id, 'ONGOING')}
                      className="px-4 py-2 bg-brand-primary text-brand-on-primary text-[10px] font-bold uppercase tracking-wider rounded-pill hover:bg-brand-black-elevated transition flex items-center gap-1"
                    >
                      <Play className="w-3 h-3 fill-brand-on-primary stroke-none" />
                      <span>Start Rental</span>
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Cancel this confirmed booking?')) {
                          handleBookingAction(booking.id, 'CANCELLED');
                        }
                      }}
                      className="px-4 py-2 border border-brand-canvas-soft text-[10px] font-bold uppercase tracking-wider rounded-pill hover:border-red-600 hover:text-red-600 transition"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Complete / Cancel */}
                {booking.status === 'ONGOING' && (
                  <div className="flex gap-2 w-full md:w-auto">
                    <button
                      onClick={() => handleBookingAction(booking.id, 'COMPLETED')}
                      className="px-4 py-2 bg-brand-primary text-brand-on-primary text-[10px] font-bold uppercase tracking-wider rounded-pill hover:bg-brand-black-elevated transition"
                    >
                      Complete Rental
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Cancel this ongoing rental?')) {
                          handleBookingAction(booking.id, 'CANCELLED');
                        }
                      }}
                      className="px-4 py-2 border border-brand-canvas-soft text-[10px] font-bold uppercase tracking-wider rounded-pill hover:border-red-600 hover:text-red-600 transition"
                    >
                      Cancel
                    </button>
                  </div>
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
                className="px-6 py-2 border border-brand-surface-pressed bg-brand-canvas text-brand-ink rounded-pill text-xs font-bold uppercase hover:bg-brand-canvas-soft disabled:opacity-50 transition duration-150"
              >
                Previous
              </button>
              <span className="text-xs font-bold text-brand-body uppercase">
                Page {page + 1} of {totalPages}
              </span>
              <button
                disabled={page === totalPages - 1}
                onClick={() => setPage(page + 1)}
                className="px-6 py-2 border border-brand-surface-pressed bg-brand-canvas text-brand-ink rounded-pill text-xs font-bold uppercase hover:bg-brand-canvas-soft disabled:opacity-50 transition duration-150"
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
