'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square, Download, Music, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SongData {
    id: string;
    generatedPrompt: string;
    audioUrl: string;
    audioUrlWav?: string;
    title?: string;
    lyrics?: string;
    duration?: number;
    createdAt: string;
    version: 'v1' | 'v2';
}

export default function PlayPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [song, setSong] = useState<SongData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const fetchSong = async () => {
            try {
                const response = await fetch(`/api/play/${slug}`);
                if (!response.ok) {
                    throw new Error('Song not found');
                }
                const data = await response.json();
                setSong(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load song');
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchSong();
        }
    }, [slug]);

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const stopPlayback = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
            setProgress(0);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const current = audioRef.current.currentTime;
            const total = audioRef.current.duration;
            setCurrentTime(current);
            if (!isNaN(total)) {
                setDuration(total);
                setProgress((current / total) * 100);
            }
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
        if (audioRef.current) audioRef.current.currentTime = 0;
    };

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        if (audioRef.current && !isNaN(audioRef.current.duration)) {
            const time = (val / 100) * audioRef.current.duration;
            audioRef.current.currentTime = time;
            setProgress(val);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full border-4 border-purple-500/30 border-t-purple-600 animate-spin" />
                    <p className="text-gray-600 animate-pulse">Loading your song...</p>
                </div>
            </div>
        );
    }

    if (error || !song) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full p-8 text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
                        <Music className="w-8 h-8 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Song Not Found</h1>
                    <p className="text-gray-600">{error || 'This song does not exist or has been removed.'}</p>
                    <Button onClick={() => router.push('/')} className="gap-2">
                        <Home className="w-4 h-4" />
                        Go to Homepage
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
                        <Music className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-semibold text-gray-700">Huggnote</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                        {song.generatedPrompt || 'Untitled Song'}
                    </h1>
                    <p className="text-sm text-gray-500">
                        Version {song.version.toUpperCase()} • Created {new Date(song.createdAt).toLocaleDateString()}
                    </p>
                </div>

                {/* Player Card */}
                <Card className="overflow-hidden shadow-xl border-2 border-purple-100">
                    {/* Album Art / Visual */}
                    <div className="relative h-64 bg-gradient-to-br from-purple-400 via-pink-400 to-purple-500 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/10" />
                        <div className="relative z-10">
                            <button
                                onClick={togglePlay}
                                className={cn(
                                    "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl",
                                    isPlaying
                                        ? "bg-white/90 text-purple-600 scale-95"
                                        : "bg-white text-purple-600 hover:scale-110 hover:shadow-purple-500/50"
                                )}
                            >
                                {isPlaying ? (
                                    <Pause className="w-12 h-12 fill-current" />
                                ) : (
                                    <Play className="w-12 h-12 fill-current ml-2" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Player Controls */}
                    <div className="p-6 md:p-8 space-y-6 bg-white">
                        {/* Progress Bar */}
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-medium text-gray-500 w-10 text-right">
                                {formatTime(currentTime)}
                            </span>
                            <div className="flex-1 h-8 flex items-center relative group">
                                {/* Track background */}
                                <div className="absolute w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-100 ease-out"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={progress}
                                    onChange={handleSliderChange}
                                    className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                {/* Thumb */}
                                <div
                                    className="w-4 h-4 bg-white border-2 border-purple-600 rounded-full shadow-md absolute pointer-events-none transition-all duration-100 ease-out"
                                    style={{ left: `calc(${progress}% - ${progress > 50 ? '12px' : '8px'})` }}
                                />
                            </div>
                            <span className="text-xs font-medium text-gray-500 w-10">
                                {formatTime(duration)}
                            </span>
                        </div>

                        {/* Control Buttons */}
                        <div className="flex items-center justify-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={stopPlayback}
                                className="h-12 w-12 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
                                title="Stop"
                            >
                                <Square className="w-5 h-5 fill-current" />
                            </Button>

                            {song.audioUrl && (
                                <Button
                                    variant="outline"
                                    className="h-12 px-6 rounded-full gap-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 text-gray-700"
                                    asChild
                                >
                                    <a href={song.audioUrl} download>
                                        <Download className="w-4 h-4" />
                                        <span className="font-medium">Download</span>
                                    </a>
                                </Button>
                            )}
                        </div>

                        {/* Lyrics (if available) */}
                        {song.lyrics && (
                            <div className="pt-4 border-t border-gray-100">
                                <h3 className="text-sm font-semibold text-gray-700 mb-2">Lyrics</h3>
                                <div className="text-sm text-gray-600 whitespace-pre-wrap max-h-40 overflow-y-auto p-3 bg-gray-50 rounded-lg">
                                    {song.lyrics}
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Footer */}
                <div className="text-center space-y-3">
                    <p className="text-sm text-gray-600">
                        Create your own personalized song at{' '}
                        <a href="/" className="text-purple-600 hover:text-purple-700 font-semibold underline">
                            Huggnote
                        </a>
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => router.push('/')}
                        className="gap-2"
                    >
                        <Home className="w-4 h-4" />
                        Create Your Song
                    </Button>
                </div>
            </div>

            {/* Audio Element */}
            {song.audioUrl && (
                <audio
                    ref={audioRef}
                    src={song.audioUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleEnded}
                    preload="metadata"
                    className="hidden"
                />
            )}
        </div>
    );
}
