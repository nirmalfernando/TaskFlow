import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AuthMode = 'signin' | 'signup';

export interface SignInValues {
  email: string;
  password: string;
}

export interface SignUpValues {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthCardProps {
  mode?: AuthMode;
  onModeChange?: (mode: AuthMode) => void;
  onSignIn?: (values: SignInValues) => void | Promise<void>;
  onSignUp?: (values: SignUpValues) => void | Promise<void>;
  onGoogleAuth?: () => void;
  onForgotPassword?: () => void;
  isLoading?: boolean;
  error?: string;
}

// ─── Field components ─────────────────────────────────────────────────────────

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-text-label">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function TextInput({
  placeholder,
  value,
  onChange,
  type = 'text',
  hasError,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  hasError?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        'h-11 w-full rounded-input border bg-card px-[13px] text-sm text-text-primary outline-none transition-colors',
        'placeholder:text-text-placeholder',
        'focus:border-primary focus:ring-2 focus:ring-primary/20',
        hasError ? 'border-red-400' : 'border-input',
      )}
    />
  );
}

function PasswordInput({
  placeholder,
  value,
  onChange,
  hasError,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  hasError?: boolean;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'h-11 w-full rounded-input border bg-card pl-[13px] pr-10 text-sm text-text-primary outline-none transition-colors',
          'placeholder:text-text-placeholder',
          'focus:border-primary focus:ring-2 focus:ring-primary/20',
          hasError ? 'border-red-400' : 'border-input',
        )}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-placeholder hover:text-text-muted transition-colors"
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 18 18" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function OrDivider() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs font-medium text-text-placeholder">or</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── AuthCard ─────────────────────────────────────────────────────────────────

export function AuthCard({
  mode = 'signin',
  onModeChange,
  onSignIn,
  onSignUp,
  onGoogleAuth,
  onForgotPassword,
  isLoading = false,
  error,
}: AuthCardProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errors: Record<string, string> = {};

    if (mode === 'signup' && !fullName.trim()) {
      errors.fullName = 'Full name is required.';
    }
    if (!email.trim()) {
      errors.email = 'Email is required.';
    } else if (!validateEmail(email)) {
      errors.email = 'Enter a valid email address.';
    }
    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }
    if (mode === 'signup') {
      if (!confirmPassword) {
        errors.confirmPassword = 'Please confirm your password.';
      } else if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match.';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    if (mode === 'signin') {
      await onSignIn?.({ email, password });
    } else {
      await onSignUp?.({ fullName, email, password, confirmPassword });
    }
  }

  function switchMode() {
    setFieldErrors({});
    setFullName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    onModeChange?.(mode === 'signin' ? 'signup' : 'signin');
  }

  const isSignUp = mode === 'signup';

  return (
    <div className="w-full max-w-[440px] rounded-auth-card border border-border bg-card p-[41px] shadow-auth-card">
      {/* Logo */}
      <div className="mb-6 flex flex-col items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-logo-lg bg-primary shadow-logo-lg">
          <img src="/logo.svg" alt="TaskFlow" className="h-6 w-6" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-text-primary">TaskFlow</span>
      </div>

      {/* Heading */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold text-text-primary">
          {isSignUp ? 'Create an account' : 'Welcome back'}
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          {isSignUp ? 'Sign up to get started with TaskFlow' : 'Sign in to your TaskFlow account'}
        </p>
      </div>

      {/* Global error */}
      {error && (
        <div className="mb-4 rounded-input border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={(e) => {
          void handleSubmit(e);
        }}
        noValidate
        className="flex flex-col gap-4"
      >
        {isSignUp && (
          <FormField label="Full Name" error={fieldErrors.fullName}>
            <TextInput
              placeholder="John Doe"
              value={fullName}
              onChange={setFullName}
              hasError={!!fieldErrors.fullName}
            />
          </FormField>
        )}

        <FormField label="Email" error={fieldErrors.email}>
          <TextInput
            placeholder="you@example.com"
            value={email}
            onChange={setEmail}
            type="email"
            hasError={!!fieldErrors.email}
          />
        </FormField>

        <FormField label="Password" error={fieldErrors.password}>
          <PasswordInput
            placeholder="Enter your password"
            value={password}
            onChange={setPassword}
            hasError={!!fieldErrors.password}
          />
          {!isSignUp && (
            <button
              type="button"
              onClick={onForgotPassword}
              className="self-end text-xs font-medium text-primary hover:underline"
            >
              Forgot password?
            </button>
          )}
        </FormField>

        {isSignUp && (
          <FormField label="Confirm Password" error={fieldErrors.confirmPassword}>
            <PasswordInput
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              hasError={!!fieldErrors.confirmPassword}
            />
          </FormField>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-1 h-11 w-full rounded-input bg-primary text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Please wait…' : isSignUp ? 'Create Account' : 'Sign In'}
        </button>
      </form>

      {/* Mode switch */}
      <p className="mt-5 text-center text-sm text-text-muted">
        {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
        <button
          type="button"
          onClick={switchMode}
          className="font-medium text-primary hover:underline"
        >
          {isSignUp ? 'Sign in' : 'Sign up'}
        </button>
      </p>

      {/* Divider + Google */}
      <div className="mt-5 flex flex-col gap-3">
        <OrDivider />
        <button
          type="button"
          onClick={onGoogleAuth}
          className="flex h-11 w-full items-center justify-center gap-2.5 rounded-input border border-input bg-card text-sm font-medium text-text-secondary transition-colors hover:bg-surface"
        >
          <GoogleIcon />
          Continue with Google
        </button>
      </div>
    </div>
  );
}
