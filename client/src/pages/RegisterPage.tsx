import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const schema = z
  .object({
    name: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[0-9]/, 'Must contain a number')
      .regex(/[^A-Za-z0-9]/, 'Must contain a symbol'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

function PasswordField({
  id,
  placeholder,
  autoComplete,
  registration,
  error,
}: {
  id: string;
  placeholder: string;
  autoComplete?: string;
  registration: ReturnType<ReturnType<typeof useForm<FormData>>['register']>;
  error?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          autoComplete={autoComplete}
          {...registration}
          className={cn(
            'h-11 w-full rounded-input border bg-white pl-3.5 pr-10 text-sm text-text-primary placeholder:text-text-placeholder outline-none transition-colors',
            'focus:border-primary focus:ring-2 focus:ring-primary/20',
            error ? 'border-red-400' : 'border-input',
          )}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-placeholder hover:text-text-muted transition-colors"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </>
  );
}

export function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    login({ id: '1', name: data.name, email: data.email, role: 'member' });
    navigate('/dashboard');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{
        background:
          'linear-gradient(148.73deg, #fafbfc 0%, #fcfcfd 16.667%, #fdfefe 33.333%, #fff 50%, #fdfeff 57.143%, #fafcff 64.286%, #f8fbff 71.429%, #f6faff 78.571%, #f4f9ff 85.714%, #f1f7ff 92.857%, #eff6ff 100%)',
      }}
    >
      <div className="bg-white border border-border rounded-auth-card shadow-auth-card w-full max-w-[440px] p-[41px]">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="h-11 w-11 rounded-logo-lg bg-primary shadow-logo-lg flex items-center justify-center">
            <img src="/logo.svg" alt="TaskFlow" className="h-6 w-6" />
          </div>
          <span className="text-[18px] font-semibold tracking-[-0.45px] text-text-primary">
            TaskFlow
          </span>
        </div>

        {/* Heading */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-text-primary leading-8">
            Create your account
          </h1>
          <p className="text-sm text-text-muted mt-1">Get started with TaskFlow for free</p>
        </div>

        {/* Form */}
        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-label" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="John Doe"
              autoComplete="name"
              {...register('name')}
              className={cn(
                'h-11 w-full rounded-input border bg-white px-3.5 text-sm text-text-primary placeholder:text-text-placeholder outline-none transition-colors',
                'focus:border-primary focus:ring-2 focus:ring-primary/20',
                errors.name ? 'border-red-400' : 'border-input',
              )}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register('email')}
              className={cn(
                'h-11 w-full rounded-input border bg-white px-3.5 text-sm text-text-primary placeholder:text-text-placeholder outline-none transition-colors',
                'focus:border-primary focus:ring-2 focus:ring-primary/20',
                errors.email ? 'border-red-400' : 'border-input',
              )}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-label" htmlFor="password">
              Password
            </label>
            <PasswordField
              id="password"
              placeholder="Min. 8 chars, uppercase, number, symbol"
              autoComplete="new-password"
              registration={register('password')}
              error={errors.password?.message}
            />
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-label" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <PasswordField
              id="confirmPassword"
              placeholder="Repeat your password"
              autoComplete="new-password"
              registration={register('confirmPassword')}
              error={errors.confirmPassword?.message}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1.5 h-11 w-full rounded-input bg-primary text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {isSubmitting ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        {/* Terms */}
        <p className="mt-4 text-center text-xs text-text-placeholder leading-5">
          By creating an account you agree to our{' '}
          <Link to="/terms" className="font-medium text-primary hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="font-medium text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </p>

        {/* Sign in link */}
        <p className="mt-4 text-center text-sm text-text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
