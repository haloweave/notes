'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Menu } from 'lucide-react';
import { useState } from 'react';
import { Lora } from 'next/font/google';

const lora = Lora({ subsets: ['latin'] });

export default function PrivacyPage() {
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen">
            <div className="min-h-screen relative flex flex-col" style={{ backgroundImage: 'url("/web background image.png")', backgroundSize: 'cover', backgroundPosition: 'center center', backgroundAttachment: 'fixed' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a2a3f]/50 via-[#0f1e30]/45 to-[#1a2a3f]/50"></div>

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

                <div className="relative z-10 flex flex-col min-h-screen">
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
                                    <button
                                        onClick={() => router.push('/how-it-works')}
                                        className="text-[#E0F4FF] hover:text-[#F5E6B8] text-lg py-3 px-4 rounded-lg hover:bg-[#E0F4FF]/10 transition-all duration-200 text-left"
                                    >
                                        How It Works
                                    </button>
                                    <button
                                        onClick={() => router.push('/')}
                                        className="text-[#E0F4FF] hover:text-[#F5E6B8] text-lg py-3 px-4 rounded-lg hover:bg-[#E0F4FF]/10 transition-all duration-200 text-left"
                                    >
                                        About
                                    </button>
                                    <button className="text-[#F5E6B8] text-lg py-3 px-4 rounded-lg bg-[#E0F4FF]/10">
                                        Privacy & GDPR
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex items-center justify-center px-4 py-8 md:py-12">
                        <div className="max-w-4xl mx-auto w-full">
                            <h1 className={`text-[#E8DCC0] text-2xl md:text-3xl lg:text-4xl text-center mb-6 md:mb-8 ${lora.className}`}>
                                Privacy & Data Protection
                            </h1>

                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 md:p-12 lg:p-16 border border-white/20 shadow-xl">
                                <div className="space-y-6 md:space-y-8 text-white/90">
                                    <p className="leading-relaxed text-base md:text-lg">
                                        At Huggnote, we take your privacy seriously. We comply with the EU General Data Protection Regulation (GDPR) and other applicable data protection laws, and we are committed to protecting your personal information.
                                    </p>

                                    <div>
                                        <h2 className={`text-[#E8DCC0] text-xl md:text-2xl mb-4 ${lora.className}`} style={{ fontWeight: 600 }}>
                                            What Data We Collect
                                        </h2>
                                        <p className="leading-relaxed text-base md:text-lg mb-4">
                                            We collect only the information necessary to create and deliver your bespoke song. This may include your name, email address, and the details you provide about the song recipient.
                                        </p>
                                        <p className="leading-relaxed text-base md:text-lg">
                                            Payments are processed securely by our payment service provider, Stripe. We do not store or process your payment card details.
                                        </p>
                                    </div>

                                    <div>
                                        <h2 className={`text-[#E8DCC0] text-xl md:text-2xl mb-4 ${lora.className}`} style={{ fontWeight: 600 }}>
                                            How We Use Your Data
                                        </h2>
                                        <p className="leading-relaxed text-base md:text-lg mb-3">
                                            We use your personal information to:
                                        </p>
                                        <ul className="list-disc list-inside space-y-2 text-base md:text-lg ml-4">
                                            <li>Create and deliver your personalised song</li>
                                            <li>Communicate with you about your order</li>
                                            <li>Provide customer support</li>
                                            <li>Manage payments, refunds, and related administration</li>
                                        </ul>
                                        <p className="leading-relaxed text-base md:text-lg mt-4">
                                            The legal basis for processing your personal data is to fulfil our contract with you and, where appropriate, our legitimate business interests.
                                        </p>
                                        <p className="leading-relaxed text-base md:text-lg mt-3">
                                            We do not sell your personal data, and we do not share it with third parties for their own marketing purposes.
                                        </p>
                                    </div>

                                    <div>
                                        <h2 className={`text-[#E8DCC0] text-xl md:text-2xl mb-4 ${lora.className}`} style={{ fontWeight: 600 }}>
                                            Service Providers
                                        </h2>
                                        <p className="leading-relaxed text-base md:text-lg">
                                            We use trusted third-party service providers to help us operate our services, such as payment processing and technical infrastructure. These providers process personal data only as necessary to provide their services to us and in accordance with applicable data protection laws.
                                        </p>
                                    </div>

                                    <div>
                                        <h2 className={`text-[#E8DCC0] text-xl md:text-2xl mb-4 ${lora.className}`} style={{ fontWeight: 600 }}>
                                            International Data Transfers
                                        </h2>
                                        <p className="leading-relaxed text-base md:text-lg">
                                            Some of our service providers operate internationally. As a result, personal data may be processed outside your country of residence, including outside the European Economic Area (EEA). Where required by law, we rely on appropriate safeguards to protect such transfers, in accordance with data protection legislation.
                                        </p>
                                    </div>

                                    <div>
                                        <h2 className={`text-[#E8DCC0] text-xl md:text-2xl mb-4 ${lora.className}`} style={{ fontWeight: 600 }}>
                                            Data Storage & Security
                                        </h2>
                                        <p className="leading-relaxed text-base md:text-lg">
                                            We implement appropriate technical and organisational measures to protect personal data against unauthorised access, loss, misuse, or alteration. Access to personal data is restricted to those who need it to provide our services.
                                        </p>
                                    </div>

                                    <div>
                                        <h2 className={`text-[#E8DCC0] text-xl md:text-2xl mb-4 ${lora.className}`} style={{ fontWeight: 600 }}>
                                            Your Rights
                                        </h2>
                                        <p className="leading-relaxed text-base md:text-lg mb-3">
                                            Depending on your location, you may have rights under data protection laws, including the right to:
                                        </p>
                                        <ul className="list-disc list-inside space-y-2 text-base md:text-lg ml-4">
                                            <li>Access your personal data</li>
                                            <li>Correct inaccurate or incomplete data</li>
                                            <li>Request deletion of your personal data</li>
                                            <li>Restrict or object to certain processing</li>
                                            <li>Request a copy of the data we hold about you</li>
                                        </ul>
                                        <p className="leading-relaxed text-base md:text-lg mt-4">
                                            To exercise these rights, please contact us at{' '}
                                            <a href="mailto:vips@huggnote.com" className="text-[#87CEEB] hover:text-[#F5E6B8] underline transition-colors">
                                                vips@huggnote.com
                                            </a>
                                        </p>
                                    </div>

                                    <div>
                                        <h2 className={`text-[#E8DCC0] text-xl md:text-2xl mb-4 ${lora.className}`} style={{ fontWeight: 600 }}>
                                            Data Retention
                                        </h2>
                                        <p className="leading-relaxed text-base md:text-lg">
                                            We retain personal data only for as long as necessary to provide our services, comply with legal and accounting obligations, and resolve disputes. You may request deletion of your personal data at any time, subject to applicable legal requirements.
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-center py-4">
                                        <div className="h-px bg-gradient-to-r from-transparent via-[#E8DCC0]/40 to-transparent w-full"></div>
                                    </div>

                                    <div className="text-center">
                                        <p className="text-sm md:text-base text-white/60">
                                            Last updated: December 2025
                                        </p>
                                        <p className="text-sm md:text-base text-white/60 mt-2">
                                            For our full privacy policy or any questions, please contact{' '}
                                            <a href="mailto:vips@huggnote.com" className="text-[#87CEEB] hover:text-[#F5E6B8] underline transition-colors">
                                                vips@huggnote.com
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            </div>
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
