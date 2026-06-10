'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { MailCheck, RotateCw, ShieldCheck } from 'lucide-react';

import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthLeftColumn } from '@/components/auth/AuthLeftColumn';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/auth-client';
import { getPostAuthRedirect } from '@/lib/utils';
import { useUser, type User } from '@/hooks/useUser';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useUser();

  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const autoSentRef = useRef(false);

  const redirectTo = searchParams?.get('redirect');

  const sendOTP = async () => {
    if (!user?.email || resendTimer > 0 || isSending) return;

    setIsSending(true);
    setError('');
    setMessage('');

    const { error: sendError } = await authClient.emailOtp.sendVerificationOtp({
      email: user.email,
      type: 'email-verification',
    });

    setIsSending(false);

    if (sendError) {
      setError(sendError.message || 'Could not send verification code.');
      return;
    }

    setOtpSent(true);
    setResendTimer(60);
    setOtp('');
    setMessage('Verification code sent. Please check your email.');
  };

  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email || otp.length < 6 || isVerifying) return;

    setIsVerifying(true);
    setError('');
    setMessage('');

    const { data, error: verifyError } = await authClient.emailOtp.verifyEmail({
      email: user.email,
      otp,
    });

    setIsVerifying(false);

    if (verifyError) {
      setError(verifyError.message || 'Invalid verification code.');
      return;
    }

    const verifiedUser = ((data?.user as User | undefined) ?? {
      ...user,
      emailVerified: true,
    }) as User;

    queryClient.setQueryData(['user'], verifiedUser);
    await queryClient.invalidateQueries({ queryKey: ['user'] });
    router.push(getPostAuthRedirect(verifiedUser, redirectTo));
  };

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (user.emailVerified) {
      router.push(getPostAuthRedirect(user, redirectTo));
      return;
    }

    if (!autoSentRef.current) {
      autoSentRef.current = true;
      void sendOTP();
    }
  }, [user, isLoading]);

  useEffect(() => {
    if (resendTimer <= 0) return undefined;

    const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);

  if (isLoading || !user || user.emailVerified) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <AuthHeader />

        <div className="grid gap-8 lg:grid-cols-2 items-center">
          <AuthLeftColumn />

          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md border bg-white p-8 shadow-sm">
              <div className="space-y-5">
                <div className="space-y-3 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <MailCheck size={24} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">
                      Verify your email
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Enter the 6-digit code sent to {user.email}.
                    </p>
                  </div>
                </div>

                {message && (
                  <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
                    {message}
                  </div>
                )}

                {error && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <form className="space-y-4" onSubmit={verifyOTP}>
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-sm font-semibold">
                      Verification Code
                    </Label>
                    <Input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                      }
                      className="border-border text-center text-2xl tracking-widest"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 text-white hover:bg-blue-700"
                    disabled={!otpSent || otp.length < 6 || isVerifying}
                  >
                    <ShieldCheck size={18} />
                    {isVerifying ? 'Verifying...' : 'Verify Email'}
                  </Button>
                </form>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={sendOTP}
                  disabled={resendTimer > 0 || isSending}
                >
                  <RotateCw size={16} />
                  {resendTimer > 0
                    ? `Resend code in ${resendTimer}s`
                    : isSending
                    ? 'Sending...'
                    : 'Resend code'}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
