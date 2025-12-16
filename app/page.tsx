'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AuthModal } from '@/components/auth/AuthModal';
import { PremiumButton } from '@/components/ui/premium-button';
import { FavouriteIcon, GiftIcon, SparklesIcon } from 'hugeicons-react';
import { useState } from 'react';



export default function LandingPage() {
  const router = useRouter();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="relative h-screen w-full flex flex-col overflow-x-hidden overflow-y-auto font-sans text-slate-900" style={{ backgroundColor: '#2A374F' }}>
      {/* Background Image Layer */}
      <Image
        src="/web background image.png"
        alt="Background"
        fill
        className="object-cover z-0 fixed"
        priority
        quality={100}
      />

      {/* Snowfall Effect */}
      <div className="fixed inset-0 z-[5] pointer-events-none overflow-hidden">
        <div className="snowflakes" aria-hidden="true">
          <div className="snowflake">❅</div>
          <div className="snowflake">❅</div>
          <div className="snowflake">❆</div>
          <div className="snowflake">❄</div>
          <div className="snowflake">❅</div>
          <div className="snowflake">❆</div>
          <div className="snowflake">❄</div>
          <div className="snowflake">❅</div>
          <div className="snowflake">❆</div>
          <div className="snowflake">❄</div>
          <div className="snowflake">❅</div>
          <div className="snowflake">❆</div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 md:p-8 text-center min-h-full">

        {/* Hero Logo */}
        <div className="mb-4 md:mb-6 animate-in fade-in zoom-in duration-1000">
          <Image
            src="/huggnote bespoke logo.png"
            alt="Huggnote"
            width={600}
            height={200}
            className="w-[250px] md:w-[400px] lg:w-[500px] h-auto drop-shadow-md"
            priority
          />
        </div>

        {/* Headlines & Copy */}
        <div className="max-w-4xl mx-auto space-y-4 md:space-y-6 mb-6 md:mb-8 animate-in slide-in-from-bottom-5 duration-1000 delay-150 fill-mode-backwards">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-normal tracking-tight text-white/90 drop-shadow-xl" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
            The most magical gift they&apos;ll get this holiday!
          </h1>

          {/* Feature Icons */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 lg:gap-20 py-2 md:py-4">
            <div className="flex flex-col items-center gap-2">
              <FavouriteIcon className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-white drop-shadow-lg stroke-[1.5]" />
              <span className="font-medium text-[#fae8b4] drop-shadow-md text-sm md:text-base lg:text-lg tracking-wide">Personalized</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <GiftIcon className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-white drop-shadow-lg stroke-[1.5]" />
              <span className="font-medium text-[#fae8b4] drop-shadow-md text-sm md:text-base lg:text-lg tracking-wide">Beautiful Delivery</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <SparklesIcon className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-white drop-shadow-lg stroke-[1.5]" />
              <span className="font-medium text-[#fae8b4] drop-shadow-md text-sm md:text-base lg:text-lg tracking-wide">Magical Experience</span>
            </div>
          </div>

          <div className="space-y-2 text-white/90 text-base md:text-lg lg:text-xl drop-shadow-md leading-relaxed max-w-2xl mx-auto font-normal">
            <p>
              The perfect gift for those you love most. <br className="hidden md:block" />
              Their own Christmas song — giftwrapped in emotion.
            </p>
            <p className="text-sm md:text-base lg:text-lg opacity-80">
              Ready in minutes and delivered in a magical festive experience
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-5 animate-in slide-in-from-bottom-5 duration-1000 delay-300 fill-mode-backwards items-center justify-center pb-4 md:pb-0">
          <PremiumButton
            onClick={() => router.push('/compose/select-package')}
          >
            Create Bespoke Song
          </PremiumButton>

          <button
            onClick={() => setIsAuthOpen(true)}
            className="px-8 py-4 rounded-full bg-black/20 backdrop-blur-md border border-white/30 text-white font-medium text-lg hover:bg-black/40 hover:-translate-y-0.5 transition-all"
          >
            Login
          </button>
        </div>
      </main>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Snowfall CSS */}
      <style jsx>{`
        .snowflakes {
          position: absolute;
          top: -10%;
          width: 100%;
          height: 110%;
        }

        .snowflake {
          position: absolute;
          top: -10%;
          color: #fff;
          font-size: 1em;
          font-family: Arial, sans-serif;
          text-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
          animation: fall linear infinite;
          opacity: 0.8;
        }

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

        /* Individual snowflake animations with different speeds and positions */
        .snowflake:nth-child(1) {
          left: 10%;
          animation-duration: 10s;
          animation-delay: 0s;
          font-size: 1.2em;
        }

        .snowflake:nth-child(2) {
          left: 20%;
          animation-duration: 12s;
          animation-delay: 2s;
          font-size: 0.8em;
        }

        .snowflake:nth-child(3) {
          left: 30%;
          animation-duration: 15s;
          animation-delay: 4s;
          font-size: 1em;
        }

        .snowflake:nth-child(4) {
          left: 40%;
          animation-duration: 11s;
          animation-delay: 0s;
          font-size: 1.5em;
        }

        .snowflake:nth-child(5) {
          left: 50%;
          animation-duration: 13s;
          animation-delay: 3s;
          font-size: 0.9em;
        }

        .snowflake:nth-child(6) {
          left: 60%;
          animation-duration: 14s;
          animation-delay: 1s;
          font-size: 1.1em;
        }

        .snowflake:nth-child(7) {
          left: 70%;
          animation-duration: 16s;
          animation-delay: 5s;
          font-size: 1.3em;
        }

        .snowflake:nth-child(8) {
          left: 80%;
          animation-duration: 12s;
          animation-delay: 2s;
          font-size: 0.7em;
        }

        .snowflake:nth-child(9) {
          left: 90%;
          animation-duration: 11s;
          animation-delay: 4s;
          font-size: 1em;
        }

        .snowflake:nth-child(10) {
          left: 15%;
          animation-duration: 13s;
          animation-delay: 1s;
          font-size: 1.4em;
        }

        .snowflake:nth-child(11) {
          left: 35%;
          animation-duration: 14s;
          animation-delay: 3s;
          font-size: 0.8em;
        }

        .snowflake:nth-child(12) {
          left: 55%;
          animation-duration: 15s;
          animation-delay: 0s;
          font-size: 1.2em;
        }
      `}</style>
    </div>
  );
}
