'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Lora } from 'next/font/google';

const lora = Lora({ subsets: ['latin'] });

export default function ComingSoonPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message);
        setEmail('');
        setTimeout(() => {
          setSuccessMessage('');
        }, 7000);
      } else {
        setErrorMessage(data.error || 'Something went wrong');
        setTimeout(() => {
          setErrorMessage('');
        }, 5000);
      }
    } catch (error) {
      console.error('Error submitting email:', error);
      setErrorMessage('Failed to submit. Please try again.');
      setTimeout(() => {
        setErrorMessage('');
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="min-h-screen relative flex flex-col">
        {/* Fixed Background Image & Gradient */}
        <div className="fixed inset-0 w-full h-full -z-50">
          <Image
            src="/web background image.png"
            alt="Background"
            fill
            className="object-cover"
            priority
            quality={90}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a2a3f]/50 via-[#0f1e30]/45 to-[#1a2a3f]/50"></div>
        </div>

        {/* Snowfall Effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-fall"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                animationDuration: `${8 + Math.random() * 7}s`,
                animationDelay: `${Math.random() * 5}s`,
                opacity: Math.random() * 0.5 + 0.2,
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
                backgroundColor: 'white',
                borderRadius: '50%',
                boxShadow: '0 0 3px rgba(255, 255, 255, 0.8)'
              }}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Hero Section */}
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="text-center max-w-3xl" style={{ opacity: 1, transform: 'none' }}>
              {/* Huggnote Logo */}
              <img
                src="/huggnote bespoke logo.png"
                alt="Huggnote"
                className="h-32 md:h-40 lg:h-48 w-auto mx-auto mb-8 md:mb-10"
              />

              {/* Launch Date */}
              <div className="mb-8 md:mb-10">
                <p className={`text-[#87CEEB] text-xl md:text-2xl lg:text-3xl mb-2 ${lora.className}`}>
                  Launching
                </p>
                <h2 className={`text-[#F5E6B8] text-3xl md:text-5xl lg:text-6xl font-bold ${lora.className}`}>
                  23rd December 2025
                </h2>
              </div>

              {/* Main Tagline */}
              <h1 className={`text-[#E8DCC0] text-2xl md:text-3xl lg:text-4xl text-center mb-10 md:mb-12 ${lora.className}`}>
                The Gift They'll Never Forget
              </h1>

              {/* Email Signup Form */}
              <div className="max-w-md mx-auto mb-6">
                <p className={`text-white/90 text-base md:text-lg mb-4 ${lora.className}`}>
                  Enter email for VIP access and surprises
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="flex-1 px-4 py-3 md:py-4 rounded-lg bg-white/10 backdrop-blur-sm border-2 border-[#87CEEB]/30 text-white placeholder-white/50 focus:outline-none focus:border-[#F5E6B8] transition-all duration-200"
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`px-6 md:px-8 py-3 md:py-4 rounded-lg bg-gradient-to-br from-[#F5E6B8] to-[#E8D89F] hover:from-[#F8F0DC] hover:to-[#E8DCC0] text-[#1a3d5f] font-semibold shadow-[0_8px_30px_rgba(135,206,235,0.5)] hover:shadow-[0_12px_40px_rgba(135,206,235,0.7)] transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${lora.className}`}
                  >
                    {isLoading ? 'Submitting...' : 'Let Me In'}
                  </button>
                </form>


                {successMessage && (
                  <p className="mt-4 text-[#87CEEB] text-sm md:text-base animate-pulse">
                    ✨ {successMessage}
                  </p>
                )}


                {errorMessage && (
                  <p className="mt-4 text-red-400 text-sm">
                    ⚠️ {errorMessage}
                  </p>
                )}
              </div>

              {/* "Let Me In" Button */}
              {/* <div className="mt-8">
                <button
                  onClick={() => router.push('/compose/select-package')}
                  className={`inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium px-8 md:px-10 py-3 md:py-4 text-base md:text-lg rounded-lg bg-white/10 backdrop-blur-sm border-2 border-[#87CEEB]/40 text-[#E0F4FF] hover:bg-white/20 hover:border-[#F5E6B8] shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ${lora.className}`}
                >
                  Let Me In
                </button>
              </div> */}
            </div>
          </div>
        </div>

        {/* Snowfall Animation CSS */}
        <style jsx>{`
          @keyframes fall {
            0% {
              transform: translateY(0) rotate(0deg);
              opacity: 0.8;
            }
            100% {
              transform: translateY(110vh) rotate(360deg);
              opacity: 0.3;
            }
          }

          .animate-fall {
            animation: fall linear infinite;
          }
        `}</style>
      </div>
    </div>
  );
}
