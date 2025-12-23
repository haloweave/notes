'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Lora } from 'next/font/google';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Share2, Download, Music, Play, Pause } from 'lucide-react';
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
}

function SongPageContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const id = params?.id as string;
    const indexParam = searchParams.get('index');
    const songIndex = indexParam ? parseInt(indexParam, 10) : 0; // Default to 0

    const [isLoading, setIsLoading] = useState(true);
    const [song, setSong] = useState<SongData | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
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

                // Use songIndex from URL params (default 0)
                console.log(`[SONG PAGE] Loading song index: ${songIndex}`);

                const variationAudioUrls = form.variationAudioUrls || {};
                const variationTaskIds = form.variationTaskIds || {};
                const variationTitles = form.variationTitles || {};
                const variationLyrics = form.variationLyrics || {};
                const selectedVariations = form.selectedVariations || {};

                // Determine which variation was selected
                let targetVarId = selectedVariations[songIndex];

                if (!targetVarId) {
                    const available = variationAudioUrls[songIndex] ? Object.keys(variationAudioUrls[songIndex]) : [];
                    if (available.length > 0) {
                        targetVarId = available[0];
                    } else {
                        targetVarId = 1;
                    }
                }

                const varKey = String(targetVarId);
                let audioUrl = variationAudioUrls[songIndex]?.[varKey] || variationAudioUrls[songIndex]?.[Number(targetVarId)];

                if (!audioUrl) {
                    const taskIdsForSong = variationTaskIds[songIndex];
                    if (Array.isArray(taskIdsForSong)) {
                        const index = Number(targetVarId) - 1;
                        const taskId = taskIdsForSong[index];
                        if (taskId) audioUrl = `https://cdn1.suno.ai/${taskId}.mp3`;
                    } else if (taskIdsForSong && typeof taskIdsForSong === 'object') {
                        const taskId = taskIdsForSong[varKey] || taskIdsForSong[Number(targetVarId)];
                        if (taskId) audioUrl = `https://cdn1.suno.ai/${taskId}.mp3`;
                    }
                }

                if (!audioUrl) {
                    setError('Audio not available');
                    setIsLoading(false);
                    return;
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
                    lyrics
                });

            } catch (err) {
                console.error("Error fetching song:", err);
                setError('Failed to load song');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSong();
    }, [id]);

    const togglePlay = () => {
        if (!song) return;

        if (isPlaying && audioElement) {
            audioElement.pause();
            setIsPlaying(false);
        } else {
            if (!audioElement) {
                const audio = new Audio(song.audioUrl);
                audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
                audio.addEventListener('timeupdate', () => setProgress(audio.currentTime));
                audio.addEventListener('ended', () => {
                    setIsPlaying(false);
                    setProgress(0);
                });
                setAudioElement(audio);
                audio.play();
            } else {
                audioElement.play();
            }
            setIsPlaying(true);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (audioElement) {
            const time = parseFloat(e.target.value);
            audioElement.currentTime = time;
            setProgress(time);
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

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
            <div className="min-h-screen bg-[#0f2438] flex items-center justify-center">
                <LoadingSpinner size="lg" variant="dots" customColor="#F5E6B8" />
            </div>
        );
    }

    if (error || !song) {
        return (
            <div className="min-h-screen bg-[#0f2438] flex items-center justify-center text-white">
                <div className="text-center">
                    <h1 className="text-2xl mb-4">Song Unavailable</h1>
                    <p>{error || "We couldn't find this song."}</p>
                    <Link href="/" className="inline-block mt-4 text-[#F5E6B8] hover:underline">Return Home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f2438] text-white overflow-x-hidden">
            {/* Background elements similar to library */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a3d5f]/20 via-[#0f1e30] to-[#0f2438]"></div>
            </div>

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
                                    onClick={togglePlay}
                                    className="w-20 h-20 rounded-full bg-gradient-to-br from-[#F5E6B8] to-[#D4C89A] flex items-center justify-center shadow-[0_0_30px_rgba(245,230,184,0.3)] hover:scale-105 transition-transform"
                                >
                                    {isPlaying ? (
                                        <Pause className="w-10 h-10 text-[#1a3d5f] fill-current" />
                                    ) : (
                                        <Play className="w-10 h-10 text-[#1a3d5f] fill-current ml-1" />
                                    )}
                                </button>
                            </div>

                            <div className="space-y-2">
                                <input
                                    type="range"
                                    min="0"
                                    max={duration || 100}
                                    value={progress}
                                    onChange={handleSeek}
                                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#F5E6B8] hover:accent-[#E8DCC0]"
                                />
                                <div className="flex justify-between text-xs text-[#E0F4FF]/60 font-mono">
                                    <span>{formatTime(progress)}</span>
                                    <span>{formatTime(duration)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap justify-center gap-4 mb-10">
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
