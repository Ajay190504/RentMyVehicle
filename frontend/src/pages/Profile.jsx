import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import apiClient from '../api/apiClient';
import { User, Calendar, CreditCard, Shield, PlusCircle, LayoutDashboard, Ticket, MessageSquare } from 'lucide-react';

export default function Profile() {
  const { user, logout, updateUser } = useAuthStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditPhone(user.phone || '');
    }
  }, [user]);

  const handleCancel = () => {
    setIsEditing(false);
    setEditName(user?.name || '');
    setEditPhone(user?.phone || '');
    setEditError('');
    setEditSuccess(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess(false);
    setSaveLoading(true);

    if (!editName.trim()) {
      setEditError('Name cannot be empty');
      setSaveLoading(false);
      return;
    }
    if (!editPhone.trim()) {
      setEditError('Phone number cannot be empty');
      setSaveLoading(false);
      return;
    }

    try {
      const response = await apiClient.put('/api/auth/profile', {
        name: editName,
        phone: editPhone
      });
      if (response.data.success) {
        updateUser(response.data.data);
        setEditSuccess(true);
        setIsEditing(false);
      } else {
        setEditError(response.data.message || 'Failed to update profile');
      }
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaveLoading(false);
    }
  };
  const [stats, setStats] = useState({
    bookingsCount: 0,
    activeListings: 0,
    pendingListings: 0,
    totalSpent: 0,
    activeSubPlan: 'None',
    totalUsers: 0,
    pendingTickets: 0
  });

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      setLoading(true);
      try {
        if (user.role === 'CUSTOMER') {
          const res = await apiClient.get('/api/bookings/customer?size=100');
          if (res.data.success) {
            const bookingsList = res.data.data.content || [];
            const spent = bookingsList
              .filter(b => b.status === 'COMPLETED' || b.status === 'CONFIRMED' || b.status === 'ONGOING')
              .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
            setStats(prev => ({
              ...prev,
              bookingsCount: bookingsList.length,
              totalSpent: spent
            }));
          }
        } else if (user.role === 'OWNER') {
          const vRes = await apiClient.get('/api/vehicles/owner?size=100');
          const activeCount = vRes.data.success 
            ? (vRes.data.data.content || []).filter(v => v.status === 'ACTIVE').length 
            : 0;
          const pendingCount = vRes.data.success 
            ? (vRes.data.data.content || []).filter(v => v.status === 'PENDING_APPROVAL').length 
            : 0;
          
          const bRes = await apiClient.get('/api/bookings/owner?size=100');
          const bookingsCount = bRes.data.success ? (bRes.data.data.content || []).length : 0;

          const sRes = await apiClient.get('/api/subscriptions/active');
          const subPlan = sRes.data.success && sRes.data.data 
            ? sRes.data.data.planName 
            : 'No Active Subscription';

          setStats(prev => ({
            ...prev,
            activeListings: activeCount,
            pendingListings: pendingCount,
            bookingsCount: bookingsCount,
            activeSubPlan: subPlan
          }));
        } else if (user.role === 'ADMIN') {
          const uRes = await apiClient.get('/api/admin/users?size=1');
          const totalUsers = uRes.data.success ? uRes.data.data.totalElements : 0;

          const vRes = await apiClient.get('/api/admin/vehicles/pending?size=1');
          const pendingCount = vRes.data.success ? vRes.data.data.totalElements : 0;

          const tRes = await apiClient.get('/api/admin/support/tickets?status=PENDING&size=1');
          const pendingTickets = tRes.data.success ? tRes.data.data.totalElements : 0;

          setStats(prev => ({
            ...prev,
            totalUsers: totalUsers,
            pendingListings: pendingCount,
            pendingTickets: pendingTickets
          }));
        }
      } catch (err) {
        console.error('Failed to load profile metrics', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="space-y-10 fade-in pb-16 max-w-5xl mx-auto">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-brand-ink">Account Settings</h1>
        <p className="text-brand-body text-sm font-normal">Manage your profile information and view dashboard stats</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Details Card */}
        <div className="border border-brand-surface-pressed p-6 rounded-xl bg-brand-canvas space-y-6 self-start animate-fade-in">
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <h3 className="font-extrabold text-base text-brand-ink uppercase tracking-tight">Edit Profile</h3>
              
              {editError && (
                <div className="p-3 text-[11px] font-bold bg-red-50 text-red-600 rounded-lg border border-red-100">
                  {editError}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[9px] font-extrabold uppercase tracking-wider text-brand-body">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-canvas-soft border border-brand-canvas-soft text-xs font-semibold focus:outline-none rounded-lg"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-extrabold uppercase tracking-wider text-brand-body">Phone Number</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-canvas-soft border border-brand-canvas-soft text-xs font-semibold focus:outline-none rounded-lg"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="flex-1 py-2.5 bg-brand-primary text-brand-on-primary text-xs font-bold uppercase tracking-wider rounded-pill hover:bg-brand-black-elevated transition duration-150"
                >
                  {saveLoading ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 py-2.5 border border-brand-surface-pressed text-brand-ink text-xs font-bold uppercase tracking-wider rounded-pill hover:bg-brand-canvas-soft transition duration-150"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-brand-canvas-soft rounded-pill flex items-center justify-center text-brand-ink">
                  <User className="w-7 h-7 stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-extrabold text-base text-brand-ink tracking-tight">{user.name}</h3>
                  <span className="inline-block text-[9px] font-extrabold uppercase tracking-wider bg-brand-black text-brand-white px-2 py-0.5 rounded-pill">
                    {user.role}
                  </span>
                </div>
              </div>

              {editSuccess && (
                <div className="p-3 text-[11px] font-bold bg-green-50 text-green-600 rounded-lg border border-green-100">
                  Profile updated successfully!
                </div>
              )}

              <div className="border-t border-brand-canvas-soft pt-4 space-y-4">
                <div className="space-y-0.5">
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-brand-body">Email Address</span>
                  <span className="block text-xs font-bold text-brand-ink">{user.email}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-brand-body">Phone Number</span>
                  <span className="block text-xs font-bold text-brand-ink">{user.phone || 'Not provided'}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-brand-canvas-soft">
                <button
                  onClick={() => {
                    setEditError('');
                    setEditSuccess(false);
                    setIsEditing(true);
                  }}
                  className="w-full py-3 bg-brand-primary text-brand-on-primary text-xs font-bold uppercase tracking-wider rounded-pill hover:bg-brand-black-elevated transition duration-150"
                >
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full py-3 border border-brand-surface-pressed text-brand-ink text-xs font-bold uppercase tracking-wider rounded-pill hover:bg-brand-canvas-soft transition duration-150"
                >
                  Log out
                </button>
              </div>
            </>
          )}
        </div>

        {/* Stats Column */}
        <div className="lg:col-span-2 space-y-8">
          {loading ? (
            <div className="p-12 text-center text-xs font-bold text-brand-body animate-pulse">
              Syncing account activities...
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="font-extrabold text-sm text-brand-body uppercase tracking-wider">Account Summary</h3>
              
              {/* Role-Based Stat Blocks */}
              {user.role === 'CUSTOMER' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 border border-brand-surface-pressed bg-brand-canvas rounded-xl space-y-2">
                    <Calendar className="w-6 h-6 text-brand-ink" />
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-brand-body">Total Bookings</span>
                    <span className="block text-3xl font-extrabold text-brand-ink">{stats.bookingsCount}</span>
                  </div>

                  <div className="p-6 border border-brand-surface-pressed bg-brand-canvas rounded-xl space-y-2">
                    <CreditCard className="w-6 h-6 text-brand-ink" />
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-brand-body">Total Investment</span>
                    <span className="block text-3xl font-extrabold text-brand-ink">₹{stats.totalSpent.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {user.role === 'OWNER' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 border border-brand-surface-pressed bg-brand-canvas rounded-xl space-y-2">
                    <LayoutDashboard className="w-6 h-6 text-brand-ink" />
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-brand-body">Active / Pending Listings</span>
                    <span className="block text-3xl font-extrabold text-brand-ink">
                      {stats.activeListings} <span className="text-sm text-brand-body font-normal">/ {stats.pendingListings}</span>
                    </span>
                  </div>

                  <div className="p-6 border border-brand-surface-pressed bg-brand-canvas rounded-xl space-y-2">
                    <CreditCard className="w-6 h-6 text-brand-ink" />
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-brand-body">Subscription Tier</span>
                    <span className="block text-xl font-extrabold text-brand-ink truncate">{stats.activeSubPlan}</span>
                  </div>
                </div>
              )}

              {user.role === 'ADMIN' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 border border-brand-surface-pressed bg-brand-canvas rounded-xl space-y-2">
                    <Shield className="w-6 h-6 text-brand-ink" />
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-brand-body">Registered Users</span>
                    <span className="block text-3xl font-extrabold text-brand-ink">{stats.totalUsers}</span>
                  </div>

                  <div className="p-6 border border-brand-surface-pressed bg-brand-canvas rounded-xl space-y-2">
                    <LayoutDashboard className="w-6 h-6 text-brand-ink" />
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-brand-body">Pending Vehicles</span>
                    <span className="block text-3xl font-extrabold text-brand-ink">{stats.pendingListings}</span>
                  </div>

                  <div className="p-6 border border-brand-surface-pressed bg-brand-canvas rounded-xl space-y-2">
                    <MessageSquare className="w-6 h-6 text-brand-ink" />
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-brand-body">Pending Tickets</span>
                    <span className="block text-3xl font-extrabold text-brand-ink">{stats.pendingTickets}</span>
                  </div>
                </div>
              )}

              {/* Role-Based Shortcut Panel */}
              <div className="border border-brand-surface-pressed bg-brand-canvas-soft rounded-xl p-6 space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-brand-ink">Quick Actions</h4>
                <div className="flex flex-wrap gap-3">
                  {user.role === 'CUSTOMER' && (
                    <>
                      <button
                        onClick={() => navigate('/search')}
                        className="px-5 py-2.5 bg-brand-black text-brand-white text-xs font-bold uppercase tracking-wider rounded-pill hover:bg-brand-black-elevated transition duration-150"
                      >
                        Browse vehicles
                      </button>
                      <button
                        onClick={() => navigate('/bookings')}
                        className="px-5 py-2.5 border border-brand-surface-pressed text-brand-ink text-xs font-bold uppercase tracking-wider rounded-pill bg-brand-canvas hover:bg-brand-canvas-soft transition duration-150"
                      >
                        My Bookings
                      </button>
                    </>
                  )}

                  {user.role === 'OWNER' && (
                    <>
                      <button
                        onClick={() => navigate('/owner')}
                        className="px-5 py-2.5 bg-brand-black text-brand-white text-xs font-bold uppercase tracking-wider rounded-pill hover:bg-brand-black-elevated transition duration-150"
                      >
                        Go to Dashboard
                      </button>
                      <button
                        onClick={() => navigate('/owner/vehicle/new')}
                        className="px-5 py-2.5 border border-brand-surface-pressed text-brand-ink text-xs font-bold uppercase tracking-wider rounded-pill bg-brand-canvas hover:bg-brand-canvas-soft transition duration-150 flex items-center gap-1.5"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Add Vehicle</span>
                      </button>
                    </>
                  )}

                  {user.role === 'ADMIN' && (
                    <button
                      onClick={() => navigate('/admin')}
                      className="px-5 py-2.5 bg-brand-black text-brand-white text-xs font-bold uppercase tracking-wider rounded-pill hover:bg-brand-black-elevated transition duration-150"
                    >
                      Go to Admin Panel
                    </button>
                  )}

                  <button
                    onClick={() => navigate('/contact')}
                    className="px-5 py-2.5 border border-brand-surface-pressed text-brand-ink text-xs font-bold uppercase tracking-wider rounded-pill bg-brand-canvas hover:bg-brand-canvas-soft transition duration-150 flex items-center gap-1.5"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>Support Desk</span>
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
