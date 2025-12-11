'use client';

import { useState } from 'react';

interface LoginModalProps {
    onClose: () => void;
}

export default function LoginModal({ onClose }: LoginModalProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock login - store user in localStorage
        localStorage.setItem('huggnoteUser', JSON.stringify({ email }));
        alert('Login successful! (Mock)');
        onClose();
    };

    const handleGoogleLogin = () => {
        // Mock Google login
        localStorage.setItem('huggnoteUser', JSON.stringify({ email: 'user@gmail.com' }));
        alert('Google login successful! (Mock)');
        onClose();
    };

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '32px',
                    maxWidth: '400px',
                    width: '90%',
                    position: 'relative'
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'none',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                        color: '#666'
                    }}
                >
                    ×
                </button>

                <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Welcome back</h2>
                    <p style={{ color: '#666', margin: 0 }}>Sign in to access your songs and orders.</p>
                </div>

                <button
                    onClick={handleGoogleLogin}
                    style={{
                        width: '100%',
                        padding: '12px',
                        background: 'white',
                        border: '1px solid #e5e5e5',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        marginBottom: '16px',
                        fontSize: '14px',
                        fontWeight: '500'
                    }}
                >
                    <span>🔍</span>
                    Continue with Google
                </button>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '16px',
                    color: '#999',
                    fontSize: '14px'
                }}>
                    <div style={{ flex: 1, height: '1px', background: '#e5e5e5' }} />
                    <span>or</span>
                    <div style={{ flex: 1, height: '1px', background: '#e5e5e5' }} />
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #e5e5e5',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #e5e5e5',
                                borderRadius: '8px',
                                fontSize: '14px'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: '#6366f1',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: '600'
                        }}
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
}
