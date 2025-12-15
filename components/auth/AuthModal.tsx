'use client';

import { useState } from 'react';
import { signIn, signUp } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { XIcon } from 'lucide-react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const router = useRouter();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isSignUp) {
                const result = await signUp.email({
                    email,
                    password,
                    name: 'Test User',
                });

                if (result.error) {
                    setError(result.error.message || 'Sign up failed');
                } else {
                    router.push('/dashboard');
                }
            } else {
                const result = await signIn.email({
                    email,
                    password,
                });

                if (result.error) {
                    setError(result.error.message || 'Invalid email or password');
                } else {
                    router.push('/dashboard');
                }
            }
        } catch (err: any) {
            setError(err.message || (isSignUp ? 'Sign up failed' : 'Login failed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={(e) => {
                // Close on background click
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

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {isSignUp ? 'Create Account' : 'Welcome back'}
                    </h2>
                    <p className="text-gray-500 text-sm">
                        {isSignUp ? 'Sign up to create your song.' : 'Sign in to access your songs and orders.'}
                    </p>
                </div>

                <div className="space-y-4">
                    <button
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                        type="button"
                        onClick={async () => {
                            await signIn.social({
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
                            <span className="bg-white px-2 text-gray-400 font-medium">or</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label htmlFor="login-email" className="block text-sm font-semibold text-gray-700">Email</label>
                                <input
                                    type="email"
                                    id="login-email"
                                    placeholder="you@example.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900 placeholder:text-gray-400"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="login-password" className="block text-sm font-semibold text-gray-700">Password</label>

                                <input
                                    type="password"
                                    id="login-password"
                                    placeholder="••••••••"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900 placeholder:text-gray-400"
                                />
                            </div>
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
                            className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 active:scale-[0.98] transition-all"
                            disabled={loading}
                        >
                            {loading
                                ? (isSignUp ? 'Signing up...' : 'Signing in...')
                                : (isSignUp ? 'Sign Up' : 'Sign In')}
                        </button>
                    </form>

                    <div className="text-center pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError('');
                            }}
                            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm hover:underline transition-all"
                        >
                            {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
