import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Phone, Mail, KeyRound, User, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalMode, sendOtp, verifyOtp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(authModalMode);
  
  const [contact, setContact] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('individual');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [verificationHint, setVerificationHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const isEmail = contact.includes('@');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!contact || contact.trim().length < 5) {
      setError('Please enter a valid mobile number or email address.');
      return;
    }

    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setLoading(true);
    try {
      const res = await sendOtp(contact);
      if (res.success) {
        setOtpSent(true);
        setVerificationHint(res.otp ? `Verification Code: ${res.otp}` : (isEmail ? 'Verification code sent to your email' : 'Verification code sent via SMS'));
      } else {
        setError(res.message || 'Failed to send verification code.');
      }
    } catch (err: any) {
      setError(err.message || 'Error requesting verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!otp || otp.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtp(contact, otp, name, role);
      if (!res.success) {
        setError(res.message || 'Verification failed. Please check your verification code.');
      } else {
        // Reset state
        setOtpSent(false);
        setOtp('');
        setContact('');
        setName('');
        setError(null);
      }
    } catch (err: any) {
      setError(err.message || 'Error verifying code.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setOtpSent(false);
    setError(null);
    setVerificationHint(null);
  };

  return (
    <Modal
      isOpen={isAuthModalOpen}
      onClose={closeAuthModal}
      title={mode === 'signin' ? 'Sign In to RECYVIA' : 'Create RECYVIA Account'}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Toggle Sign In / Sign Up */}
        <div className="flex rounded-lg bg-slate-100 dark:bg-zinc-800 p-1">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              handleReset();
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${
              mode === 'signin'
                ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              handleReset();
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${
              mode === 'signup'
                ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400'
            }`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs font-semibold text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            {mode === 'signup' && (
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User className="w-4 h-4 text-slate-400 dark:text-zinc-500" />}
                required
              />
            )}

            <Select
              label="Select Role Persona"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              options={[
                { value: 'individual', label: 'Household Generator / Individual' },
                { value: 'business', label: 'Commercial / Enterprise' },
                { value: 'collector', label: 'Informal Collector' },
                { value: 'recycler', label: 'Recycling Facility Partner' },
              ]}
            />

            <Input
              label="Mobile Number or Email"
              placeholder="Enter mobile number or email"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              leftIcon={
                isEmail ? (
                  <Mail className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
                ) : (
                  <Phone className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
                )
              }
              helperText="Enter your mobile number or email address to receive your 6-digit authentication code."
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {mode === 'signin' ? 'Send Verification Code' : 'Continue to Verification'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs">
              <p className="font-bold text-emerald-900 dark:text-emerald-200">
                Verification code dispatched to {contact}
              </p>
              {verificationHint && (
                <p className="text-emerald-700 dark:text-emerald-300 font-mono mt-0.5">
                  {verificationHint}
                </p>
              )}
            </div>

            <Input
              label="Enter 6-Digit Verification Code"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              leftIcon={<KeyRound className="w-4 h-4 text-slate-400 dark:text-zinc-500" />}
              autoFocus
              required
            />

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={handleReset}
                className="text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 font-semibold"
              >
                Change Phone or Email
              </button>
            </div>

            <Button
              type="submit"
              variant="success"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              isLoading={loading}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Verify & Complete Sign In
            </Button>
          </form>
        )}
      </div>
    </Modal>
  );
};
