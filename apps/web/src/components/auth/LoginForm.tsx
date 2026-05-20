'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLogin } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { sanitizeRedirectPath } from '@/lib/utils';

const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutate: login, isPending, error } = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    login(
      { email: data.email, password: data.password },
      {
        onSuccess: (user) => {
          // Check for redirect parameter from URL query string
          const redirectParam = searchParams?.get('redirect');
          const safeRedirect = sanitizeRedirectPath(redirectParam);

          // If redirect param is provided and valid, use it
          if (redirectParam && safeRedirect !== '/') {
            router.push(safeRedirect);
            return;
          }

          // Otherwise, use role-based redirect
          const target =
            user.role === 'employer'
              ? '/employer'
              : user.role === 'candidate'
              ? '/candidate'
              : '/';
          router.push(target);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3">
          <p className="text-sm text-red-700">
            {error instanceof Error
              ? error.message
              : 'Login failed. Please try again.'}
          </p>
        </div>
      )}

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
          <p className="text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm font-semibold">
            Password
          </Label>
          <a
            href="/forgot-password"
            className="text-xs font-semibold text-accent-link hover:text-accent-link-hover"
          >
            Forgot password?
          </a>
        </div>
        <PasswordInput
          id="password"
          placeholder="Enter password"
          {...register('password')}
          className="border-border"
        />
        {errors.password && (
          <p className="text-xs text-red-600">{errors.password.message}</p>
        )}
      </div>

      {/* Remember Me Checkbox */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="rememberMe"
          {...register('rememberMe')}
          className="h-4 w-4 rounded border-border accent-indigo-600"
        />
        <Label
          htmlFor="rememberMe"
          className="text-sm font-medium cursor-pointer"
        >
          Remember me
        </Label>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full bg-accent-solid py-6 text-white font-semibold hover:bg-accent-solid-hover"
        size="lg"
        disabled={isPending}
      >
        {isPending ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
}
