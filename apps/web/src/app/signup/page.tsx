'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthLeftColumn } from '@/components/auth/AuthLeftColumn';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';

export default function SignupPage() {
  const [userType, setUserType] = useState<'job-seeker' | 'employer'>('job-seeker');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Form submitted:', formData);
      // TODO: Submit form to backend
    }
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
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-semibold">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder="Enter your first name"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="border-border"
                      />
                      {errors.firstName && (
                        <p className="text-xs text-red-600">{errors.firstName}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-semibold">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Enter your last name"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="border-border"
                      />
                      {errors.lastName && (
                        <p className="text-xs text-red-600">{errors.lastName}</p>
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
                      name="email"
                      type="email"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={handleChange}
                      className="border-border"
                    />
                    {errors.email && (
                      <p className="text-xs text-red-600">{errors.email}</p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold">
                      Password
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={handleChange}
                      className="border-border"
                    />
                    {errors.password && (
                      <p className="text-xs text-red-600">{errors.password}</p>
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
                      name="confirmPassword"
                      type="password"
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="border-border"
                    />
                    {errors.confirmPassword && (
                      <p className="text-xs text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>

                  {/* User Type Selection */}
                  <div className="space-y-3 border-t border-border pt-4">
                    <RadioGroup value={userType} onValueChange={(value) => setUserType(value as 'job-seeker' | 'employer')}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="job-seeker" id="job-seeker" />
                        <Label htmlFor="job-seeker" className="font-semibold cursor-pointer">
                          Job Seeker
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">Looking for a job</p>

                      <div className="flex items-center space-x-2 pt-2">
                        <RadioGroupItem value="employer" id="employer" />
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
                  >
                    Continue
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
