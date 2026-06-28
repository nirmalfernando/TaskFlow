import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { emailSchema, passwordSchema, PASSWORD_REGEX } from '@/lib/validation';

const schema = z
  .object({
    firstName: z.string().min(1, 'First name is required').max(50),
    lastName: z.string().min(1, 'Last name is required').max(50),
    email: emailSchema,
    password: passwordSchema,
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
            'h-11 w-full rounded-input border bg-card pl-3.5 pr-10 text-sm text-text-primary placeholder:text-text-placeholder outline-none transition-colors',
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

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { label: 'One uppercase letter', test: (v: string) => PASSWORD_REGEX.uppercase.test(v) },
  { label: 'One lowercase letter', test: (v: string) => PASSWORD_REGEX.lowercase.test(v) },
  { label: 'One number', test: (v: string) => PASSWORD_REGEX.digit.test(v) },
];

function PasswordRequirements({ value }: { value: string }) {
  if (!value) return null;
  return (
    <ul className="flex flex-col gap-1 mt-1">
      {PASSWORD_RULES.map(({ label, test }) => {
        const satisfied = test(value);
        return (
          <li
            key={label}
            className={cn(
              'flex items-center gap-1.5 text-xs',
              satisfied ? 'text-green-600' : 'text-text-placeholder',
            )}
          >
            {satisfied ? (
              <Check className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <X className="h-3.5 w-3.5 shrink-0" />
            )}
            {label}
          </li>
        );
      })}
    </ul>
  );
}

export function RegisterPage() {
  const [serverError, setServerError] = useState('');
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const passwordValue = useWatch({ control, name: 'password', defaultValue: '' });

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
      navigate('/dashboard');
    } catch (err) {
      if (isAxiosError(err)) {
        setServerError(
          (err.response?.data as { message?: string })?.message ?? 'Registration failed',
        );
      } else {
        setServerError('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{
        background:
          'linear-gradient(148.73deg, #fafbfc 0%, #fcfcfd 16.667%, #fdfefe 33.333%, #fff 50%, #fdfeff 57.143%, #fafcff 64.286%, #f8fbff 71.429%, #f6faff 78.571%, #f4f9ff 85.714%, #f1f7ff 92.857%, #eff6ff 100%)',
      }}
    >
      <div className="bg-card border border-border rounded-auth-card shadow-auth-card w-full max-w-[440px] p-[41px]">
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
          {serverError && (
            <p className="rounded-input bg-red-50 border border-red-200 px-3.5 py-2.5 text-sm text-red-600">
              {serverError}
            </p>
          )}

          {/* Name row */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-sm font-medium text-text-label" htmlFor="firstName">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                placeholder="John"
                autoComplete="given-name"
                {...register('firstName')}
                className={cn(
                  'h-11 w-full rounded-input border bg-card px-3.5 text-sm text-text-primary placeholder:text-text-placeholder outline-none transition-colors',
                  'focus:border-primary focus:ring-2 focus:ring-primary/20',
                  errors.firstName ? 'border-red-400' : 'border-input',
                )}
              />
              {errors.firstName && (
                <p className="text-xs text-red-500">{errors.firstName.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-sm font-medium text-text-label" htmlFor="lastName">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                placeholder="Doe"
                autoComplete="family-name"
                {...register('lastName')}
                className={cn(
                  'h-11 w-full rounded-input border bg-card px-3.5 text-sm text-text-primary placeholder:text-text-placeholder outline-none transition-colors',
                  'focus:border-primary focus:ring-2 focus:ring-primary/20',
                  errors.lastName ? 'border-red-400' : 'border-input',
                )}
              />
              {errors.lastName && <p className="text-xs text-red-500">{errors.lastName.message}</p>}
            </div>
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
                'h-11 w-full rounded-input border bg-card px-3.5 text-sm text-text-primary placeholder:text-text-placeholder outline-none transition-colors',
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
              placeholder="Min. 8 chars, uppercase, number"
              autoComplete="new-password"
              registration={register('password')}
              error={errors.password?.message}
            />
            <PasswordRequirements value={passwordValue} />
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
