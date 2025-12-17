'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lora } from 'next/font/google';
import Image from 'next/image';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const lora = Lora({ subsets: ['latin'] });

function ShareContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const sessionId = searchParams.get('session_id');
    const [recipientName, setRecipientName] = useState('Someone Special');
    const [loading, setLoading] = useState(true);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

    // Initial Load & Data Processing
    useEffect(() => {
        const fetchFormData = async () => {
            if (!sessionId) {
                setLoading(false);
                return;
            }

            try {
                // Fetch compose form by session ID
                const response = await fetch(`/api/compose/forms?stripeSessionId=${sessionId}`);
                if (!response.ok) {
                    console.error('[SHARE] Failed to fetch form data');
                    setLoading(false);
                    return;
                }

                const data = await response.json();

                if (!data.success || !data.form) {
                    console.error('[SHARE] No form found for session:', sessionId);
                    setLoading(false);
                    return;
                }

                const form = data.form; // API returns {success: true, form: {...}}

                console.log('[SHARE] Form data:', form);

                // Get recipient name from form data
                const formData = form.formData;
                if (formData?.recipientName) {
                    setRecipientName(formData.recipientName);
                } else if (formData?.songs?.[0]?.recipientName) {
                    setRecipientName(formData.songs[0].recipientName);
                }

                // Get selected variation task ID
                const selectedVariations = form.selectedVariations || {};
                const variationTaskIds = form.variationTaskIds || {};

                console.log('[SHARE] Selected variations:', selectedVariations);
                console.log('[SHARE] Variation task IDs:', variationTaskIds);

                // For solo-serenade, get the first (and only) song's selected variation
                const songIndex = 0;
                const selectedVariationId = selectedVariations[songIndex];
                const taskIdsForSong = variationTaskIds[songIndex];

                console.log('[SHARE] Song index:', songIndex);
                console.log('[SHARE] Selected variation ID:', selectedVariationId);
                console.log('[SHARE] Task IDs for song:', taskIdsForSong);

                if (selectedVariationId && taskIdsForSong && taskIdsForSong[selectedVariationId - 1]) {
                    const taskId = taskIdsForSong[selectedVariationId - 1];
                    setSelectedTaskId(taskId);
                    console.log('[SHARE] ✅ Selected task ID:', taskId);
                } else {
                    console.warn('[SHARE] ⚠️ No task ID found for selected variation');
                    console.warn('[SHARE] This might mean:');
                    console.warn('[SHARE]   - No variation was selected yet');
                    console.warn('[SHARE]   - Variations are still generating');
                    console.warn('[SHARE]   - Data structure mismatch');
                }

            } catch (error) {
                console.error('[SHARE] Error fetching form data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFormData();
    }, [sessionId]);

    const handleOpenGift = () => {
        if (selectedTaskId) {
            console.log('[SHARE] Opening song:', selectedTaskId);
            router.push(`/play/${selectedTaskId}`);
        } else {
            console.error('[SHARE] No task ID available');
            alert('🎵 Your song is still being prepared! Please check back in a few minutes. We\'ll send you an email when it\'s ready.');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <LoadingSpinner size="lg" variant="dots" color="primary" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl w-full relative z-10 animate-in fade-in zoom-in duration-700">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 sm:p-8 text-center space-y-2 bg-gradient-to-r from-red-600 via-red-500 to-green-600">
                    <h1 className={`text-white text-2xl md:text-3xl font-bold ${lora.className}`}>
                        🎄 {recipientName}, You Have a Gift! 🎄
                    </h1>
                    <p className="text-red-50 text-base md:text-lg">
                        Someone special created a custom song just for you
                    </p>
                </div>

                {/* Gift Box Section */}
                <div className="p-8 sm:p-12 bg-gradient-to-b from-slate-700 to-slate-800 relative min-h-[500px] flex items-end justify-center overflow-hidden">

                    {/* Snow Ground */}
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-white rounded-t-[100%]"></div>

                    {/* Tree */}
                    <div className="absolute bottom-24 left-1/4 text-center transform hover:scale-110 transition-transform">
                        <div className="text-6xl">🌲</div>
                    </div>

                    {/* Main Gift Button */}
                    <button
                        onClick={handleOpenGift}
                        className="relative z-20 cursor-pointer focus:outline-none mb-16 transform hover:scale-110 transition-transform duration-300 group"
                    >
                        <div className="relative">
                            <div className="text-8xl animate-bounce">🎁</div>
                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white/90 px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold text-slate-800 shadow-lg group-hover:bg-white transition-colors">
                                Click to open! 🎁
                            </div>
                        </div>
                    </button>

                    {/* Snowman */}
                    <div className="absolute bottom-24 right-1/4 text-center transform hover:scale-110 transition-transform">
                        <div className="text-5xl">⛄</div>
                    </div>

                    {/* Stars - Using absolute positions based on user's HTML style */}
                    <div className="absolute text-yellow-200 animate-pulse" style={{ top: '41%', left: '4%', transform: 'scale(1.1)' }}>⭐</div>
                    <div className="absolute text-yellow-200 animate-pulse" style={{ top: '3%', left: '1%', transform: 'scale(1.0)' }}>⭐</div>
                    <div className="absolute text-yellow-200 animate-pulse" style={{ top: '58%', left: '96%', transform: 'scale(1.0)' }}>⭐</div>
                    <div className="absolute text-yellow-200 animate-pulse" style={{ top: '13%', left: '92%', transform: 'scale(1.2)' }}>⭐</div>
                    <div className="absolute text-yellow-200 animate-pulse" style={{ top: '0.2%', left: '11%', transform: 'scale(1.1)' }}>⭐</div>

                    {/* More Stars */}
                    <div className="absolute text-yellow-200 animate-pulse" style={{ top: '48%', left: '57%', animationDelay: '0.5s' }}>⭐</div>
                    <div className="absolute text-yellow-200 animate-pulse" style={{ top: '7%', left: '68%', animationDelay: '0.2s' }}>⭐</div>
                    <div className="absolute text-yellow-200 animate-pulse" style={{ top: '53%', left: '53%', animationDelay: '0.7s' }}>⭐</div>
                    <div className="absolute text-yellow-200 animate-pulse" style={{ top: '46%', left: '19%', animationDelay: '0.3s' }}>⭐</div>

                    {/* Even More Stars */}
                    <div className="absolute text-yellow-200 animate-pulse" style={{ top: '8%', left: '47%', animationDelay: '1s' }}>⭐</div>
                    <div className="absolute text-yellow-200 animate-pulse" style={{ top: '22%', left: '34%', animationDelay: '0.4s' }}>⭐</div>
                    <div className="absolute text-yellow-200 animate-pulse" style={{ top: '3%', left: '65%', animationDelay: '0.8s' }}>⭐</div>
                    <div className="absolute text-yellow-200 animate-pulse" style={{ top: '36%', left: '93%', animationDelay: '0.2s' }}>⭐</div>

                </div>
            </div>

            <p className="text-center text-white/80 text-sm mt-6 font-medium tracking-wide">
                ✨ A personalized musical gift ✨
            </p>
        </div>
    );
}

export default function SharePage() {
    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 overflow-x-hidden font-sans" style={{ backgroundColor: '#1a3d5f' }}>
            {/* Background Image Layer */}
            <Image
                src="/web background image.png"
                alt="Background"
                fill
                className="object-cover opacity-40 z-0"
                priority
                quality={100}
            />

            {/* Content */}
            <Suspense fallback={
                <div className="relative z-10 flex min-h-screen items-center justify-center text-white">
                    <LoadingSpinner size="lg" variant="dots" color="primary" />
                </div>
            }>
                <ShareContent />
            </Suspense>

            {/* Snowfall Effect */}
            <div className="fixed inset-0 z-[5] pointer-events-none overflow-hidden">
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
                        0% { transform: translateY(0) rotate(0deg); opacity: 0.8; }
                        100% { transform: translateY(110vh) rotate(360deg); opacity: 0.3; }
                    }
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
                <div className="snowflakes" aria-hidden="true">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="snowflake">❅</div>
                    ))}
                </div>
            </div>
        </div>
    );
}
