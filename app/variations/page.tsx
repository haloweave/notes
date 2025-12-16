'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lora } from 'next/font/google';
import { PlayIcon, CheckmarkCircle01Icon, Loading01Icon } from 'hugeicons-react';
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
        setLoading(true);
        // TODO: Submit the selected variation and generate the final song
        // For now, redirect to dashboard
        setTimeout(() => {
            router.push('/dashboard');
        }, 2000);
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

            {/* Header */}
            <div className="relative z-10 max-w-6xl mx-auto mb-8 text-center pt-8 px-4">
                <div className="mb-6">
                    <Image
                        src="/huggnote bespoke logo.png"
                        alt="Huggnote"
                        width={300}
                        height={100}
                        className="w-[200px] h-auto mx-auto drop-shadow-md"
                        priority
                    />
                </div>
                <h1 className={`text-3xl md:text-4xl font-bold mb-4 drop-shadow-xl ${lora.className}`} style={{ color: '#E7DBBF', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                    Listen to each variation and select your favorite
                </h1>
            </div>


            {/* Variations Grid */}
            <div className="relative z-10 max-w-6xl mx-auto px-4 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {variations.map((variation) => (
                        <Card
                            key={variation.id}
                            className={`shadow-2xl backdrop-blur-xl border-2 transition-all ${selectedVariation === variation.id
                                ? 'bg-white/20 border-[#E7DBBF]'
                                : 'bg-white/10 border-white/20'
                                }`}
                        >
                            <CardContent className="p-6 space-y-4">
                                {/* Variation Header */}
                                <div className="text-center">
                                    <h3 className={`text-xl font-semibold mb-2 ${lora.className}`} style={{ color: '#E7DBBF' }}>
                                        Variation {variation.id}
                                    </h3>
                                    <p className="text-white font-semibold">{variation.style}</p>
                                </div>

                                {/* Play Button */}
                                <Button
                                    onClick={() => handlePlay(variation.id)}
                                    className="w-full h-12 flex items-center justify-center gap-2"
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
                                            Playing...
                                        </>
                                    ) : (
                                        <>
                                            <PlayIcon className="w-5 h-5" />
                                            Play
                                        </>
                                    )}
                                </Button>

                                {/* Lyrics Preview */}
                                <div className="space-y-2">
                                    <h4 className="text-white/80 font-semibold text-sm">Lyrics Preview</h4>
                                    <div className="bg-white/5 rounded-lg p-4 border border-white/20">
                                        <p className="text-white/90 text-sm whitespace-pre-line italic">
                                            {variation.lyricsPreview}
                                        </p>
                                        <p className="text-white/50 text-xs mt-3 italic">
                                            "Sample preview - final lyrics will be fully customized"
                                        </p>
                                    </div>
                                </div>

                                {/* Select Button */}
                                {selectedVariation === variation.id ? (
                                    <Button
                                        className="w-full h-12 flex items-center justify-center gap-2"
                                        variant="secondary"
                                        disabled
                                    >
                                        <CheckmarkCircle01Icon className="w-5 h-5" />
                                        Selected ✓
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => handleSelectVariation(variation.id)}
                                        className="w-full h-12 bg-white/10 hover:bg-white/20 border border-white/30 text-white"
                                        variant="outline"
                                    >
                                        Select This Version
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Continue Button */}
                <div className="mt-8">
                    <Button
                        onClick={handleContinue}
                        disabled={loading}
                        variant="secondary"
                        className="w-full h-14 text-lg flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01]"
                    >
                        {loading ? (
                            <>
                                <Loading01Icon className="h-6 w-6 animate-spin" />
                                Generating Your Song...
                            </>
                        ) : (
                            <>
                                Proceed to Payment
                            </>
                        )}
                    </Button>
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
