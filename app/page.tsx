'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AuthModal } from '@/components/auth/AuthModal';
import { FavouriteIcon, GiftIcon, SparklesIcon } from 'hugeicons-react';



export default function LandingPage() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-x-hidden font-sans text-slate-900 bg-white">
      {/* Background Image Layer */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/web background image.png')" }}
      />

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-8 text-center">

        {/* Hero Logo */}
        <div className="mb-8 animate-in fade-in zoom-in duration-1000">
          <Image
            src="/huggnote bespoke logo.png"
            alt="Huggnote"
            width={600}
            height={200}
            className="w-[300px] md:w-[500px] h-auto drop-shadow-md"
            priority
          />
        </div>

        {/* Headlines & Copy */}
        <div className="max-w-4xl mx-auto space-y-10 mb-16 animate-in slide-in-from-bottom-5 duration-1000 delay-150 fill-mode-backwards">
          <h1 className="text-3xl md:text-4xl font-normal tracking-tight text-white/90 drop-shadow-xl" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
            The most magical gift they&apos;ll get this holiday!
          </h1>

          {/* Feature Icons */}
          <div className="flex flex-wrap justify-center gap-10 md:gap-20 py-4">
            <div className="flex flex-col items-center gap-3">
              <FavouriteIcon className="w-14 h-14 md:w-16 md:h-16 text-white drop-shadow-lg stroke-[1.5]" />
              <span className="font-medium text-[#fae8b4] drop-shadow-md text-base md:text-lg tracking-wide">Personalized</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <GiftIcon className="w-14 h-14 md:w-16 md:h-16 text-white drop-shadow-lg stroke-[1.5]" />
              <span className="font-medium text-[#fae8b4] drop-shadow-md text-base md:text-lg tracking-wide">Beautiful Delivery</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <SparklesIcon className="w-14 h-14 md:w-16 md:h-16 text-white drop-shadow-lg stroke-[1.5]" />
              <span className="font-medium text-[#fae8b4] drop-shadow-md text-base md:text-lg tracking-wide">Magical Experience</span>
            </div>
          </div>

          <div className="space-y-2 text-white/90 text-lg md:text-xl drop-shadow-md leading-relaxed max-w-2xl mx-auto font-normal">
            <p>
              The perfect gift for those you love most. <br className="hidden md:block" />
              Their own Christmas song — giftwrapped in emotion.
            </p>
            <p className="text-base md:text-lg opacity-80">
              Ready in minutes and delivered in a magical festive experience
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-5 animate-in slide-in-from-bottom-5 duration-1000 delay-300 fill-mode-backwards items-center">
          <button
            onClick={() => setIsAuthOpen(true)}
            className="px-8 py-4 rounded-full bg-[#fae8b4] text-slate-900 font-bold text-lg md:text-xl hover:bg-[#fff5d6] hover:scale-105 transition-all shadow-[0_0_20px_rgba(250,232,180,0.5)] border-2 border-[#fae8b4] hover:border-[#fff5d6]"
          >
            Create My Huggnote
          </button>

          <button
            onClick={() => setIsAuthOpen(true)}
            className="px-8 py-4 rounded-full bg-black/20 backdrop-blur-md border border-white/30 text-white font-medium text-lg hover:bg-black/40 hover:-translate-y-0.5 transition-all"
          >
            Login
          </button>
        </div>
      </main>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
