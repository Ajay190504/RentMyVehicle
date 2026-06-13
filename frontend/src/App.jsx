import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerHome from './pages/CustomerHome';
import SearchResults from './pages/SearchResults';
import VehicleDetail from './pages/VehicleDetail';
import BookingConfirmation from './pages/BookingConfirmation';
import CustomerBookings from './pages/CustomerBookings';
import OwnerDashboard from './pages/OwnerDashboard';
import VehicleForm from './pages/VehicleForm';
import SubscriptionPlans from './pages/SubscriptionPlans';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import ForgotPassword from './pages/ForgotPassword';
import About from './pages/About';
import Contact from './pages/Contact';
import Help from './pages/Help';
import Profile from './pages/Profile';
import OwnerBookings from './pages/OwnerBookings';

// Route wrapper for authenticated users
function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Route wrapper for specific role check
function RoleRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user?.role)) {
    // If unauthorized role, send back to home based on actual role
    if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user?.role === 'OWNER') return <Navigate to="/owner" replace />;
    return <Navigate to="/" replace />;
  }
  
  return children;
}

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          <Route path="/" element={<CustomerHome />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/vehicle/:id" element={<VehicleDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/help" element={<Help />} />
          
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Renting Protected Routes (For Customers, Owners & Admins) */}
          <Route
            path="/confirm-booking"
            element={
              <RoleRoute allowedRoles={['CUSTOMER', 'OWNER', 'ADMIN']}>
                <BookingConfirmation />
              </RoleRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <RoleRoute allowedRoles={['CUSTOMER', 'OWNER', 'ADMIN']}>
                <CustomerBookings />
              </RoleRoute>
            }
          />

          {/* Owner Specific Protected Routes */}
          <Route
            path="/owner"
            element={
              <RoleRoute allowedRoles={['OWNER']}>
                <OwnerDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/owner/bookings"
            element={
              <RoleRoute allowedRoles={['OWNER']}>
                <OwnerBookings />
              </RoleRoute>
            }
          />
          <Route
            path="/owner/vehicle/new"
            element={
              <RoleRoute allowedRoles={['OWNER']}>
                <VehicleForm />
              </RoleRoute>
            }
          />
          <Route
            path="/owner/vehicle/edit/:id"
            element={
              <RoleRoute allowedRoles={['OWNER']}>
                <VehicleForm />
              </RoleRoute>
            }
          />
          <Route
            path="/plans"
            element={
              <RoleRoute allowedRoles={['OWNER']}>
                <SubscriptionPlans />
              </RoleRoute>
            }
          />

          {/* Admin Specific Protected Routes */}
          <Route
            path="/admin"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </RoleRoute>
            }
          />

          {/* Fallback redirection */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
}
