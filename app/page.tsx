'use client';

import { useState } from 'react';
import { signIn, signUp } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up
        const result = await signUp.email({
          email,
          password,
          name: 'Test User',
        });

        if (result.error) {
          setError(result.error.message || 'Sign up failed');
        } else {
          router.push('/generate');
        }
      } else {
        // Sign in
        const result = await signIn.email({
          email,
          password,
        });

        if (result.error) {
          setError(result.error.message || 'Invalid email or password');
        } else {
          router.push('/generate');
        }
      }
    } catch (err: any) {
      setError(err.message || (isSignUp ? 'Sign up failed' : 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f9fafb'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '40px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          marginBottom: '8px',
          textAlign: 'center',
          color: '#000'
        }}>
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h1>
        <p style={{
          color: '#666',
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          {isSignUp ? 'Sign up to generate music' : 'Sign in to generate music'}
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontWeight: '600',
              marginBottom: '8px',
              color: '#171717'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@example.com"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                color: '#000',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontWeight: '600',
              marginBottom: '8px',
              color: '#171717'
            }}>
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
                padding: '12px',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                color: '#000',
                fontSize: '16px'
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: '12px',
              background: '#fee',
              border: '1px solid #fcc',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <p style={{ color: '#c00', fontSize: '14px', margin: 0 }}>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{
          marginTop: '20px',
          textAlign: 'center'
        }}>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#6366f1',
              cursor: 'pointer',
              fontSize: '14px',
              textDecoration: 'underline'
            }}
          >
            {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
          </button>
        </div>

        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#f9fafb',
          borderRadius: '8px'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#666',
            margin: 0,
            textAlign: 'center'
          }}>
            <strong style={{ color: '#000' }}>Test Credentials:</strong><br />
            Email: test@example.com<br />
            Password: example123
          </p>
        </div>
      </div>
    </div>
  );
}
