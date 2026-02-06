'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthLeftColumn } from '@/components/auth/AuthLeftColumn';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { useSignup } from '@/lib/hooks/useAuth';

const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  userType: z.enum(['job-seeker', 'employer']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { mutate: signup, isPending } = useSignup();
  const [userType, setUserType] = useState<'job-seeker' | 'employer'>('job-seeker');

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
    // Combine first and last name
    const fullName = `${data.firstName} ${data.lastName}`;
    
    signup(
      {
        name: fullName,
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: () => {
          router.push('/dashboard');
        },
        onError: (error: any) => {
          const message = error?.response?.data?.message || 'Signup failed. Please try again.';
          setError('email', { message });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <AuthHeader />

        <div className="grid gap-8 lg:grid-cols-2 items-center">
          <AuthLeftColumn />

          {/* Right Column - Sign Up Form */}
          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md border bg-white p-8 shadow-sm">
              <div className="space-y-3">
                <div className="mt-3">
                  <h2 className="mb-2 text-center text-2xl font-bold text-foreground">
                    Get more opportunities
                  </h2>
                </div>

                <GoogleAuthButton variant="signup" />

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-2 text-muted-foreground">
                      Or sign up with email
                    </span>
                  </div>
                </div>

                {/* Email Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-semibold">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
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
                    <Label
                      htmlFor="confirmPassword"
                      className="text-sm font-semibold"
                    >
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
                    className="w-full bg-accent-solid py-6 text-base font-semibold hover:bg-[color:var(--bg-accent-solid-hover)]"
                    size="lg"
                    disabled={isPending}
                  >
                    {isPending ? 'Creating Account...' : 'Continue'}
                  </Button>
                </form>

                {/* Sign In Link */}
                <div className="text-center text-sm">
                  <span className="text-muted-foreground">
                    Already have an account?{' '}
                  </span>
                  <a href="/login" className="font-semibold text-accent-link hover:text-[color:var(--indigo-700)]">
                    Login
                  </a>
                </div>

                {/* Legal Text */}
                <p className="text-center text-xs text-muted-foreground">
                  By clicking 'Continue', you acknowledge that you have read and accept
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
