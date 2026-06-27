import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const FEATURE_FLAGS = {
  googleSso: false,
} as const;

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    login({ id: '1', name: data.email.split('@')[0], email: data.email, role: 'member' });
    navigate('/dashboard');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
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
          <h1 className="text-2xl font-semibold text-text-primary leading-8">Welcome back</h1>
          <p className="text-sm text-text-muted mt-1">Sign in to your TaskFlow account</p>
        </div>

        {/* Form */}
        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                autoComplete="current-password"
                {...register('password')}
                className={cn(
                  'h-11 w-full rounded-input border bg-white pl-3.5 pr-10 text-sm text-text-primary placeholder:text-text-placeholder outline-none transition-colors',
                  'focus:border-primary focus:ring-2 focus:ring-primary/20',
                  errors.password ? 'border-red-400' : 'border-input',
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-placeholder hover:text-text-muted transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 h-11 w-full rounded-input bg-primary text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {isSubmitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Sign up link */}
        <p className="mt-5 text-center text-sm text-text-muted">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>

        {FEATURE_FLAGS.googleSso && (
          <>
            {/* Divider */}
            <div className="mt-5 flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs font-medium text-text-placeholder">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Google SSO */}
            <button
              type="button"
              className="mt-3 flex h-11 w-full items-center justify-center gap-2.5 rounded-input border border-input text-sm font-medium text-text-secondary hover:bg-surface transition-colors"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="h-[18px] w-[18px]"
              />
              Continue with Google
            </button>
          </>
        )}
      </div>
    </div>
  );
}
