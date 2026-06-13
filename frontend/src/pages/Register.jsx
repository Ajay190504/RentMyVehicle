import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import apiClient from '../api/apiClient';
import { User, Shield } from 'lucide-react';

export default function Register() {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: { role: 'CUSTOMER' }
  });
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const loginStore = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError('');
    try {
      const response = await apiClient.post('/api/auth/register', data);
      if (response.data.success) {
        navigate('/login', { state: { message: 'Registration successful! A confirmation email has been sent. Please log in.' } });
      } else {
        setApiError(response.data.message || 'Registration failed');
      }
    } catch (error) {
      setApiError(error.response?.data?.message || 'Something went wrong. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-6 md:my-10 p-6 md:p-8 bg-brand-canvas border border-brand-surface-pressed rounded-xl fade-in">
      <h1 className="text-3xl font-bold tracking-tight mb-2 text-brand-ink text-center">Create account</h1>
      <p className="text-brand-body text-sm text-center mb-8 font-normal">Sign up to start renting or listing vehicles</p>

      {apiError && (
        <div className="mb-6 p-4 text-sm bg-red-50 text-red-600 rounded-xl border border-red-200">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Role Cards Selector */}
        <div className="space-y-2.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-body">Join as a</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setValue('role', 'CUSTOMER')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition duration-150 ${
                selectedRole === 'CUSTOMER'
                  ? 'border-brand-black bg-brand-canvas font-bold border-2 text-brand-ink'
                  : 'border-brand-surface-pressed bg-brand-canvas-soft hover:border-brand-hairline-mid text-brand-body'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-xs">Renting customer</span>
            </button>
            <button
              type="button"
              onClick={() => setValue('role', 'OWNER')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition duration-150 ${
                selectedRole === 'OWNER'
                  ? 'border-brand-black bg-brand-canvas font-bold border-2 text-brand-ink'
                  : 'border-brand-surface-pressed bg-brand-canvas-soft hover:border-brand-hairline-mid text-brand-body'
              }`}
            >
              <Shield className="w-5 h-5" />
              <span className="text-xs">Vehicle owner</span>
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-body">Full name <span className="text-red-500">*</span></label>
          <input
            type="text"
            placeholder="John Doe"
            className="w-full px-4 py-3 bg-brand-canvas-soft border-none text-brand-ink text-sm outline-none focus:bg-brand-surface-pressed transition duration-150 rounded-none"
            {...register('name', { required: 'Name is required' })}
          />
          {errors.name && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.name.message}</p>}
        </div>

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
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-body">Phone number <span className="text-red-500">*</span></label>
          <input
            type="tel"
            placeholder="9876543210"
            className="w-full px-4 py-3 bg-brand-canvas-soft border-none text-brand-ink text-sm outline-none focus:bg-brand-surface-pressed transition duration-150 rounded-none"
            {...register('phone', { required: 'Phone number is required' })}
          />
          {errors.phone && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.phone.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-body">Password <span className="text-red-500">*</span></label>
          <input
            type="password"
            placeholder="Min. 6 characters"
            className="w-full px-4 py-3 bg-brand-canvas-soft border-none text-brand-ink text-sm outline-none focus:bg-brand-surface-pressed transition duration-150 rounded-none"
            {...register('password', { 
              required: 'Password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' }
            })}
          />
          {errors.password && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-body">Confirm password <span className="text-red-500">*</span></label>
          <input
            type="password"
            placeholder="Re-enter password"
            className="w-full px-4 py-3 bg-brand-canvas-soft border-none text-brand-ink text-sm outline-none focus:bg-brand-surface-pressed transition duration-150 rounded-none"
            {...register('confirmPassword', { 
              required: 'Please confirm your password',
              validate: (val) => {
                if (watch('password') !== val) {
                  return "Your passwords do not match";
                }
              }
            })}
          />
          {errors.confirmPassword && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 mt-4 bg-brand-black text-brand-white text-sm font-medium rounded-pill hover:bg-brand-black-elevated active:scale-[0.98] transition duration-150 flex items-center justify-center"
        >
          {loading ? 'Creating account...' : 'Sign up'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-brand-body font-normal">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-black font-bold hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
