'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useSignup } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';


const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.email('Invalid email address'),
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
  const { mutate: signup, isPending, error } = useSignup();
  const [userType, setUserType] = useState<'job-seeker' | 'employer'>('job-seeker');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { userType: 'job-seeker' },
  });

  const onSubmit = async (data: SignupFormData) => {
    signup(
      {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: () => {
          router.push('/');
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3">
          <p className="text-sm text-red-700">
            {error instanceof Error ? error.message : 'Signup failed. Please try again.'}
          </p>
        </div>
      )}

      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm font-semibold">
            First Name
          </Label>
          <Input
            id="firstName"
            type="text"
            placeholder="Enter your first name"
            {...register('firstName')}
            className="border-border"
          />
          {errors.firstName && (
            <p className="text-xs text-red-600">{errors.firstName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm font-semibold">
            Last Name
          </Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Enter your last name"
            {...register('lastName')}
            className="border-border"
          />
          {errors.lastName && (
            <p className="text-xs text-red-600">{errors.lastName.message}</p>
          )}
        </div>
      </div>

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
        <Label htmlFor="password" className="text-sm font-semibold">
          Password
        </Label>
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

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-semibold">
          Confirm Password
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Re-enter password"
          {...register('confirmPassword')}
          className="border-border"
        />
        {errors.confirmPassword && (
          <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* User Type Selection */}
      <div className="space-y-3 border-t border-border pt-4">
        <RadioGroup value={userType} onValueChange={(value) => setUserType(value as 'job-seeker' | 'employer')}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem 
              value="job-seeker" 
              id="job-seeker"
              className="data-[state=checked]:text-accent-solid data-[state=checked]:border-accent-solid"
            />
            <Label htmlFor="job-seeker" className="font-semibold cursor-pointer">
              Job Seeker
            </Label>
          </div>
          <p className="text-sm text-muted-foreground ml-6">Looking for a job</p>

          <div className="flex items-center space-x-2 pt-2">
            <RadioGroupItem 
              value="employer" 
              id="employer"
              className="data-[state=checked]:text-accent-solid data-[state=checked]:border-accent-solid"
            />
            <Label htmlFor="employer" className="font-semibold cursor-pointer">
              Employer
            </Label>
          </div>
          <p className="text-sm text-muted-foreground ml-6">Hiring, sourcing candidates, or posting jobs</p>
        </RadioGroup>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full bg-accent-solid py-6 text-base font-semibold hover:bg-accent-solid-hover"
        size="lg"
        disabled={isPending}
      >
        {isPending ? 'Creating Account...' : 'Continue'}
      </Button>
    </form>
  );
}
