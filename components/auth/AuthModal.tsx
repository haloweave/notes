'use client';

import { useState } from 'react';
import { signIn, signUp } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

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
        <div className="modal-overlay" onClick={(e) => {
            // Close on background click
            if (e.target === e.currentTarget) onClose();
        }}>
            <div className="modal-card">
                <button className="modal-close" onClick={onClose}>&times;</button>
                <div className="modal-header">
                    <h2>{isSignUp ? 'Create Account' : 'Welcome back'}</h2>
                    <p className="muted">{isSignUp ? 'Sign up to create your song.' : 'Sign in to access your songs and orders.'}</p>
                </div>
                <div className="modal-body">
                    <button className="btn btn-secondary google-btn" type="button">
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="20" />
                        Continue with Google
                    </button>

                    <div className="divider"><span>or</span></div>

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="login-email">Email</label>
                            <input
                                type="email"
                                id="login-email"
                                placeholder="you@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="login-password">Password</label>
                            <input
                                type="password"
                                id="login-password"
                                placeholder="••••••••"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {error && (
                            <div className="error" style={{ marginBottom: '16px', color: 'var(--color-error)' }}>
                                {error}
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary full-width" disabled={loading}>
                            {loading
                                ? (isSignUp ? 'Signing up...' : 'Signing in...')
                                : (isSignUp ? 'Sign Up' : 'Sign In')}
                        </button>
                    </form>

                    <div style={{ marginTop: '16px', textAlign: 'center' }}>
                        <button
                            type="button"
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError('');
                            }}
                            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', font: 'inherit', fontWeight: 500 }}
                        >
                            {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
