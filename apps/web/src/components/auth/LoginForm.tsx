'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { mutate: login, isPending } = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    // Form validation passes, but we ignore the actual credentials
    // and redirect to the backend's Logto OIDC flow instead
    login(data);
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
          <p className="text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm font-semibold">
            Password
          </Label>
          <a href="/forgot-password" className="text-xs font-semibold text-accent-link hover:text-accent-link-hover">
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
        <Label htmlFor="rememberMe" className="text-sm font-medium cursor-pointer">
          Remember me
        </Label>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full bg-accent-solid py-6 text-base font-semibold hover:bg-accent-solid-hover"
        size="lg"
        disabled={isPending}
      >
        {isPending ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
}
