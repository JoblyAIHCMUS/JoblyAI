'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RotateCw } from 'lucide-react';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthLeftColumn } from '@/components/auth/AuthLeftColumn';
import { authClient } from '../../lib/auth-client';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const router = useRouter();

  const handleSendOTP = async () => {
    if (resendTimer > 0) return;
    if (!email.trim()) {
      alert('Please enter your email first.');
      return;
    }

    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email: email,
      type: 'forget-password',
    });
    
    if (error) alert(error.message);
    else {
      alert('Code sent! Check your email.');
      setOtpSent(true);
      setResendTimer(60);
      setOtp('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordsMatch) {
      alert("Passwords do not match");
      return;
    }
    try{
      const { data, error } = await authClient.emailOtp.resetPassword({
        email: email,
        otp: otp,
        password: newPassword,
      });
      if (error) alert(error.message);
      else alert("Password reset successful! You can now log in with your new password.");
      if(data) {
        setEmail('');
        setOtp('');
        setNewPassword('');
        setVerifyPassword('');
        setOtpSent(false);
        router.push('/login');
      }
    }
    catch (e) {
      console.error("Error resetting password:", e);
      alert("An error occurred while resetting your password. Please try again.");
    }
  }

  useEffect(() => {
    setPasswordsMatch(newPassword === verifyPassword && newPassword.length > 0);
  }, [newPassword, verifyPassword]);

  useEffect(() => {
    if (resendTimer <= 0) return undefined;

    const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <AuthHeader />

          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <AuthLeftColumn />

            <div className="flex items-center justify-center">
              <Card className="w-full max-w-xl border bg-white shadow-sm min-h-[600px]">
                <div className="space-y-4 p-10 h-full flex flex-col justify-center">
                  <div>
                    <h2 className="text-center text-2xl font-bold text-foreground">
                      Reset Password
                    </h2>
                    <p className="text-center text-sm text-muted-foreground mt-2">
                      Enter your email to receive a verification code
                    </p>
                  </div>

                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold">
                        Email Address
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="border-border flex-1"
                        />
                        <button
                          type="button"
                          onClick={handleSendOTP}
                          disabled={resendTimer > 0 || !email.trim()}
                          className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed inline-flex items-center gap-2"
                          title={resendTimer > 0 ? `Resend in ${resendTimer}s` : otpSent ? 'Resend OTP' : 'Send OTP'}
                        >
                          <RotateCw size={16} />
                          <span className="text-sm font-medium whitespace-nowrap">
                            {resendTimer > 0 ? `Resend ${resendTimer}s` : otpSent ? 'Resend' : 'Send OTP'}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="otp" className="text-sm font-semibold">
                          Verification Code
                        </Label>
                      </div>
                      <Input
                        id="otp"
                        type="text"
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="border-border text-center text-2xl tracking-widest"
                        disabled={!otpSent}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-sm font-semibold">
                        New Password
                      </Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="Enter your new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="border-border"
                        disabled={!otpSent}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="verifyPassword" className="text-sm font-semibold">
                        Verify New Password
                      </Label>
                      <Input
                        id="verifyPassword"
                        type="password"
                        placeholder="Confirm your new password"
                        value={verifyPassword}
                        onChange={(e) => setVerifyPassword(e.target.value)}
                        className="border-border"
                        disabled={!otpSent}
                      />
                      {verifyPassword && !passwordsMatch && (
                        <p className="text-xs text-red-600">Passwords do not match</p>
                      )}
                    </div>

                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={!otpSent || otp.length < 6 || !passwordsMatch}
                      onClick={handleSubmit}
                    >
                      Reset Password
                    </Button>

                    <div className="text-center text-sm">
                      <span className="text-muted-foreground">
                        Don't have an account?{' '}
                      </span>
                      <a
                        href="/signup"
                        className="font-semibold text-accent-link hover:text-accent-link-hover"
                      >
                        Sign up now
                      </a>
                    </div>

                    <div className="text-center text-sm">
                      <span className="text-muted-foreground">
                        Remember your password?{' '}
                      </span>
                      <a
                        href="/login"
                        className="font-semibold text-accent-link hover:text-accent-link-hover"
                      >
                        Login
                      </a>
                    </div>
                  </form>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
