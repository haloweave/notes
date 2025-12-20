'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Menu } from 'lucide-react';
import { useState } from 'react';
import { Lora } from 'next/font/google';

const lora = Lora({ subsets: ['latin'] });

export default function PricingPage() {
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen">
            <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#1a2942] to-[#0a1628] relative overflow-hidden">
                {/* Floating Musical Notes */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(15)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute text-[#F5E6B8]/10 text-2xl md:text-4xl"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                transform: `translateX(${Math.random() * 100}px) translateY(${Math.random() * 100}px) rotate(${Math.random() * 360}deg)`,
                                opacity: 0
                            }}
                        >
                            ♪
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div className="relative z-20">
                    {/* Mobile Header */}
                    <div className="flex md:hidden items-center justify-between px-4 pt-6 pb-3">
                        <button
                            onClick={() => router.back()}
                            className="p-2.5 rounded-lg bg-[#1a3d5f]/80 backdrop-blur-sm hover:bg-[#1a3d5f]/90 transition-all duration-200 shadow-lg"
                            aria-label="Back"
                        >
                            <ArrowLeft className="w-6 h-6 text-[#E0F4FF]" />
                        </button>
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2.5 rounded-lg bg-[#1a3d5f]/80 backdrop-blur-sm hover:bg-[#1a3d5f]/90 transition-all duration-200 shadow-lg"
                            aria-label="Menu"
                        >
                            <Menu className="w-6 h-6 text-[#E0F4FF]" />
                        </button>
                    </div>

                    {/* Desktop Header */}
                    <div className="hidden md:flex items-center justify-center px-8 pt-8 pb-4 relative">
                        <button
                            onClick={() => router.back()}
                            className="absolute left-8 p-3 rounded-lg bg-[#1a3d5f]/80 backdrop-blur-sm hover:bg-[#1a3d5f]/90 transition-all duration-200 shadow-lg"
                            aria-label="Back"
                        >
                            <ArrowLeft className="w-7 h-7 text-[#E0F4FF]" />
                        </button>
                        <img src="/huggnote bespoke logo.png" alt="Huggnote Bespoke Songs" className="h-20 md:h-24 w-auto" />
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="absolute right-8 p-3 rounded-lg bg-[#1a3d5f]/80 backdrop-blur-sm hover:bg-[#1a3d5f]/90 transition-all duration-200 shadow-lg"
                            aria-label="Menu"
                        >
                            <Menu className="w-7 h-7 text-[#E0F4FF]" />
                        </button>
                    </div>

                    {/* Mobile Logo */}
                    <div className="flex md:hidden justify-center pb-4">
                        <img src="/huggnote bespoke logo.png" alt="Huggnote Bespoke Songs" className="h-16 w-auto" />
                    </div>

                    {/* Slide-out Menu */}
                    <div
                        className={`fixed top-0 right-0 h-full w-64 md:w-80 bg-gradient-to-br from-[#1a3d5f] to-[#0f2438] shadow-2xl z-40 border-l border-[#E0F4FF]/20 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                            }`}
                    >
                        <div className="flex flex-col h-full pt-20 px-6">
                            <nav className="flex flex-col gap-4">
                                <button
                                    onClick={() => router.push('/')}
                                    className="text-[#E0F4FF] hover:text-[#F5E6B8] text-lg py-3 px-4 rounded-lg hover:bg-[#E0F4FF]/10 transition-all duration-200 text-left"
                                >
                                    Home
                                </button>
                                <button className="text-[#F5E6B8] text-lg py-3 px-4 rounded-lg bg-[#E0F4FF]/10">
                                    Pricing
                                </button>
                                <button
                                    onClick={() => router.push('/how-it-works')}
                                    className="text-[#E0F4FF] hover:text-[#F5E6B8] text-lg py-3 px-4 rounded-lg hover:bg-[#E0F4FF]/10 transition-all duration-200 text-left"
                                >
                                    How It Works
                                </button>
                                <button
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="text-[#E0F4FF] hover:text-[#F5E6B8] text-lg py-3 px-4 rounded-lg hover:bg-[#E0F4FF]/10 transition-all duration-200 text-left"
                                >
                                    About
                                </button>
                                <button
                                    onClick={() => router.push('/privacy')}
                                    className="text-[#E0F4FF] hover:text-[#F5E6B8] text-lg py-3 px-4 rounded-lg hover:bg-[#E0F4FF]/10 transition-all duration-200 text-left"
                                >
                                    Privacy & GDPR
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="relative z-10 container mx-auto px-6 md:px-8 py-12 md:py-16 max-w-4xl">
                    <div className="text-center mb-12 md:mb-16">
                        <h1 className={`text-4xl md:text-6xl lg:text-7xl text-[#F5E6B8] mb-6 ${lora.className}`}>
                            Pricing
                        </h1>
                        <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto">
                            Bespoke songs, composed by hand with love. Choose the perfect gift for your loved ones.
                        </p>
                    </div>

                    <div className="space-y-12 md:space-y-16">
                        {/* Solo Serenade */}
                        <div className="bg-white/5 backdrop-blur-md border border-[#87CEEB]/30 rounded-3xl p-8 md:p-12">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
                                <div>
                                    <h2 className={`text-3xl md:text-4xl text-[#87CEEB] mb-2 ${lora.className}`}>
                                        Solo Serenade
                                    </h2>
                                    <p className="text-lg md:text-xl text-white/70">
                                        One bespoke song, crafted with love
                                    </p>
                                </div>
                                <div className={`text-4xl md:text-5xl text-[#87CEEB] ${lora.className}`} style={{ fontWeight: 600 }}>
                                    €37
                                </div>
                            </div>
                            <p className="text-base md:text-lg text-white/80 leading-relaxed">
                                Perfect for celebrating one special person in your life. Our talented composers will create a fully personalised song that captures their unique spirit, with your choice of genre, style, and heartfelt message woven into every note.
                            </p>
                        </div>

                        {/* Merry Medley - Most Popular */}
                        <div className="bg-gradient-to-br from-[#1a3d5f]/80 to-[#0f2438]/80 backdrop-blur-md border-2 border-[#F5E6B8]/40 rounded-3xl p-8 md:p-12 shadow-[0_0_60px_rgba(245,230,184,0.2)]">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-gradient-to-r from-[#F5E6B8] to-[#D4AF37] px-4 py-1.5 rounded-full">
                                    <span className={`text-[#1a3d5f] text-sm ${lora.className}`} style={{ fontWeight: 600 }}>
                                        Most Popular
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
                                <div>
                                    <h2 className={`text-3xl md:text-4xl text-[#F5E6B8] mb-2 ${lora.className}`}>
                                        Merry Medley
                                    </h2>
                                    <p className="text-lg md:text-xl text-white/70">
                                        Up to 5 bespoke songs for your loved ones
                                    </p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-xl md:text-2xl text-white/40 line-through">€185</span>
                                        <span className="text-[#87CEEB] text-sm bg-[#87CEEB]/20 px-3 py-1 rounded-full">
                                            58% savings
                                        </span>
                                    </div>
                                    <div className={`text-4xl md:text-5xl text-[#F5E6B8] ${lora.className}`} style={{ fontWeight: 600 }}>
                                        €87
                                    </div>
                                </div>
                            </div>
                            <p className="text-base md:text-lg text-white/90 leading-relaxed">
                                Celebrate your entire family with a collection of up to 5 personalised songs. Each melody is uniquely crafted to honour the special people in your life— from partners to parents, siblings to best friends. Save 58% whilst giving the gift of music to everyone you cherish this Christmas.
                            </p>
                        </div>

                        {/* What's Included */}
                        <div className="bg-white/5 backdrop-blur-md border border-[#87CEEB]/20 rounded-3xl p-8 md:p-12">
                            <h3 className={`text-2xl md:text-3xl text-[#F5E6B8] mb-6 md:mb-8 ${lora.className}`}>
                                Every Song Includes
                            </h3>
                            <ul className="space-y-4 md:space-y-5 text-base md:text-lg text-white/80">
                                <li className="flex items-start gap-3">
                                    <span className="text-[#F5E6B8] mt-1">♪</span>
                                    <span>Professional composition and studio recording by talented musicians</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-[#F5E6B8] mt-1">♪</span>
                                    <span>Complete personalisation—choose your genre, style, tone, and instruments</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-[#F5E6B8] mt-1">♪</span>
                                    <span>Beautiful animated gift box reveal with falling snow and festive scenes</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-[#F5E6B8] mt-1">♪</span>
                                    <span>Shareable digital delivery—perfect for email or social media</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-[#F5E6B8] mt-1">♪</span>
                                    <span>Express festive delivery available for last-minute gifts</span>
                                </li>
                            </ul>
                        </div>

                        {/* Quote */}
                        <div className="text-center">
                            <p className={`text-lg md:text-xl text-white/70 leading-relaxed italic max-w-2xl mx-auto`}>
                                "Every song is a masterpiece. Our composers pour their hearts into every note, crafting melodies that capture the essence of your loved ones. Each creation is as unique as the person it celebrates."
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
