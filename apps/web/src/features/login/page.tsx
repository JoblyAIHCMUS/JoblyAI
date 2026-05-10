'use client';

import { Card } from '@/components/ui/card';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthLeftColumn } from '@/components/auth/AuthLeftColumn';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { LoginForm } from '@/components/auth/LoginForm';

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
              <div className="space-y-4">
                <div>
                  <h2 className="text-center text-2xl font-bold text-foreground">
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

                {/* Login Form */}
                <LoginForm />

                {/* Sign Up Link */}
                <div className="text-center text-sm">
                  <span className="text-muted-foreground">
                    Don't have an account?{' '}
                  </span>
                  <a
                    href="/signup"
                    className="font-semibold text-accent-link hover:text-accent-link-hover"
                  >
                    Sign Up
                  </a>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
