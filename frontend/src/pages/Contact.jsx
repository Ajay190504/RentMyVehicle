import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { useAuthStore } from '../store/useAuthStore';
import { Send, CheckCircle2, AlertCircle, Mail, Phone, MapPin, Clock } from 'lucide-react';

export default function Contact() {
  const { isAuthenticated, user } = useAuthStore();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    category: 'General Inquiry',
    subject: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);

  const fetchMyTickets = async () => {
    if (!isAuthenticated) return;
    setTicketsLoading(true);
    try {
      const response = await apiClient.get('/api/support/my-tickets');
      if (response.data.success) {
        setTickets(response.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load tickets', err);
    } finally {
      setTicketsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTickets();
  }, [isAuthenticated]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.post('/api/support/tickets', formData);
      if (response.data.success) {
        setSuccess(true);
        setFormData({
          name: user?.name || '',
          email: user?.email || '',
          phone: user?.phone || '',
          category: 'General Inquiry',
          subject: '',
          message: ''
        });
        fetchMyTickets();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit support request');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    return status === 'RESOLVED' 
      ? 'bg-green-50 text-green-700 border-green-100' 
      : 'bg-yellow-50 text-yellow-700 border-yellow-100';
  };

  return (
    <div className="space-y-16 fade-in pb-16 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="space-y-2 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-brand-ink">Contact support</h1>
        <p className="text-brand-body text-sm font-normal">Our dedicated team is active 24/7 to keep you moving</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Info Column */}
        <div className="flex-1 space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold tracking-tight text-brand-ink">Get in touch</h3>
            <p className="body-sm text-brand-body leading-relaxed font-normal">
              Have questions about vehicle listings, owner subscriptions, or booking issues? 
              Fill out the form, or reach out to us through any of the channels below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="flex gap-4">
              <div className="w-10 h-10 flex items-center justify-center bg-brand-canvas-soft rounded-pill flex-shrink-0">
                <Mail className="w-4.5 h-4.5 text-brand-ink" />
              </div>
              <div className="space-y-0.5">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-brand-body">Email support</span>
                <span className="block text-xs font-bold text-brand-ink">support@rentmyvehicle.com</span>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 flex items-center justify-center bg-brand-canvas-soft rounded-pill flex-shrink-0">
                <Phone className="w-4.5 h-4.5 text-brand-ink" />
              </div>
              <div className="space-y-0.5">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-brand-body">Call support</span>
                <span className="block text-xs font-bold text-brand-ink">+1 (555) 019-2834</span>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 flex items-center justify-center bg-brand-canvas-soft rounded-pill flex-shrink-0">
                <MapPin className="w-4.5 h-4.5 text-brand-ink" />
              </div>
              <div className="space-y-0.5">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-brand-body">Headquarters</span>
                <span className="block text-xs font-bold text-brand-ink">1455 Market St, San Francisco, CA</span>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 flex items-center justify-center bg-brand-canvas-soft rounded-pill flex-shrink-0">
                <Clock className="w-4.5 h-4.5 text-brand-ink" />
              </div>
              <div className="space-y-0.5">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-brand-body">Operating hours</span>
                <span className="block text-xs font-bold text-brand-ink">24 Hours / 7 Days a week</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div className="flex-1">
          {success ? (
            <div className="border border-brand-surface-pressed p-8 text-center space-y-4 rounded-xl bg-brand-canvas">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-pill flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-base text-brand-ink">Ticket submitted successfully</h3>
                <p className="text-xs text-brand-body font-normal leading-relaxed max-w-sm mx-auto">
                  Thank you for contacting us. A support representative has been assigned to your ticket 
                  and will respond to your email address shortly.
                </p>
              </div>
              <button
                onClick={() => setSuccess(false)}
                className="px-6 py-2.5 bg-brand-black text-brand-white text-xs font-bold uppercase tracking-wider rounded-pill hover:bg-brand-black-elevated transition duration-150"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="border border-brand-surface-pressed p-6 rounded-xl bg-brand-canvas space-y-4">
              <h3 className="font-bold text-sm text-brand-ink">Submit support request</h3>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-brand-body">Your name <span className="text-red-500">*</span></span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isAuthenticated}
                    required
                    placeholder="Enter your name"
                    className="w-full bg-brand-canvas-soft border border-brand-surface-pressed p-3 text-xs focus:ring-0 disabled:opacity-75"
                  />
                </div>

                <div className="space-y-1">
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-brand-body">Email address <span className="text-red-500">*</span></span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isAuthenticated}
                    required
                    placeholder="Enter your email"
                    className="w-full bg-brand-canvas-soft border border-brand-surface-pressed p-3 text-xs focus:ring-0 disabled:opacity-75"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-brand-body">Phone number</span>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Optional"
                    className="w-full bg-brand-canvas-soft border border-brand-surface-pressed p-3 text-xs focus:ring-0"
                  />
                </div>

                <div className="space-y-1">
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-brand-body">Inquiry category</span>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-brand-canvas-soft border border-brand-surface-pressed p-3 text-xs focus:ring-0 text-brand-ink"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Booking & Reservation">Booking & Reservation</option>
                    <option value="Billing & Payments">Billing & Payments</option>
                    <option value="Vehicle Listing (Owner)">Vehicle Listing (Owner)</option>
                    <option value="Account & Security">Account & Security</option>
                    <option value="Bug Report">Bug Report</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <span className="block text-[9px] font-bold uppercase tracking-wider text-brand-body">Subject <span className="text-red-500">*</span></span>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="Summarize your problem"
                  className="w-full bg-brand-canvas-soft border border-brand-surface-pressed p-3 text-xs focus:ring-0"
                />
              </div>

              <div className="space-y-1">
                <span className="block text-[9px] font-bold uppercase tracking-wider text-brand-body">Message detail <span className="text-red-500">*</span></span>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Describe your issue or query in detail"
                  className="w-full bg-brand-canvas-soft border border-brand-surface-pressed p-3 text-xs focus:ring-0 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-brand-black text-brand-white text-xs font-bold uppercase tracking-wider rounded-pill hover:bg-brand-black-elevated active:scale-[0.99] transition duration-150 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit support ticket</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Ticket History Board (Logged-In Users Only) */}
      {isAuthenticated && (
        <div className="border-t border-brand-canvas-soft pt-12 space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-bold tracking-tight text-brand-ink">My support history</h3>
            <p className="text-brand-body text-xs font-normal">Monitor your open and resolved support queries</p>
          </div>

          {ticketsLoading ? (
            <div className="p-8 text-center text-xs font-bold text-brand-body animate-pulse">Loading support logs...</div>
          ) : tickets.length === 0 ? (
            <div className="p-8 border border-dashed border-brand-surface-pressed rounded-xl text-center text-xs font-medium text-brand-body">
              No tickets submitted yet. Use the form above to reach our support desk.
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="border border-brand-surface-pressed rounded-xl p-5 bg-brand-canvas space-y-4"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-sm text-brand-ink tracking-tight">{ticket.subject}</span>
                        <span className="text-[10px] text-brand-body bg-brand-canvas-soft px-2 py-0.5 font-bold uppercase rounded-pill">
                          {ticket.category}
                        </span>
                      </div>
                      <span className="text-[10px] text-brand-body font-normal">
                        Submitted: {new Date(ticket.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <span className={`px-3 py-1 border text-[10px] font-extrabold uppercase rounded-pill self-start sm:self-center ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </div>

                  <div className="bg-brand-canvas-softer p-4 rounded-lg">
                    <span className="block text-[9px] font-extrabold uppercase tracking-wider text-brand-body mb-1">Your message</span>
                    <p className="text-xs text-brand-ink whitespace-pre-wrap font-normal leading-relaxed">{ticket.message}</p>
                  </div>

                  {ticket.adminResponse && (
                    <div className="bg-brand-black text-brand-white p-4 rounded-lg border border-brand-black-elevated">
                      <div className="flex justify-between items-center mb-1">
                        <span className="block text-[9px] font-extrabold uppercase tracking-wider text-brand-mute">Support response</span>
                        {ticket.resolvedAt && (
                          <span className="block text-[9px] text-brand-mute">
                            Resolved: {new Date(ticket.resolvedAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-brand-white whitespace-pre-wrap font-normal leading-relaxed">{ticket.adminResponse}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
