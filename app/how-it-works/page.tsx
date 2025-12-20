'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Menu, Sparkles, Heart, Music, Gift, Mail } from 'lucide-react';
import { useState } from 'react';
import { Lora } from 'next/font/google';

const lora = Lora({ subsets: ['latin'] });

export default function HowItWorksPage() {
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen">
            <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#1a2942] to-[#0a1628] relative overflow-hidden">
                {/* Floating Hearts */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(15)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute text-[#F5E6B8]/10"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${50 + Math.random() * 50}%`,
                                transform: `translateX(${Math.random() * 100}px) translateY(${Math.random() * 100}px) scale(${0.5 + Math.random() * 0.5})`,
                            }}
                        >
                            ♥
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
                                <button
                                    onClick={() => router.push('/pricing')}
                                    className="text-[#E0F4FF] hover:text-[#F5E6B8] text-lg py-3 px-4 rounded-lg hover:bg-[#E0F4FF]/10 transition-all duration-200 text-left"
                                >
                                    Pricing
                                </button>
                                <button className="text-[#F5E6B8] text-lg py-3 px-4 rounded-lg bg-[#E0F4FF]/10">
                                    How It Works
                                </button>
                                <button
                                    onClick={() => router.push('/')}
                                    className="text-[#E0F4FF] hover:text-[#F5E6B8] text-lg py-3 px-4 rounded-lg hover:bg-[#E0F4FF]/10 transition-all duration-200 text-left"
                                >
                                    About
                                </button>
                                <button
                                    onClick={() => router.push('/privacy')}
                                    className="text-[#E0F4FF] hover:text-[#F5E6B8] text-lg py-3 px-4 rounded-lg hover:bg-[#E0F4FF]/10 transition-all duration-200 text-left"
                                >
                                    Privacy
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="relative z-10 container mx-auto px-4 py-8 md:py-12 max-w-4xl">
                    <div className="text-center mb-8 md:mb-12">
                        <div className="flex items-center justify-center gap-3 mb-3">
                            <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-[#F5E6B8]" />
                            <h1 className={`text-3xl md:text-4xl lg:text-5xl text-[#F5E6B8] ${lora.className}`}>
                                How It Works
                            </h1>
                            <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-[#F5E6B8]" />
                        </div>
                        <p className="text-base md:text-lg text-white/80 max-w-2xl mx-auto">
                            From your heart to theirs, in four simple steps. Creating a bespoke song has never been easier—or more magical.
                        </p>
                    </div>

                    <div className="space-y-8 md:space-y-12">
                        {/* Step 1 */}
                        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
                            <div className="flex-shrink-0">
                                <div className="relative">
                                    <div className={`absolute -top-3 -left-3 text-[80px] md:text-[100px] opacity-5 text-[#F5E6B8] pointer-events-none ${lora.className}`} style={{ fontWeight: 700 }}>
                                        01
                                    </div>
                                    <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#87CEEB] to-[#4A90E2] flex items-center justify-center shadow-[0_0_30px_rgba(135,206,235,0.4)]">
                                        <Heart className="w-10 h-10 md:w-12 md:h-12 text-white" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="bg-white/10 backdrop-blur-md border-2 border-[#87CEEB]/30 rounded-xl md:rounded-2xl p-5 md:p-6 hover:border-[#F5E6B8]/40 transition-all duration-300">
                                    <div className="flex items-center gap-2 md:gap-3 mb-3">
                                        <span className={`text-3xl md:text-4xl text-[#F5E6B8]/20 ${lora.className}`} style={{ fontWeight: 700 }}>01</span>
                                        <h2 className={`text-xl md:text-2xl text-[#F5E6B8] ${lora.className}`}>Share Your Story</h2>
                                    </div>
                                    <p className="text-white/80 text-sm md:text-base mb-4 leading-relaxed">
                                        Tell us about your loved one—their quirks, their passions, the moments that make them shine. Select your Christmas theme, from Merry Christmas to Mistletoe Kisses.
                                    </p>
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#87CEEB] mt-1.5 flex-shrink-0"></div>
                                            <span className="text-white/70 text-xs md:text-sm">Our limited Holiday edition of Huggnote Bespoke is currently live</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#87CEEB] mt-1.5 flex-shrink-0"></div>
                                            <span className="text-white/70 text-xs md:text-sm">Choose your festive theme and music style</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#87CEEB] mt-1.5 flex-shrink-0"></div>
                                            <span className="text-white/70 text-xs md:text-sm">Share personal stories and cherished memories</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#87CEEB] mt-1.5 flex-shrink-0"></div>
                                            <span className="text-white/70 text-xs md:text-sm">Add special pronunciation for unique names</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="flex flex-col md:flex-row-reverse gap-6 md:gap-8 items-center">
                            <div className="flex-shrink-0">
                                <div className="relative">
                                    <div className={`absolute -top-3 -left-3 text-[80px] md:text-[100px] opacity-5 text-[#F5E6B8] pointer-events-none ${lora.className}`} style={{ fontWeight: 700 }}>
                                        02
                                    </div>
                                    <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#87CEEB] to-[#4A90E2] flex items-center justify-center shadow-[0_0_30px_rgba(135,206,235,0.4)]">
                                        <Music className="w-10 h-10 md:w-12 md:h-12 text-white" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="bg-white/10 backdrop-blur-md border-2 border-[#87CEEB]/30 rounded-xl md:rounded-2xl p-5 md:p-6 hover:border-[#F5E6B8]/40 transition-all duration-300">
                                    <div className="flex items-center gap-2 md:gap-3 mb-3">
                                        <span className={`text-3xl md:text-4xl text-[#F5E6B8]/20 ${lora.className}`} style={{ fontWeight: 700 }}>02</span>
                                        <h2 className={`text-xl md:text-2xl text-[#F5E6B8] ${lora.className}`}>We Craft Your Melody</h2>
                                    </div>
                                    <p className="text-white/80 text-sm md:text-base mb-4 leading-relaxed">
                                        Huggnote's proprietary EmotionTech and talented music team help ensure your words are transformed into a premium quality, emotion-driven masterpiece.
                                    </p>
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#87CEEB] mt-1.5 flex-shrink-0"></div>
                                            <span className="text-white/70 text-xs md:text-sm">Professional composition and arrangement</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#87CEEB] mt-1.5 flex-shrink-0"></div>
                                            <span className="text-white/70 text-xs md:text-sm">Personalised lyrics based on your story</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#87CEEB] mt-1.5 flex-shrink-0"></div>
                                            <span className="text-white/70 text-xs md:text-sm">Handcrafted by expert composers</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#87CEEB] mt-1.5 flex-shrink-0"></div>
                                            <span className="text-white/70 text-xs md:text-sm">Express delivery available for urgent gifts</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
                            <div className="flex-shrink-0">
                                <div className="relative">
                                    <div className={`absolute -top-3 -left-3 text-[80px] md:text-[100px] opacity-5 text-[#F5E6B8] pointer-events-none ${lora.className}`} style={{ fontWeight: 700 }}>
                                        03
                                    </div>
                                    <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#87CEEB] to-[#4A90E2] flex items-center justify-center shadow-[0_0_30px_rgba(135,206,235,0.4)]">
                                        <Gift className="w-10 h-10 md:w-12 md:h-12 text-white" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="bg-white/10 backdrop-blur-md border-2 border-[#87CEEB]/30 rounded-xl md:rounded-2xl p-5 md:p-6 hover:border-[#F5E6B8]/40 transition-all duration-300">
                                    <div className="flex items-center gap-2 md:gap-3 mb-3">
                                        <span className={`text-3xl md:text-4xl text-[#F5E6B8]/20 ${lora.className}`} style={{ fontWeight: 700 }}>03</span>
                                        <h2 className={`text-xl md:text-2xl text-[#F5E6B8] ${lora.className}`}>Preview & Perfect</h2>
                                    </div>
                                    <p className="text-white/80 text-sm md:text-base mb-4 leading-relaxed">
                                        Listen to your song and fall in love with every note before we deliver. We want you to be absolutely delighted with your bespoke creation.
                                    </p>
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#87CEEB] mt-1.5 flex-shrink-0"></div>
                                            <span className="text-white/70 text-xs md:text-sm">Preview your personalised song</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#87CEEB] mt-1.5 flex-shrink-0"></div>
                                            <span className="text-white/70 text-xs md:text-sm">Review lyrics and melody</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#87CEEB] mt-1.5 flex-shrink-0"></div>
                                            <span className="text-white/70 text-xs md:text-sm">Request adjustments if needed</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#87CEEB] mt-1.5 flex-shrink-0"></div>
                                            <span className="text-white/70 text-xs md:text-sm">Approve before final delivery</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div className="flex flex-col md:flex-row-reverse gap-6 md:gap-8 items-center">
                            <div className="flex-shrink-0">
                                <div className="relative">
                                    <div className={`absolute -top-3 -left-3 text-[80px] md:text-[100px] opacity-5 text-[#F5E6B8] pointer-events-none ${lora.className}`} style={{ fontWeight: 700 }}>
                                        04
                                    </div>
                                    <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#87CEEB] to-[#4A90E2] flex items-center justify-center shadow-[0_0_30px_rgba(135,206,235,0.4)]">
                                        <Mail className="w-10 h-10 md:w-12 md:h-12 text-white" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="bg-white/10 backdrop-blur-md border-2 border-[#87CEEB]/30 rounded-xl md:rounded-2xl p-5 md:p-6 hover:border-[#F5E6B8]/40 transition-all duration-300">
                                    <div className="flex items-center gap-2 md:gap-3 mb-3">
                                        <span className={`text-3xl md:text-4xl text-[#F5E6B8]/20 ${lora.className}`} style={{ fontWeight: 700 }}>04</span>
                                        <h2 className={`text-xl md:text-2xl text-[#F5E6B8] ${lora.className}`}>Deliver the Magic</h2>
                                    </div>
                                    <p className="text-white/80 text-sm md:text-base mb-4 leading-relaxed">
                                        Recipient receives your alert (via WhatsApp, SMS or Email) that they've received a Gift from Huggnote Bespoke. Click to hear their song—beautifully presented as any premium gift should be—opens in a stunning Christmas video card display. High quality audio streaming and downloadable to keep forever.
                                    </p>
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#87CEEB] mt-1.5 flex-shrink-0"></div>
                                            <span className="text-white/70 text-xs md:text-sm">Beautiful animated gift box reveal</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#87CEEB] mt-1.5 flex-shrink-0"></div>
                                            <span className="text-white/70 text-xs md:text-sm">Festive slideshow with falling snow</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#87CEEB] mt-1.5 flex-shrink-0"></div>
                                            <span className="text-white/70 text-xs md:text-sm">Share via WhatsApp, SMS or Email</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#87CEEB] mt-1.5 flex-shrink-0"></div>
                                            <span className="text-white/70 text-xs md:text-sm">Download and treasure forever</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="mt-12 md:mt-16 text-center">
                        <div className="bg-white/5 backdrop-blur-md border border-[#87CEEB]/30 rounded-2xl md:rounded-3xl p-6 md:p-8">
                            <h3 className={`text-xl md:text-2xl text-[#F5E6B8] mb-3 ${lora.className}`}>
                                Ready to Create Something Magical?
                            </h3>
                            <p className="text-white/80 text-sm md:text-base mb-6 max-w-2xl mx-auto">
                                Transform your heartfelt stories into a personalised song that your loved ones will treasure forever.
                            </p>
                            <button
                                onClick={() => router.push('/compose/select-package')}
                                className={`px-8 md:px-10 py-3 md:py-4 bg-gradient-to-r from-[#87CEEB] to-[#4A90E2] text-white rounded-xl transition-all duration-200 hover:shadow-[0_0_30px_rgba(135,206,235,0.4)] shadow-[0_8px_30px_rgba(135,206,235,0.3)] ${lora.className}`}
                                style={{ fontWeight: 600 }}
                            >
                                Get Started Today
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
