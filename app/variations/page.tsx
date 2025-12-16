'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PremiumButton } from '@/components/ui/premium-button';
import { Lora } from 'next/font/google';
import { PlayIcon, CheckmarkCircle01Icon, Loading01Icon, ArrowLeft01Icon } from 'hugeicons-react';
import Image from 'next/image';

const lora = Lora({ subsets: ['latin'] });

interface Variation {
    id: number;
    style: string;
    description: string;
    lyricsPreview: string;
    audioUrl?: string;
}

export default function VariationsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [selectedVariation, setSelectedVariation] = useState<number>(1);
    const [loading, setLoading] = useState(false);
    const [playingId, setPlayingId] = useState<number | null>(null);

    // Get form data from URL params or sessionStorage
    const recipientName = searchParams.get('recipient') || 'Cyril Samuel';
    const relationship = searchParams.get('relationship') || 'mom';
    const theme = searchParams.get('theme') || 'happy holidays';

    const variations: Variation[] = [
        {
            id: 1,
            style: 'Poetic & Romantic',
            description: 'Elegant and heartfelt with poetic expressions',
            lyricsPreview: `Through the years we've shared so much, ${recipientName}\nFrom ${theme} moments, memories gold\nMy dear ${relationship}, your touch\nA story that deserves to be told`,
        },
        {
            id: 2,
            style: 'Upbeat & Playful',
            description: 'Fun and energetic with a cheerful vibe',
            lyricsPreview: `Hey ${recipientName}, remember all those days\nWhen we'd celebrate in simple ways\nMy ${relationship}, you're one of a kind\nThis ${theme} brings you to mind`,
        },
        {
            id: 3,
            style: 'Heartfelt & Emotional',
            description: 'Deep and sincere with emotional depth',
            lyricsPreview: `${recipientName}, my ${relationship}, my guiding light\nThis ${theme} message feels so right\nEvery moment that we've shared\nShows how deeply I have cared`,
        },
    ];

    const handlePlay = (id: number) => {
        if (playingId === id) {
            setPlayingId(null);
        } else {
            setPlayingId(id);
            // TODO: Implement actual audio playback
        }
    };

    const handleSelectVariation = (id: number) => {
        setSelectedVariation(id);
    };

    const handleContinue = async () => {
        if (!selectedVariation) {
            alert('Please select a variation first');
            return;
        }

        setLoading(true);

        try {
            // Get form data and prompt from sessionStorage
            const formData = sessionStorage.getItem('songFormData');
            const generatedPrompt = sessionStorage.getItem('generatedPrompt');
            const formId = sessionStorage.getItem('currentFormId');

            // Update localStorage with selected variation
            if (formId) {
                const savedData = localStorage.getItem(`songForm_${formId}`);
                if (savedData) {
                    const parsedData = JSON.parse(savedData);
                    const updatedData = {
                        ...parsedData,
                        selectedVariationId: selectedVariation,
                        selectedVariationStyle: variations.find(v => v.id === selectedVariation)?.style || '',
                        status: 'payment_initiated',
                        lastUpdated: new Date().toISOString()
                    };
                    localStorage.setItem(`songForm_${formId}`, JSON.stringify(updatedData));
                    console.log('[FRONTEND] Updated local storage with variation selection:', updatedData);
                }
            }

            // Call Stripe checkout API
            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    packageId: 'solo-serenade', // Single song for €37
                    selectedVariation,
                    formData: formData ? JSON.parse(formData) : null,
                    generatedPrompt,
                    formId
                })
            });

            const data = await response.json();

            if (data.url) {
                // Redirect to Stripe checkout
                window.location.href = data.url;
            } else {
                console.error('Checkout error:', data.error);
                alert('Failed to create checkout session. Please try again.');
                setLoading(false);
            }
        } catch (error) {
            console.error('Error creating checkout:', error);
            alert('An error occurred. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex flex-col overflow-x-hidden font-sans" style={{ backgroundColor: '#2A374F' }}>
            {/* Background Image Layer - Fixed */}
            <div
                className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/web background image.png')" }}
            />

            {/* Dark Overlay */}
            <div className="fixed inset-0 z-[1] bg-black/30" />

            {/* Snowfall Effect - Fixed */}
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

            {/* Back Button - Fixed to left edge */}
            <button
                onClick={() => router.push('/create')}
                className="fixed left-4 top-8 z-20 p-3 rounded-lg bg-[#1a3d5f]/80 backdrop-blur-sm hover:bg-[#1a3d5f]/90 transition-all duration-200 shadow-lg text-white"
            >
                <ArrowLeft01Icon className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="relative z-10 max-w-6xl mx-auto mb-8 pt-8 px-4">
                {/* Logo */}
                <div className="mb-6 text-center">
                    <Image
                        src="/huggnote bespoke logo.png"
                        alt="Huggnote"
                        width={300}
                        height={100}
                        className="w-[200px] h-auto mx-auto drop-shadow-md"
                        priority
                    />
                </div>

                {/* Title */}
                <h1 className={`text-white md:text-[#E8DCC0] lg:text-[#E8DCC0] text-2xl md:text-3xl lg:text-3xl font-normal mb-4 drop-shadow-xl text-center ${lora.className}`} style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                    Listen to each variation and select your favorite
                </h1>
            </div>


            {/* Variations Grid */}
            <div className="relative z-10 max-w-6xl mx-auto px-4 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {variations.map((variation) => (
                        <Card
                            key={variation.id}
                            className={`bg-white/5 backdrop-blur-md rounded-2xl border-2 shadow-lg transition-all duration-200 relative overflow-hidden ${selectedVariation === variation.id
                                ? 'border-[#F5E6B8] shadow-[0_8px_30px_rgba(245,230,184,0.5)] bg-[#F5E6B8]/10'
                                : 'border-white/20 shadow-[0_4px_15px_rgba(255,255,255,0.1)]'
                                }`}
                        >
                            <CardContent className="p-6">
                                {/* Variation Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 ${selectedVariation === variation.id ? 'text-[#F5E6B8]' : 'text-white/70'}`}>
                                            <path d="M9 18V5l12-2v13"></path>
                                            <circle cx="6" cy="18" r="3"></circle>
                                            <circle cx="18" cy="16" r="3"></circle>
                                        </svg>
                                        <h3 className={`text-lg font-medium ${selectedVariation === variation.id ? 'text-[#F5E6B8]' : 'text-white'}`}>
                                            Variation {variation.id}
                                        </h3>
                                    </div>
                                    {selectedVariation === variation.id && (
                                        <div className="bg-[#F5E6B8] text-[#1a3d5f] rounded-full p-1">
                                            <CheckmarkCircle01Icon className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>

                                {/* Style Badge */}
                                <div className="mb-3">
                                    <span className="text-xs text-[#87CEEB] bg-[#87CEEB]/10 px-3 py-1 rounded-full">
                                        {variation.style}
                                    </span>
                                </div>

                                {/* Play Button */}
                                <div className="mb-4">
                                    <Button
                                        onClick={() => handlePlay(variation.id)}
                                        className="w-full py-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 bg-gradient-to-br from-[#87CEEB] to-[#5BA5D0] text-white shadow-[0_4px_20px_rgba(135,206,235,0.4)] hover:shadow-[0_6px_25px_rgba(135,206,235,0.5)] border-0"
                                    >
                                        {playingId === variation.id ? (
                                            <>
                                                <div className="w-5 h-5 flex items-center justify-center">
                                                    <div className="flex gap-1">
                                                        <div className="w-1 h-4 bg-white animate-pulse"></div>
                                                        <div className="w-1 h-4 bg-white animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                                        <div className="w-1 h-4 bg-white animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                                    </div>
                                                </div>
                                                <span className="font-medium">Playing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <PlayIcon className="w-5 h-5" />
                                                <span className="font-medium">Play</span>
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {/* Lyrics Preview */}
                                <div className="mb-4 bg-[#0f1e30]/60 rounded-xl p-4 border border-[#87CEEB]/20">
                                    <h4 className="text-[#87CEEB] text-sm font-medium mb-2">Lyrics Preview</h4>
                                    <div className="text-white/80 text-sm leading-relaxed whitespace-pre-line italic max-h-32 overflow-y-auto custom-scrollbar">
                                        {variation.lyricsPreview}

                                        <p className="text-white/50 text-xs mt-3 italic">
                                            "Sample preview - final lyrics will be fully customized"
                                        </p>
                                    </div>
                                </div>

                                {/* Select Button */}
                                {selectedVariation === variation.id ? (
                                    <button
                                        className="w-full py-3 rounded-xl font-medium transition-all duration-200 bg-[#F5E6B8] text-[#1a3d5f] shadow-lg hover:bg-[#F5E6B8] border-0 pointer-events-none font-semibold"
                                    >
                                        Selected ✓
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleSelectVariation(variation.id)}
                                        className="w-full py-3 rounded-xl font-medium transition-all duration-200 bg-white/10 hover:bg-white/20 border border-white/30 text-white"
                                    >
                                        Select This Version
                                    </button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Continue Button */}
                <div className="mt-8 flex justify-center">
                    <PremiumButton
                        onClick={handleContinue}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loading01Icon className="h-6 w-6 animate-spin" />
                                Generating Your Song...
                            </>
                        ) : (
                            "Proceed to Payment"
                        )}
                    </PremiumButton>
                </div>
            </div>

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

                /* Custom Scrollbar Styles */
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }

                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(135, 206, 235, 0.3);
                    border-radius: 10px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(135, 206, 235, 0.5);
                }

                /* Firefox */
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(135, 206, 235, 0.3) rgba(255, 255, 255, 0.05);
                }

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
