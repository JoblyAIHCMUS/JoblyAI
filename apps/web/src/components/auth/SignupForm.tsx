'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSignup } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface ErrorResponse {
  message?: string;
}

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  userType: z.enum(['job-seeker', 'employer']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupForm() {
  const router = useRouter();
  const { mutate: signup, isPending } = useSignup();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { userType: 'job-seeker' },
  });

  const onSubmit = async (data: SignupFormData) => {
    signup(data, {
      onSuccess: () => {
        router.push('/dashboard');
      },
      onError: (error: Error) => {
        const errorData = (error as { response?: { data?: ErrorResponse } }).response?.data;
        const message = errorData?.message || 'Signup failed. Please try again.';
        setError('email', { message });
      },
    });
  };

  return (
    <Card className="w-full max-w-md p-8">
      <h1 className="text-2xl font-bold mb-6">Create Account</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Full Name
          </label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            {...register('name')}
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
          />
          {errors.password && (
            <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
            Confirm Password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isPending}
        >
          {isPending ? 'Creating Account...' : 'Sign Up'}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-4">
        Already have an account?{' '}
        <a href="/login" className="text-blue-600 hover:underline">
          Sign in
        </a>
      </p>
    </Card>
  );
}
