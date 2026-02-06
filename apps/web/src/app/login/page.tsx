'use client';

import { Card } from '@/components/ui/card';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthLeftColumn } from '@/components/auth/AuthLeftColumn';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { LoginForm } from '@/components/auth/LoginForm';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <AuthHeader />

        <div className="grid gap-8 lg:grid-cols-2 items-center">
          <AuthLeftColumn />

          {/* Right Column - Login Form */}
          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md border bg-white p-8 shadow-sm">
              <div className="space-y-3">
                <div className='mt-3'>
                  <h2 className="mb-2 text-center text-2xl font-bold text-foreground">
                    Welcome Back
                  </h2>
                </div>

                <GoogleAuthButton variant="login" />

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-2 text-muted-foreground">
                      Or login with email
                    </span>
                  </div>
                </div>

                {/* Email Form */}
                <LoginFormFieldsOnly />

                {/* Sign Up Link */}
                <div className="text-center text-sm">
                  <span className="text-muted-foreground">
                    Don't have an account?{' '}
                  </span>
                  <a href="/signup" className="font-semibold text-accent-link hover:text-[color:var(--indigo-700)]">
                    Sign Up
                  </a>
                </div>

                {/* Legal Text */}
                <p className="text-center text-xs text-muted-foreground">
                  By clicking 'Login', you acknowledge that you have read and accept
                  the{' '}
                  <a href="#" className="text-accent-link hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-accent-link hover:underline">
                    Privacy Policy
                  </a>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Component that extracts just the form fields from LoginForm
function LoginFormFieldsOnly() {
  const { mutate: login, isPending } = require('@/lib/hooks/useAuth').useLogin();
  const { useRouter } = require('next/navigation');
  const { useForm } = require('react-hook-form');
  const { zodResolver } = require('@hookform/resolvers/zod');
  const { z } = require('zod');
  const { Button } = require('@/components/ui/button');
  const { Input } = require('@/components/ui/input');
  
  const router = useRouter();

  const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    login(data, {
      onSuccess: () => {
        router.push('/dashboard');
      },
      onError: (error) => {
        const message = error?.response?.data?.message || 'Login failed. Please try again.';
        setError('email', { message });
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-semibold">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter email address"
          {...register('email')}
          className="border-border"
        />
        {errors.email && (
          <p className="text-xs text-red-600">{(errors.email as any).message}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm font-semibold">
            Password
          </Label>
          <a href="/forgot-password" className="text-xs font-semibold text-accent-link hover:text-[color:var(--indigo-700)]">
            Forgot password?
          </a>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="Enter password"
          {...register('password')}
          className="border-border"
        />
        {errors.password && (
          <p className="text-xs text-red-600">{(errors.password as any).message}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full bg-accent-solid py-6 text-base font-semibold hover:bg-[color:var(--bg-accent-solid-hover)]"
        size="lg"
        disabled={isPending}
      >
        {isPending ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
}
