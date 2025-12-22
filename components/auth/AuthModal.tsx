'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { authClient } from '@/lib/auth-client';
import { XIcon, Mail, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'email' | 'otp'>('email');
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const router = useRouter();

    if (!isOpen) return null;

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await authClient.emailOtp.sendVerificationOtp({
                email,
                type: 'sign-in',
            });

            if (result.error) {
                setError(result.error.message || 'Failed to send verification code');
            } else {
                setStep('otp');
                // Focus first OTP input
                setTimeout(() => inputRefs.current[0]?.focus(), 100);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to send verification code');
        } finally {
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
                // Clear OTP inputs on error
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            } else {
                // Success! Close modal and redirect
                onClose();
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'Verification failed');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
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

    const handleBack = () => {
        setStep('email');
        setOtp(['', '', '', '', '', '']);
        setError('');
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="relative bg-white w-full max-w-md rounded-2xl p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                <button
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    onClick={onClose}
                >
                    <XIcon className="w-5 h-5" />
                </button>

                {step === 'otp' && (
                    <button
                        className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        onClick={handleBack}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                )}

                {step === 'email' ? (
                    <>
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Sign In
                            </h2>
                            <p className="text-gray-500 text-sm">
                                Sign in to save your songs and access them anytime from your dashboard.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <button
                                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                                type="button"
                                onClick={async () => {
                                    await authClient.signIn.social({
                                        provider: 'google',
                                        callbackURL: '/dashboard'
                                    });
                                }}
                            >
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                                Continue with Google
                            </button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-gray-100" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-2 text-gray-400 font-medium">Or continue with email</span>
                                </div>
                            </div>

                            <form onSubmit={handleSendOTP} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label htmlFor="login-email" className="block text-sm font-semibold text-gray-700">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            id="login-email"
                                            placeholder="you@example.com"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900 placeholder:text-gray-400"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        We'll send you a 6-digit code to sign in
                                    </p>
                                </div>

                                {error && (
                                    <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                                        </svg>
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="w-full py-3.5 px-4 bg-gradient-to-r from-[#2F5A8E] to-[#86CCEA] hover:opacity-90 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Sending code...
                                        </span>
                                    ) : (
                                        'Continue'
                                    )}
                                </button>
                            </form>

                            <p className="text-center text-xs text-gray-500 pt-2">
                                By continuing, you agree to our Terms of Service and Privacy Policy
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Enter verification code
                            </h2>
                            <p className="text-gray-500 text-sm">
                                We sent a 6-digit code to <strong>{email}</strong>
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex justify-center gap-2" onPaste={handlePaste}>
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => (inputRefs.current[index] = el)}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        disabled={loading}
                                    />
                                ))}
                            </div>

                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                                    </svg>
                                    {error}
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => handleVerifyOTP()}
                                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#2F5A8E] to-[#86CCEA] hover:opacity-90 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading || otp.some(d => !d)}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Verifying...
                                    </span>
                                ) : (
                                    'Verify & Sign In'
                                )}
                            </button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    className="text-indigo-600 hover:text-indigo-700 font-medium text-sm hover:underline transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={loading}
                                >
                                    Didn't receive the code? Resend
                                </button>
                            </div>

                            <p className="text-center text-xs text-gray-500">
                                The code expires in 5 minutes
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
