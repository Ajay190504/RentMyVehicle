import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import apiClient from '../api/apiClient';

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const loginStore = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message || '';

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError('');
    try {
      const response = await apiClient.post('/api/auth/login', data);
      if (response.data.success) {
        const { token, user } = response.data.data;
        loginStore(token, user);
        
        // Redirect based on user role
        if (user.role === 'ADMIN') {
          navigate('/admin');
        } else if (user.role === 'OWNER') {
          navigate('/owner');
        } else {
          navigate('/');
        }
      } else {
        setApiError(response.data.message || 'Login failed');
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || '';
      if (errMsg === 'Bad credentials' || errMsg.includes('Bad credentials')) {
        setApiError('Invalid email address or password. Please try again.');
      } else {
        setApiError(errMsg || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 md:my-20 p-6 md:p-8 bg-brand-canvas border border-brand-surface-pressed rounded-xl fade-in">
      <h1 className="text-3xl font-bold tracking-tight mb-2 text-brand-ink text-center">Welcome back</h1>
      <p className="text-brand-body text-sm text-center mb-8 font-normal">Enter your credentials to access your dashboard</p>

      {successMessage && (
        <div className="mb-6 p-4 text-sm bg-green-50 text-green-700 rounded-xl border border-green-200">
          {successMessage}
        </div>
      )}

      {apiError && (
        <div className="mb-6 p-4 text-sm bg-red-50 text-red-600 rounded-xl border border-red-200">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-body">Email address <span className="text-red-500">*</span></label>
          <input
            type="email"
            placeholder="name@example.com"
            className="w-full px-4 py-3 bg-brand-canvas-soft border-none text-brand-ink text-sm outline-none focus:bg-brand-surface-pressed transition duration-150 rounded-none"
            {...register('email', { 
              required: 'Email address is required',
              pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
            })}
          />
          {errors.email && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-body">Password <span className="text-red-500">*</span></label>
            <Link to="/forgot-password" className="text-xs text-brand-ink hover:underline font-medium">
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-3 bg-brand-canvas-soft border-none text-brand-ink text-sm outline-none focus:bg-brand-surface-pressed transition duration-150 rounded-none"
            {...register('password', { required: 'Password is required' })}
          />
          {errors.password && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-brand-black text-brand-white text-sm font-medium rounded-pill hover:bg-brand-black-elevated active:scale-[0.98] transition duration-150 flex items-center justify-center gap-2"
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-brand-body font-normal">
        Don't have an account?{' '}
        <Link to="/register" className="text-brand-black font-bold hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
