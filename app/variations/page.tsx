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
    lyricsPreview: string; // Template string or function
}

interface SongData {
    recipientName: string;
    recipientNickname?: string;
    relationship: string;
    theme: string;
    aboutThem: string;
    moreInfo?: string;
    // ... other fields
}

export default function VariationsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State
    const [songs, setSongs] = useState<SongData[]>([]);
    const [activeTab, setActiveTab] = useState(0);
    const [selections, setSelections] = useState<Record<number, number>>({}); // { songIndex: variationId }
    const [loading, setLoading] = useState(false);
    const [playingId, setPlayingId] = useState<number | null>(null);
    const [isBundle, setIsBundle] = useState(false);

    const formIdParam = searchParams.get('formId');

    // Load Data
    useEffect(() => {
        const loadData = () => {
            let dataToParse = sessionStorage.getItem('songFormData');

            // Fallback to localStorage/restore logic if needed (similar to previous implementation)
            if (!dataToParse && formIdParam) {
                const savedData = localStorage.getItem(`songForm_${formIdParam}`);
                if (savedData) {
                    try {
                        const parsed = JSON.parse(savedData);
                        dataToParse = JSON.stringify(parsed.formData);
                        // Also restore other session items if needed
                    } catch (e) {
                        console.error("Error parsing localStorage", e);
                    }
                }
            }

            if (dataToParse) {
                try {
                    const parsed = JSON.parse(dataToParse);
                    if (parsed.songs && Array.isArray(parsed.songs)) {
                        setSongs(parsed.songs);
                        // Initialize selections with default 1 ?? Or default empty to force choice?
                        // Let's force choice or default to 1 for all?
                        // "Listen to each variation and select your favorite" implies active choice.
                        // Let's start empty to ensure they review. 
                        // Actually, to reduce friction, maybe default none selected?
                    } else {
                        // Handle legacy single song format
                        setSongs([parsed]);
                    }
                } catch (e) {
                    console.error("Error parsing form data", e);
                }
            }
        };

        loadData();
    }, [formIdParam]);

    useEffect(() => {
        setIsBundle(songs.length > 1);
    }, [songs]);


    // Dynamic Variations based on current song
    const currentSong = songs[activeTab] || {};
    const recipientName = currentSong.recipientName || 'Name';
    const relationship = currentSong.relationship || 'Friend';
    const theme = currentSong.theme || 'Special Occasion';

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

    const handleSelectVariation = (variationId: number) => {
        setSelections(prev => ({
            ...prev,
            [activeTab]: variationId
        }));
    };

    const isCurrentSelected = (variationId: number) => {
        return selections[activeTab] === variationId;
    };

    const handleContinue = async () => {
        // Validation: Ensure all songs have a selection
        const missingSelections = songs.some((_, index) => !selections[index]);

        if (missingSelections) {
            alert('Please select a variation for every song in your bundle.');
            return;
        }

        setLoading(true);

        try {
            const formDataStr = sessionStorage.getItem('songFormData');
            const generatedPrompt = sessionStorage.getItem('generatedPrompt'); // Note: This might only be the first one currently in session
            const formId = sessionStorage.getItem('currentFormId');

            // Construct composite selections data
            // We need to save this to localStorage so we can retrieve it after success
            if (formId) {
                const savedData = localStorage.getItem(`songForm_${formId}`);
                if (savedData) {
                    const parsedData = JSON.parse(savedData);
                    const updatedData = {
                        ...parsedData,
                        selections: selections, // Save map of songIndex -> variationId
                        // Legacy field for single song support validation
                        selectedVariationId: selections[0],
                        status: 'payment_initiated',
                        lastUpdated: new Date().toISOString()
                    };
                    localStorage.setItem(`songForm_${formId}`, JSON.stringify(updatedData));
                }
            }

            const selectedPackage = sessionStorage.getItem('selectedPackageId') || (songs.length > 1 ? 'holiday-hamper' : 'solo-serenade');

            // Call Stripe checkout API
            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    packageId: selectedPackage,
                    selections, // Send the full map
                    selectedVariation: selections[0], // Fallback for API validation/metadata
                    formData: formDataStr ? JSON.parse(formDataStr) : null,
                    generatedPrompt,
                    formId
                })
            });

            const data = await response.json();

            if (data.url) {
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

    // Calculate completion status
    const completedCount = Object.keys(selections).length;
    const totalSongs = songs.length;

    // Don't render until loaded?
    if (songs.length === 0 && !loading) {
        // Show loading or empty state. 
        // Since we load effectively sync from storage (or fast effect), maybe just return null or skeleton
        return (
            <div className="min-h-screen bg-[#2A374F] flex items-center justify-center">
                <Loading01Icon className="w-8 h-8 text-[#F5E6B8] animate-spin" />
            </div>
        );
    }

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
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="snowflake">❅</div>
                    ))}
                </div>
            </div>

            {/* Back Button */}
            <button
                onClick={() => router.push('/create')}
                className="fixed left-4 top-8 z-20 p-3 rounded-lg bg-[#1a3d5f]/80 backdrop-blur-sm hover:bg-[#1a3d5f]/90 transition-all duration-200 shadow-lg text-white"
            >
                <ArrowLeft01Icon className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="relative z-10 max-w-6xl mx-auto mb-8 pt-8 px-4">
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

                <h1 className={`text-white md:text-[#E8DCC0] lg:text-[#E8DCC0] text-2xl md:text-3xl lg:text-3xl font-normal mb-2 drop-shadow-xl text-center ${lora.className}`} style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                    {isBundle ? "Select a style for each song" : "Listen and select your favorite"}
                </h1>

                {isBundle && (
                    <p className="text-[#87CEEB] text-center mb-6">
                        {completedCount} of {totalSongs} songs selected
                    </p>
                )}
            </div>

            {/* Tabs for Bundle */}
            {isBundle && (
                <div className="relative z-10 max-w-6xl mx-auto px-4 mb-6">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {songs.map((song, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveTab(index)}
                                className={`
                                    relative flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 min-w-[120px] justify-center border-2
                                    ${activeTab === index
                                        ? 'bg-[#1e293b]/90 text-[#F5E6B8] border-[#F5E6B8] shadow-lg'
                                        : selections[index]
                                            ? 'bg-[#1e293b]/60 text-[#87CEEB] border-[#87CEEB]/50' // Completed
                                            : 'bg-white/5 text-white/60 border-transparent hover:bg-white/10'
                                    }
                                `}
                            >
                                <span className={lora.className}>Song {index + 1}</span>
                                {selections[index] && <CheckmarkCircle01Icon className="w-4 h-4 text-[#87CEEB]" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}


            {/* Variations Grid */}
            <div className="relative z-10 max-w-6xl mx-auto px-4 pb-8 min-h-[500px]">
                {/* Header for current tab info */}
                {isBundle && (
                    <div className="mb-6 text-[#E8DCC0] text-lg font-medium border-b border-[#87CEEB]/30 pb-2">
                        Options for {recipientName} ({relationship})
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {variations.map((variation) => (
                        <Card
                            key={variation.id}
                            className={`bg-white/5 backdrop-blur-md rounded-2xl border-2 shadow-lg transition-all duration-200 relative overflow-hidden ${isCurrentSelected(variation.id)
                                ? 'border-[#F5E6B8] shadow-[0_8px_30px_rgba(245,230,184,0.5)] bg-[#F5E6B8]/10'
                                : 'border-white/20 shadow-[0_4px_15px_rgba(255,255,255,0.1)]'
                                }`}
                        >
                            <CardContent className="p-6">
                                {/* Variation Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <h3 className={`text-lg font-medium ${isCurrentSelected(variation.id) ? 'text-[#F5E6B8]' : 'text-white'}`}>
                                            Variation {variation.id}
                                        </h3>
                                    </div>
                                    {isCurrentSelected(variation.id) && (
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
                                                <Loading01Icon className="w-5 h-5 animate-spin" />
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
                                {isCurrentSelected(variation.id) ? (
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
                        className={isBundle && completedCount < totalSongs ? "opacity-70" : ""}
                    >
                        {loading ? (
                            <>
                                <Loading01Icon className="h-6 w-6 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            isBundle ? `Proceed to Payment (${completedCount}/${totalSongs} Selected)` : "Proceed to Payment"
                        )}
                    </PremiumButton>
                </div>
            </div>

            {/* Snowfall CSS */}
            <style jsx>{`
                .snowflakes { position: absolute; top: -10%; width: 100%; height: 110%; }
                .snowflake { position: absolute; top: -10%; color: #fff; font-size: 1em; animation: fall linear infinite; opacity: 0.8; }
                @keyframes fall { 0% { transform: translateY(0) rotate(0deg); opacity: 0.8; } 100% { transform: translateY(110vh) rotate(360deg); opacity: 0.3; } }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(135, 206, 235, 0.3); border-radius: 10px; }
                .snowflake:nth-child(1) { left: 10%; animation-duration: 10s; }
                .snowflake:nth-child(2) { left: 20%; animation-duration: 12s; animation-delay: 2s; }
                .snowflake:nth-child(3) { left: 30%; animation-duration: 15s; animation-delay: 4s; }
                .snowflake:nth-child(4) { left: 40%; animation-duration: 11s; }
                .snowflake:nth-child(5) { left: 50%; animation-duration: 13s; animation-delay: 3s; }
                .snowflake:nth-child(6) { left: 60%; animation-duration: 14s; animation-delay: 1s; }
                .snowflake:nth-child(7) { left: 70%; animation-duration: 16s; animation-delay: 5s; }
                .snowflake:nth-child(8) { left: 80%; animation-duration: 12s; animation-delay: 2s; }
                .snowflake:nth-child(9) { left: 90%; animation-duration: 11s; animation-delay: 4s; }
                .snowflake:nth-child(10) { left: 15%; animation-duration: 13s; animation-delay: 1s; }
            `}</style>
        </div>
    );
}
