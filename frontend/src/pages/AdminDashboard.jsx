import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { AlertTriangle, Users, Car, Calendar, CreditCard, CheckCircle2, XCircle, MessageSquare } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [pendingVehicles, setPendingVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [tickets, setTickets] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination per tab
  const [pages, setPages] = useState({ users: 0, vehicles: 0, bookings: 0, subscriptions: 0, tickets: 0 });
  const [totalPages, setTotalPages] = useState({ users: 0, vehicles: 0, bookings: 0, subscriptions: 0, tickets: 0 });

  const [ticketFilter, setTicketFilter] = useState('ALL');
  const [replyText, setReplyText] = useState({});

  const fetchTabDetails = async (tab, pageNum) => {
    setLoading(true);
    setError('');
    try {
      if (tab === 'users') {
        const res = await apiClient.get(`/api/admin/users?page=${pageNum}&size=10`);
        if (res.data.success) {
          setUsers(res.data.data.content || []);
          setTotalPages(prev => ({ ...prev, users: res.data.data.totalPages || 0 }));
        }
      } else if (tab === 'vehicles') {
        const res = await apiClient.get(`/api/admin/vehicles/pending?page=${pageNum}&size=10`);
        if (res.data.success) {
          setPendingVehicles(res.data.data.content || []);
          setTotalPages(prev => ({ ...prev, vehicles: res.data.data.totalPages || 0 }));
        }
      } else if (tab === 'bookings') {
        const res = await apiClient.get(`/api/admin/bookings?page=${pageNum}&size=10`);
        if (res.data.success) {
          setBookings(res.data.data.content || []);
          setTotalPages(prev => ({ ...prev, bookings: res.data.data.totalPages || 0 }));
        }
      } else if (tab === 'subscriptions') {
        const res = await apiClient.get(`/api/admin/subscriptions?page=${pageNum}&size=10`);
        if (res.data.success) {
          setSubscriptions(res.data.data.content || []);
          setTotalPages(prev => ({ ...prev, subscriptions: res.data.data.totalPages || 0 }));
        }
      } else if (tab === 'tickets') {
        const statusParam = ticketFilter !== 'ALL' ? `&status=${ticketFilter}` : '';
        const res = await apiClient.get(`/api/admin/support/tickets?page=${pageNum}&size=10${statusParam}`);
        if (res.data.success) {
          setTickets(res.data.data.content || []);
          setTotalPages(prev => ({ ...prev, tickets: res.data.data.totalPages || 0 }));
        }
      }
    } catch (err) {
      console.error(err);
      setError(`Failed to fetch ${tab} logs`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTabDetails(activeTab, pages[activeTab]);
  }, [activeTab, pages, ticketFilter]);

  const handleApprove = async (vehicleId) => {
    try {
      const res = await apiClient.patch(`/api/admin/vehicles/${vehicleId}/approve`);
      if (res.data.success) {
        setPendingVehicles(pendingVehicles.filter(v => v.id !== vehicleId));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve vehicle');
    }
  };

  const handleReject = async (vehicleId) => {
    try {
      const res = await apiClient.patch(`/api/admin/vehicles/${vehicleId}/reject`);
      if (res.data.success) {
        setPendingVehicles(pendingVehicles.filter(v => v.id !== vehicleId));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject vehicle');
    }
  };

  const handleResolveTicket = async (ticketId) => {
    const text = replyText[ticketId];
    if (!text || !text.trim()) {
      alert('Please enter a response.');
      return;
    }
    try {
      const res = await apiClient.patch(`/api/admin/support/tickets/${ticketId}/resolve`, {
        adminResponse: text
      });
      if (res.data.success) {
        setReplyText(prev => ({ ...prev, [ticketId]: '' }));
        fetchTabDetails(activeTab, pages[activeTab]);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resolve ticket');
    }
  };

  const handlePageChange = (direction) => {
    const currentPage = pages[activeTab];
    const newPage = direction === 'next' ? currentPage + 1 : currentPage - 1;
    setPages(prev => ({ ...prev, [activeTab]: newPage }));
  };

  const tabs = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'vehicles', label: 'Pending approvals', icon: Car },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'tickets', label: 'Support tickets', icon: MessageSquare },
  ];

  return (
    <div className="space-y-6 fade-in pb-16">
      <div className="space-y-1">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-brand-ink">Admin dashboard</h1>
        <p className="text-brand-body text-sm font-normal">Manage marketplace users, approve listings, and monitor bookings</p>
      </div>

      {error && (
        <div className="p-4 text-sm bg-red-50 text-red-600 rounded-xl border border-red-200 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs Row */}
      <div className="flex border-b border-brand-surface-pressed overflow-x-auto gap-2 md:gap-4">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors flex-shrink-0 ${
                activeTab === tab.id
                  ? 'border-brand-black text-brand-black'
                  : 'border-transparent text-brand-body hover:text-brand-black'
              }`}
            >
              <TabIcon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Table / Grid Content */}
      <div className="bg-brand-canvas border border-brand-surface-pressed rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-16 text-center animate-pulse font-medium text-brand-body">Syncing data...</div>
        ) : (
          <>
            {activeTab === 'users' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="bg-brand-canvas-soft border-b border-brand-surface-pressed text-brand-body font-medium uppercase tracking-wider">
                      <th className="py-3 px-4 text-[10px]">ID</th>
                      <th className="py-3 px-4 text-[10px]">Name</th>
                      <th className="py-3 px-4 text-[10px]">Email</th>
                      <th className="py-3 px-4 text-[10px]">Phone</th>
                      <th className="py-3 px-4 text-[10px]">Role</th>
                      <th className="py-3 px-4 text-[10px]">Joined date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-surface-pressed font-normal text-brand-ink">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-brand-canvas-soft transition-colors">
                        <td className="py-3 px-4 font-bold">{u.id}</td>
                        <td className="py-3 px-4">{u.name}</td>
                        <td className="py-3 px-4">{u.email}</td>
                        <td className="py-3 px-4">{u.phone}</td>
                        <td className="py-3 px-4">
                          <span className="bg-brand-canvas-soft text-brand-body text-[10px] px-2.5 py-0.5 rounded-pill border border-brand-surface-pressed uppercase font-medium">
                            {u.role.toLowerCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-brand-body">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan="6" className="py-8 px-4 text-center text-brand-body italic">No users found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'vehicles' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="bg-brand-canvas-soft border-b border-brand-surface-pressed text-brand-body font-medium uppercase tracking-wider">
                      <th className="py-3 px-4 text-[10px]">ID</th>
                      <th className="py-3 px-4 text-[10px]">Owner</th>
                      <th className="py-3 px-4 text-[10px]">Category</th>
                      <th className="py-3 px-4 text-[10px]">Subcategory</th>
                      <th className="py-3 px-4 text-[10px]">Title</th>
                      <th className="py-3 px-4 text-[10px]">Location</th>
                      <th className="py-3 px-4 text-center text-[10px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-surface-pressed font-normal text-brand-ink">
                    {pendingVehicles.map(v => (
                      <tr key={v.id} className="hover:bg-brand-canvas-soft transition-colors">
                        <td className="py-3 px-4 font-bold">{v.id}</td>
                        <td className="py-3 px-4">{v.ownerName}</td>
                        <td className="py-3 px-4">{v.category}</td>
                        <td className="py-3 px-4">{v.subcategory}</td>
                        <td className="py-3 px-4 truncate max-w-[200px]">{v.title}</td>
                        <td className="py-3 px-4">{v.locationCity}</td>
                        <td className="py-3 px-4 flex gap-2 justify-center items-center">
                          <button
                            onClick={() => handleApprove(v.id)}
                            className="py-1.5 px-4 bg-brand-black text-brand-white text-xs font-medium rounded-pill hover:bg-brand-black-elevated flex items-center gap-1 transition"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleReject(v.id)}
                            className="py-1.5 px-4 border border-brand-surface-pressed bg-brand-canvas text-red-600 text-xs font-medium rounded-pill hover:bg-red-50 hover:border-red-200 flex items-center gap-1 transition"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {pendingVehicles.length === 0 && (
                      <tr>
                        <td colSpan="7" className="py-8 px-4 text-center text-brand-body italic">No pending vehicles awaiting approval.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="bg-brand-canvas-soft border-b border-brand-surface-pressed text-brand-body font-medium uppercase tracking-wider">
                      <th className="py-3 px-4 text-[10px]">ID</th>
                      <th className="py-3 px-4 text-[10px]">Customer</th>
                      <th className="py-3 px-4 text-[10px]">Vehicle</th>
                      <th className="py-3 px-4 text-[10px]">Billing</th>
                      <th className="py-3 px-4 text-[10px]">Start date</th>
                      <th className="py-3 px-4 text-[10px]">End date</th>
                      <th className="py-3 px-4 text-[10px]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-surface-pressed font-normal text-brand-ink">
                    {bookings.map(b => (
                      <tr key={b.id} className="hover:bg-brand-canvas-soft transition-colors">
                        <td className="py-3 px-4 font-bold">{b.id}</td>
                        <td className="py-3 px-4">{b.customerName}</td>
                        <td className="py-3 px-4 truncate max-w-[150px]">{b.vehicleTitle}</td>
                        <td className="py-3 px-4 font-bold">₹{b.totalAmount} ({b.rateTypeUsed.toLowerCase()})</td>
                        <td className="py-3 px-4">{new Date(b.startDatetime).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</td>
                        <td className="py-3 px-4">{new Date(b.endDatetime).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</td>
                        <td className="py-3 px-4">
                          <span className="bg-brand-canvas-soft text-brand-body text-[10px] px-2.5 py-0.5 rounded-pill uppercase border border-brand-surface-pressed font-medium">
                            {b.status.toLowerCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr>
                        <td colSpan="7" className="py-8 px-4 text-center text-brand-body italic">No bookings found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'subscriptions' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="bg-brand-canvas-soft border-b border-brand-surface-pressed text-brand-body font-medium uppercase tracking-wider">
                      <th className="py-3 px-4 text-[10px]">ID</th>
                      <th className="py-3 px-4 text-[10px]">Plan</th>
                      <th className="py-3 px-4 text-[10px]">Expiry date</th>
                      <th className="py-3 px-4 text-center text-[10px]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-surface-pressed font-normal text-brand-ink">
                    {subscriptions.map(s => (
                      <tr key={s.id} className="hover:bg-brand-canvas-soft transition-colors">
                        <td className="py-3 px-4 font-bold">{s.id}</td>
                        <td className="py-3 px-4 font-bold text-brand-ink">{s.planName}</td>
                        <td className="py-3 px-4">{new Date(s.endDate).toLocaleDateString('en-IN')}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="bg-brand-canvas-soft text-brand-body text-[10px] px-2.5 py-0.5 rounded-pill uppercase border border-brand-surface-pressed font-medium">
                            {s.status.toLowerCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {subscriptions.length === 0 && (
                      <tr>
                        <td colSpan="5" className="py-8 px-4 text-center text-brand-body italic">No subscriptions logged.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'tickets' && (
              <div className="p-6 space-y-6">
                {/* Filter Controls */}
                <div className="flex gap-2 border-b border-brand-canvas-soft pb-4">
                  {['ALL', 'PENDING', 'RESOLVED'].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setTicketFilter(status);
                        setPages(prev => ({ ...prev, tickets: 0 }));
                      }}
                      className={`px-4 py-1.5 text-xs font-bold rounded-pill border transition ${
                        ticketFilter === status
                          ? 'bg-brand-black text-brand-white border-brand-black'
                          : 'bg-brand-canvas text-brand-body border-brand-surface-pressed hover:border-brand-ink hover:text-brand-ink'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                {/* List */}
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="border border-brand-surface-pressed rounded-xl p-5 bg-brand-canvas-soft space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-3">
                            <span className="font-extrabold text-sm text-brand-ink tracking-tight">{ticket.subject}</span>
                            <span className="text-[10px] text-brand-body bg-brand-canvas px-2 py-0.5 font-bold uppercase rounded-pill border border-brand-surface-pressed">
                              {ticket.category}
                            </span>
                          </div>
                          <span className="text-[10px] text-brand-body font-normal">
                            From: <strong className="text-brand-ink">{ticket.name}</strong> ({ticket.email}) | Role: {ticket.role} | Submitted: {new Date(ticket.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <span className={`px-2.5 py-0.5 border text-[10px] font-extrabold uppercase rounded-pill self-start sm:self-center ${
                          ticket.status === 'RESOLVED'
                            ? 'bg-green-50 text-green-700 border-green-100'
                            : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>

                      <div className="bg-brand-canvas p-4 rounded-lg border border-brand-surface-pressed">
                        <span className="block text-[9px] font-extrabold uppercase tracking-wider text-brand-body mb-1">User inquiry</span>
                        <p className="text-xs text-brand-ink whitespace-pre-wrap font-normal leading-relaxed">{ticket.message}</p>
                      </div>

                      {ticket.status === 'PENDING' ? (
                        <div className="space-y-3">
                          <textarea
                            placeholder="Type support response to resolve this ticket..."
                            value={replyText[ticket.id] || ''}
                            onChange={(e) => setReplyText(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                            className="w-full bg-brand-canvas border border-brand-surface-pressed p-3 text-xs focus:ring-0 resize-none h-20 rounded-lg"
                          />
                          <button
                            onClick={() => handleResolveTicket(ticket.id)}
                            className="px-5 py-2 bg-brand-black text-brand-white text-xs font-bold uppercase tracking-wider rounded-pill hover:bg-brand-black-elevated transition duration-150"
                          >
                            Send reply & resolve
                          </button>
                        </div>
                      ) : (
                        <div className="bg-brand-black text-brand-white p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-1">
                            <span className="block text-[9px] font-extrabold uppercase tracking-wider text-brand-mute">Admin response</span>
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

                  {tickets.length === 0 && (
                    <div className="py-8 text-center text-brand-body italic text-xs font-normal">
                      No support tickets found in this category.
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Pagination Row */}
      {!loading && totalPages[activeTab] > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            disabled={pages[activeTab] === 0}
            onClick={() => handlePageChange('prev')}
            className="px-6 py-2.5 border border-brand-surface-pressed bg-brand-canvas text-brand-ink rounded-pill text-sm font-medium hover:bg-brand-canvas-soft disabled:opacity-50 disabled:hover:bg-brand-canvas transition duration-150"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-brand-body">
            Page {pages[activeTab] + 1} of {totalPages[activeTab]}
          </span>
          <button
            disabled={pages[activeTab] === totalPages[activeTab] - 1}
            onClick={() => handlePageChange('next')}
            className="px-6 py-2.5 border border-brand-surface-pressed bg-brand-canvas text-brand-ink rounded-pill text-sm font-medium hover:bg-brand-canvas-soft disabled:opacity-50 disabled:hover:bg-brand-canvas transition duration-150"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
