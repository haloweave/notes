'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/auth-client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ArrowLeft, Mail } from 'lucide-react';

interface LoginDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    title?: string;
    description?: string;
}

export function LoginDialog({
    open,
    onOpenChange,
    onSuccess,
    title = "Save Your Song",
    description = "Sign in to save your song and access it anytime from your dashboard."
}: LoginDialogProps) {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState<'email' | 'otp'>('email');
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await authClient.emailOtp.sendVerificationOtp({
                email,
                type: 'sign-in',
            });

            if (result.error) {
                setError(result.error.message || 'Failed to send verification code');
                setLoading(false);
                return;
            }

            setStep('otp');
            setLoading(false);
            // Focus first OTP input
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
        } catch (err: any) {
            console.error('Send OTP error:', err);
            setError(err.message || 'Failed to send verification code');
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (providedOtp?: string) => {
        const otpCode = providedOtp || otp.join('');
        if (otpCode.length !== 6) {
            setError('Please enter all 6 digits');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const result = await authClient.signIn.emailOtp({
                email,
                otp: otpCode,
            });

            if (result.error) {
                setError(result.error.message || 'Invalid verification code');
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
                setLoading(false);
                return;
            }

            // Success
            setLoading(false);
            onSuccess?.();
            onOpenChange(false);

            // Reset form
            setStep('email');
            setEmail('');
            setOtp(['', '', '', '', '', '']);
            setError('');
        } catch (err: any) {
            console.error('Verify OTP error:', err);
            setError(err.message || 'Verification failed');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
            setLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all digits are entered
        if (newOtp.every(digit => digit !== '')) {
            const otpCode = newOtp.join('');
            setTimeout(() => handleVerifyOTP(otpCode), 100);
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();

        // Only process if it's 6 digits
        if (/^\d{6}$/.test(pastedData)) {
            const digits = pastedData.split('');
            setOtp(digits);
            inputRefs.current[5]?.focus();
            // Auto-submit after paste
            setTimeout(() => handleVerifyOTP(), 100);
        }
    };

    const handleResendOTP = async () => {
        setError('');
        setLoading(true);
        setOtp(['', '', '', '', '', '']);

        try {
            const result = await authClient.emailOtp.sendVerificationOtp({
                email,
                type: 'sign-in',
            });

            if (result.error) {
                setError(result.error.message || 'Failed to resend code');
            } else {
                inputRefs.current[0]?.focus();
            }
        } catch (err: any) {
            setError(err.message || 'Failed to resend code');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');

        try {
            await authClient.signIn.social({
                provider: 'google',
                callbackURL: window.location.href, // Return to current page
            });
        } catch (err: any) {
            console.error('Google sign in error:', err);
            setError(err.message || 'Failed to sign in with Google');
            setLoading(false);
        }
    };

    const handleBack = () => {
        setStep('email');
        setOtp(['', '', '', '', '', '']);
        setError('');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    {step === 'otp' && (
                        <button
                            onClick={handleBack}
                            className="absolute left-4 top-4 p-2 rounded-md hover:bg-accent transition-colors"
                            disabled={loading}
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                    )}
                    <DialogTitle className="text-2xl">
                        {step === 'email' ? title : 'Enter verification code'}
                    </DialogTitle>
                    <DialogDescription>
                        {step === 'email'
                            ? description
                            : `We sent a 6-digit code to ${email}`}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {step === 'email' ? (
                        <>
                            {/* Google Sign In */}
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                            >
                                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Continue with Google
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">
                                        Or continue with email
                                    </span>
                                </div>
                            </div>

                            {/* Email Form */}
                            <form onSubmit={handleSendOTP} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={loading}
                                            className="pl-10"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        We'll send you a 6-digit code to sign in
                                    </p>
                                </div>

                                {error && (
                                    <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 p-3 rounded-md">
                                        {error}
                                    </div>
                                )}

                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <LoadingSpinner size="sm" className="mr-2" />
                                            Sending code...
                                        </>
                                    ) : (
                                        'Continue'
                                    )}
                                </Button>
                            </form>
                        </>
                    ) : (
                        <>
                            {/* OTP Input */}
                            <div className="flex justify-center gap-2" onPaste={handlePaste}>
                                {otp.map((digit, index) => (
                                    <Input
                                        key={index}
                                        ref={(el) => { inputRefs.current[index] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className="w-12 h-14 text-center text-2xl font-bold"
                                        disabled={loading}
                                    />
                                ))}
                            </div>

                            {error && (
                                <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 p-3 rounded-md">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="button"
                                onClick={() => handleVerifyOTP()}
                                className="w-full"
                                disabled={loading || otp.some(d => !d)}
                            >
                                {loading ? (
                                    <>
                                        <LoadingSpinner size="sm" className="mr-2" />
                                        Verifying...
                                    </>
                                ) : (
                                    'Verify & Sign In'
                                )}
                            </Button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    className="text-sm text-primary hover:underline"
                                    disabled={loading}
                                >
                                    Didn't receive the code? Resend
                                </button>
                            </div>

                            <p className="text-center text-xs text-muted-foreground">
                                The code expires in 5 minutes
                            </p>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
