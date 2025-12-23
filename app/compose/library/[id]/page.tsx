'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Lora } from 'next/font/google';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Share2, Download, Music, Play, Pause, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const lora = Lora({ subsets: ['latin'] });

interface SongData {
    id: string;
    title: string;
    description: string;
    audioUrl: string;
    date: string;
    recipient: string;
    relationship?: string;
    theme?: string;
    lyrics?: string;
    taskId?: string;
}

function SongPageContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = params?.id as string;
    const indexParam = searchParams.get('index');
    const variationIdParam = searchParams.get('variationId');
    const songIndex = indexParam ? parseInt(indexParam, 10) : 0;
    const variationId = variationIdParam ? parseInt(variationIdParam, 10) : null;

    const [isLoading, setIsLoading] = useState(true);
    const [song, setSong] = useState<SongData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSong = async () => {
            if (!id) return;

            try {
                // Fetch compose form by ID
                const response = await fetch(`/api/compose/forms?formId=${id}`);

                if (!response.ok) {
                    setError('Song not found');
                    setIsLoading(false);
                    return;
                }

                const data = await response.json();
                if (!data.success || !data.form) {
                    setError('Song not found');
                    setIsLoading(false);
                    return;
                }

                const form = data.form;

                console.log(`[SONG PAGE] Loading song index: ${songIndex}, variation: ${variationId}`);

                const variationAudioUrls = form.variationAudioUrls || {};
                const variationTaskIds = form.variationTaskIds || {};
                const variationTitles = form.variationTitles || {};
                const variationLyrics = form.variationLyrics || {};
                const selectedVariations = form.selectedVariations || {};

                // Use variationId from URL if provided, otherwise determine from selectedVariations
                let targetVarId = variationId || selectedVariations[songIndex];

                if (!targetVarId) {
                    const available = variationAudioUrls[songIndex] ? Object.keys(variationAudioUrls[songIndex]) : [];
                    if (available.length > 0) {
                        targetVarId = available[0];
                    } else {
                        targetVarId = 1;
                    }
                }

                console.log(`[SONG PAGE] Using variation ID: ${targetVarId}`);

                const varKey = String(targetVarId);
                let audioUrl = variationAudioUrls[songIndex]?.[varKey] || variationAudioUrls[songIndex]?.[Number(targetVarId)];

                // Extract Task ID
                let taskId: string | undefined;
                const taskIdsForSong = variationTaskIds[songIndex];

                if (!taskId) {
                    if (Array.isArray(taskIdsForSong)) {
                        const index = Number(targetVarId) - 1;
                        taskId = taskIdsForSong[index];
                        if (taskId && !audioUrl) audioUrl = `https://cdn1.suno.ai/${taskId}.mp3`;
                    } else if (taskIdsForSong && typeof taskIdsForSong === 'object') {
                        taskId = taskIdsForSong[varKey] || taskIdsForSong[Number(targetVarId)];
                        if (taskId && !audioUrl) audioUrl = `https://cdn1.suno.ai/${taskId}.mp3`;
                    }
                }

                if (!audioUrl) {
                    console.error('[SONG PAGE] No audio URL found for variation', targetVarId);
                    setError('Audio not available');
                    setIsLoading(false);
                    return;
                }

                console.log(`[SONG PAGE] Audio URL: ${audioUrl}, Task ID: ${taskId}`);

                // Fallback: Extract Task ID from Audio URL if possible
                if (!taskId && audioUrl) {
                    const match = audioUrl.match(/\/([a-f0-9\-]{36})\.mp3/);
                    if (match) {
                        taskId = match[1];
                    }
                }

                const lyrics = variationLyrics[songIndex]?.[varKey] || variationLyrics[songIndex]?.[Number(targetVarId)];
                const recipient = form.formData?.songs?.[0]?.recipientName || form.formData?.recipientName || 'Unknown';
                const relationship = form.formData?.songs?.[0]?.relationship || form.formData?.relationship;
                const theme = form.formData?.songs?.[0]?.theme || form.formData?.theme;

                let title = `Song for ${recipient}`;
                const rawTitles = variationTitles[songIndex];

                if (Array.isArray(rawTitles)) {
                    const index = Number(targetVarId) - 1;
                    if (rawTitles[index]) {
                        title = Array.isArray(rawTitles[index]) ? rawTitles[index][0] : rawTitles[index];
                    }
                } else if (rawTitles && typeof rawTitles === 'object') {
                    const t = rawTitles[varKey] || rawTitles[Number(targetVarId)];
                    if (t) title = t;
                }

                setSong({
                    id: form.id,
                    title: title,
                    description: `${theme || 'Special Song'} • ${relationship || 'Loved One'}`,
                    audioUrl: audioUrl,
                    date: new Date(form.createdAt).toLocaleDateString(),
                    recipient: recipient,
                    relationship,
                    theme,
                    lyrics,
                    taskId
                });

            } catch (err) {
                console.error("[SONG PAGE] Error fetching song:", err);
                setError('Failed to load song');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSong();
    }, [id, songIndex, variationId]);

    const handleDownload = () => {
        if (!song) return;
        // Same download logic as library page could be reused here if needed
        // For now, direct download link
        const link = document.createElement('a');
        link.href = song.audioUrl;
        link.download = `${song.title}.mp3`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/share?session_id=${id}&index=${songIndex}`;
        try {
            await navigator.clipboard.writeText(shareUrl);
            alert('Link copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" variant="dots" customColor="#F5E6B8" />
            </div>
        );
    }

    if (error || !song) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                <div className="text-center">
                    <h1 className="text-2xl mb-4">Song Unavailable</h1>
                    <p>{error || "We couldn't find this song."}</p>
                    <Link href="/" className="inline-block mt-4 text-[#F5E6B8] hover:underline">Return Home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white overflow-x-hidden">
            {/* Background handled by layout */}

            <main className="relative z-10 max-w-4xl mx-auto px-4 py-12 md:py-20">
                <div className="mb-10 text-center">
                    <p className={`text-[#87CEEB] text-sm uppercase tracking-wider mb-2 ${lora.className}`}>
                        Bespoke Song For
                    </p>
                    <h1 className={`text-3xl md:text-5xl text-[#E8DCC0] mb-6 ${lora.className}`}>
                        {song.recipient}
                    </h1>
                </div>

                <div className="bg-white/5 backdrop-blur-md border border-[#87CEEB]/20 rounded-2xl p-6 md:p-10 shadow-2xl">
                    <div className="flex flex-col items-center text-center">
                        <h2 className={`text-2xl md:text-3xl text-[#E0F4FF] mb-2 ${lora.className}`}>
                            {song.title}
                        </h2>
                        <p className="text-[#E0F4FF]/60 mb-8 font-medium">
                            {song.description}
                        </p>

                        {/* Player Controls */}
                        <div className="w-full max-w-2xl mb-8">
                            <div className="flex items-center justify-center mb-6">
                                <button
                                    onClick={() => {
                                        if (song.taskId) {
                                            router.push(`/play/${song.taskId}`);
                                        } else {
                                            alert('Audio not ready yet');
                                        }
                                    }}
                                    className="w-20 h-20 rounded-full bg-gradient-to-br from-[#F5E6B8] to-[#D4C89A] flex items-center justify-center shadow-[0_0_30px_rgba(245,230,184,0.3)] hover:scale-105 transition-transform"
                                >
                                    <Play className="w-10 h-10 text-[#1a3d5f] fill-current ml-1" />
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap justify-center gap-4 mb-10">
                            <Link
                                href="/compose/library"
                                className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/5"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span>Library</span>
                            </Link>
                            <button
                                onClick={handleShare}
                                className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-[#87CEEB]/20 text-[#87CEEB] transition-colors border border-white/5"
                            >
                                <Share2 className="w-5 h-5" />
                                <span>Share Song</span>
                            </button>
                            <button
                                onClick={handleDownload}
                                className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-[#F5E6B8]/20 text-[#F5E6B8] transition-colors border border-white/5"
                            >
                                <Download className="w-5 h-5" />
                                <span>Download MP3</span>
                            </button>
                        </div>

                        {/* Lyrics */}
                        {song.lyrics && (
                            <div className="w-full bg-black/20 rounded-xl p-8 border border-white/5">
                                <h3 className={`text-[#F5E6B8] mb-6 text-sm uppercase tracking-widest ${lora.className}`}>Lyrics</h3>
                                <p className={`text-[#E0F4FF]/90 whitespace-pre-wrap leading-relaxed text-lg ${lora.className}`}>
                                    {song.lyrics}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <Link
                        href="/"
                        className={`text-[#E0F4FF]/60 hover:text-[#F5E6B8] transition-colors ${lora.className}`}
                    >
                        Create your own song at Huggnote
                    </Link>
                </div>
            </main>
        </div>
    );
}

export default function SongPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0f2438]" />}>
            <SongPageContent />
        </Suspense>
    );
}
