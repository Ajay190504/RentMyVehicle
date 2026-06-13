import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

export default function ForgotPassword() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [step, setStep] = useState(1); // 1 = Enter Email, 2 = Enter New Password
  const [email, setEmail] = useState('');
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailSubmit = async (data) => {
    setLoading(true);
    setApiError('');
    setApiSuccess('');
    try {
      const response = await apiClient.post('/api/auth/forgot-password', { email: data.email });
      if (response.data.success) {
        setEmail(data.email);
        setApiSuccess('A reset confirmation email has been sent to ' + data.email + '. Please check your inbox.');
        setStep(2);
      } else {
        setApiError(response.data.message || 'Verification failed');
      }
    } catch (error) {
      setApiError(error.response?.data?.message || 'Email address not found. Please register.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordResetSubmit = async (data) => {
    setLoading(true);
    setApiError('');
    setApiSuccess('');
    try {
      const response = await apiClient.post('/api/auth/reset-password', {
        email,
        newPassword: data.password
      });
      if (response.data.success) {
        navigate('/login', { state: { message: 'Password reset successfully. Please log in with your new password.' } });
      } else {
        setApiError(response.data.message || 'Failed to reset password');
      }
    } catch (error) {
      setApiError(error.response?.data?.message || 'Failed to reset password. Please check length requirements.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 md:my-20 p-6 md:p-8 bg-brand-canvas border border-brand-surface-pressed rounded-xl fade-in">
      <h1 className="text-3xl font-bold tracking-tight mb-2 text-brand-ink text-center">Reset password</h1>
      <p className="text-brand-body text-sm text-center mb-8 font-normal">
        {step === 1 
          ? 'Enter your registered email address to verify your account' 
          : 'Choose a new secure password for your account'}
      </p>

      {apiError && (
        <div className="mb-6 p-4 text-sm bg-red-50 text-red-600 rounded-xl border border-red-200">
          {apiError}
        </div>
      )}

      {apiSuccess && (
        <div className="mb-6 p-4 text-sm bg-brand-canvas-soft border border-brand-surface-pressed text-brand-ink rounded-xl">
          {apiSuccess}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleSubmit(handleEmailSubmit)} className="space-y-5">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-black text-brand-white text-sm font-medium rounded-pill hover:bg-brand-black-elevated active:scale-[0.98] transition duration-150 flex items-center justify-center"
          >
            {loading ? 'Verifying email...' : 'Verify email'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit(handlePasswordResetSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-body">New password <span className="text-red-500">*</span></label>
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
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-body">Confirm new password <span className="text-red-500">*</span></label>
            <input
              type="password"
              placeholder="Re-enter password"
              className="w-full px-4 py-3 bg-brand-canvas-soft border-none text-brand-ink text-sm outline-none focus:bg-brand-surface-pressed transition duration-150 rounded-none"
              {...register('confirmPassword', { 
                required: 'Please confirm your new password',
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
            className="w-full py-3.5 bg-brand-black text-brand-white text-sm font-medium rounded-pill hover:bg-brand-black-elevated active:scale-[0.98] transition duration-150 flex items-center justify-center"
          >
            {loading ? 'Resetting password...' : 'Reset password'}
          </button>
        </form>
      )}

      <p className="mt-8 text-center text-sm text-brand-body font-normal">
        Remember your password?{' '}
        <Link to="/login" className="text-brand-black font-bold hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
