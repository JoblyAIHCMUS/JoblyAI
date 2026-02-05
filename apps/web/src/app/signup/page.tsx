'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function SignupPage() {
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
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-accent-solid" />
            <span className="text-xl font-bold">JoblyAI</span>
          </div>
          <nav className="hidden md:block">
            <a href="/" className="text-sm text-muted-foreground hover:text-foreground">
              Back to home
            </a>
          </nav>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 items-center">
          {/* Left Column - Image and Testimonial */}
          <div 
            className="flex flex-col items-start justify-between rounded-xl bg-cover bg-center bg-no-repeat px-8 py-12 h-full"
            style={{
              backgroundImage: 'url(/auth-image.jpg)',
            }}
          >
            {/* Stats Section */}
            <div className="flex flex-col items-start gap-3">
              <div className="flex items-center gap-1">
                <div className="h-8 w-1.5 rounded-full bg-accent-solid" />
                <div className="h-10 w-1.5 rounded-full bg-accent-solid" />
                <div className="h-8 w-1.5 rounded-full bg-accent-solid" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">100K+</p>
                <p className="text-sm text-white/80">People got hired</p>
              </div>
            </div>

            {/* Testimonial Card */}
            <div className="relative w-full max-w-sm mt-auto">
              <div className="absolute -inset-2 -z-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 blur-2xl opacity-40" />
              <Card className="border-0 bg-white p-6 shadow-xl">
                <div className="mb-4 flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/auth-avatar.jpg" alt="Courtney Miller" className="object-cover" />
                    <AvatarFallback>AS</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">Courtney Miller</p>
                    <p className="text-xs text-muted-foreground">Lead Engineer at Canva</p>
                  </div>
                </div>
                <p className="text-sm italic text-foreground">
                  "Great platform for the job seeker that searching for new career heights."
                </p>
              </Card>
            </div>
          </div>

          {/* Right Column - Sign Up Form */}
          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md border bg-white p-8 shadow-sm">
              {/* Tabs */}
              <Tabs defaultValue="job-seeker" className="mb-8 w-full">
                <TabsList className="grid w-full grid-cols-2 bg-transparent">
                  <TabsTrigger
                    value="job-seeker"
                    className="border-b-2 border-transparent data-[state=active]:border-[color:var(--bg-accent-solid)] data-[state=active]:bg-transparent"
                  >
                    Job Seeker
                  </TabsTrigger>
                  <TabsTrigger
                    value="company"
                    className="border-b-2 border-transparent data-[state=active]:border-[color:var(--bg-accent-solid)] data-[state=active]:bg-transparent"
                  >
                    Company
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="job-seeker" className="space-y-3">
                  <div className='mt-3'>
                    <h2 className="mb-2 text-center text-2xl font-bold text-foreground">
                      Get more opportunities
                    </h2>
                  </div>

                  {/* Google Sign Up */}
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-border"
                    size="lg"
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Sign Up with Google
                  </Button>

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
                </TabsContent>

                <TabsContent value="company" className="space-y-6">
                  <div>
                    <h2 className="mb-2 text-2xl font-bold text-foreground">
                      Grow your team
                    </h2>
                  </div>
                  <p className="text-muted-foreground">
                    Company signup form coming soon...
                  </p>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
