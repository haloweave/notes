'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square, Download, Music, Home, Volume2, VolumeX } from 'lucide-react';
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

// Background video options
const BACKGROUND_VIDEOS_WEB = [
    '/player/Player Vids Web/Player Web Forest.mp4',
    '/player/Player Vids Web/Player Web Sun.mp4',
    '/player/Player Vids Web/Web Player Northern Lights.mp4',
];

const BACKGROUND_VIDEOS_MOBILE = [
    '/player/Player Mobile Vids/Player Mobile.mp4',
    '/player/Player Mobile Vids/Player Mobile Option.mp4',
];

// Detect mobile device
const isMobileDevice = () => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        || window.innerWidth < 768;
};

export default function PlayPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [song, setSong] = useState<SongData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Intro video state
    const [showIntro, setShowIntro] = useState(true);
    const [introEnded, setIntroEnded] = useState(false);
    const introVideoRef = useRef<HTMLVideoElement | null>(null);

    // Player state
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const backgroundVideoRef = useRef<HTMLVideoElement | null>(null);

    // Random background video based on device type
    const [backgroundVideo] = useState(() => {
        const isMobile = isMobileDevice();
        const videos = isMobile ? BACKGROUND_VIDEOS_MOBILE : BACKGROUND_VIDEOS_WEB;
        return videos[Math.floor(Math.random() * videos.length)];
    });

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

    // Auto-play intro video when loaded
    useEffect(() => {
        if (introVideoRef.current && showIntro && !loading && song) {
            introVideoRef.current.play().catch(err => {
                console.error('Intro video autoplay failed:', err);
                // If autoplay fails, skip intro
                handleIntroEnd();
            });
        }
    }, [showIntro, loading, song]);

    const handleIntroEnd = () => {
        setIntroEnded(true);
        setTimeout(() => {
            setShowIntro(false);
            // Auto-play song after intro
            if (audioRef.current) {
                audioRef.current.play().catch(err => {
                    console.error('Audio autoplay failed:', err);
                });
                setIsPlaying(true);
            }
        }, 300);
    };

    const skipIntro = () => {
        if (introVideoRef.current) {
            introVideoRef.current.pause();
        }
        handleIntroEnd();
    };

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

    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
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
            <div className="fixed inset-0 bg-black flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full border-4 border-purple-500/30 border-t-purple-600 animate-spin" />
                    <p className="text-white animate-pulse">Loading your song...</p>
                </div>
            </div>
        );
    }

    if (error || !song) {
        return (
            <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-black to-pink-900 flex items-center justify-center p-4">
                <Card className="max-w-md w-full p-8 text-center space-y-4 bg-black/50 backdrop-blur-lg border-purple-500/30">
                    <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
                        <Music className="w-8 h-8 text-red-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Song Not Found</h1>
                    <p className="text-gray-300">{error || 'This song does not exist or has been removed.'}</p>
                    <Button onClick={() => router.push('/')} className="gap-2">
                        <Home className="w-4 h-4" />
                        Go to Homepage
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black overflow-hidden">
            {/* Intro Video */}
            {showIntro && (
                <div
                    className={cn(
                        "absolute inset-0 z-50 transition-opacity duration-300",
                        introEnded ? "opacity-0" : "opacity-100"
                    )}
                >
                    <video
                        ref={introVideoRef}
                        src="/player/song-intro.mp4"
                        className="w-full h-full object-cover"
                        onEnded={handleIntroEnd}
                        playsInline
                        muted={false}
                    />

                    {/* Skip Intro Button */}
                    <button
                        onClick={skipIntro}
                        className="absolute bottom-8 right-8 px-6 py-3 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-white/20 transition-all border border-white/30 font-medium"
                    >
                        Skip Intro →
                    </button>
                </div>
            )}

            {/* Main Player (Full Screen) */}
            {!showIntro && (
                <div className="relative w-full h-full">
                    {/* Background Video */}
                    <video
                        ref={backgroundVideoRef}
                        src={backgroundVideo}
                        className="absolute inset-0 w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                    />

                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-black/40" />

                    {/* Content Overlay */}
                    <div className="relative z-10 h-full flex flex-col items-center justify-between p-6 md:p-12">
                        {/* Top Section - Song Info */}
                        <div className="w-full max-w-4xl text-center space-y-3 animate-fade-in">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                                <Music className="w-5 h-5 text-white" />
                                <span className="text-sm font-semibold text-white">Huggnote</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight drop-shadow-2xl px-4">
                                {song.title || song.generatedPrompt || 'Untitled Song'}
                            </h1>
                            {song.title && song.generatedPrompt && (
                                <p className="text-sm md:text-base text-white/60 max-w-2xl mx-auto px-4 line-clamp-2">
                                    {song.generatedPrompt}
                                </p>
                            )}
                        </div>

                        {/* Center Section - Play Button */}
                        <div className="flex-1 flex items-center justify-center">
                            <button
                                onClick={togglePlay}
                                className={cn(
                                    "w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl backdrop-blur-md border-4",
                                    isPlaying
                                        ? "bg-white/20 border-white/40 scale-95"
                                        : "bg-white/30 border-white/60 hover:scale-110 hover:bg-white/40"
                                )}
                            >
                                {isPlaying ? (
                                    <Pause className="w-16 h-16 md:w-20 md:h-20 text-white fill-current" />
                                ) : (
                                    <Play className="w-16 h-16 md:w-20 md:h-20 text-white fill-current ml-2" />
                                )}
                            </button>
                        </div>

                        {/* Bottom Section - Controls */}
                        <div className="w-full max-w-4xl space-y-6">
                            {/* Progress Bar */}
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-white/90 w-12 text-right">
                                    {formatTime(currentTime)}
                                </span>
                                <div className="flex-1 h-10 flex items-center relative group">
                                    {/* Track background */}
                                    <div className="absolute w-full h-2 bg-white/20 backdrop-blur-sm rounded-full overflow-hidden">
                                        <div
                                            className="h-full transition-all duration-100 ease-out"
                                            style={{
                                                width: `${progress}%`,
                                                backgroundImage: 'linear-gradient(120deg, #635bff, #ec4899)'
                                            }}
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
                                        className="w-5 h-5 bg-white border-2 rounded-full shadow-lg absolute pointer-events-none transition-all duration-100 ease-out"
                                        style={{
                                            left: `calc(${progress}% - 10px)`,
                                            borderColor: '#635bff'
                                        }}
                                    />
                                </div>
                                <span className="text-sm font-medium text-white/90 w-12">
                                    {formatTime(duration)}
                                </span>
                            </div>

                            {/* Control Buttons */}
                            <div className="flex items-center justify-center gap-4 flex-wrap">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={stopPlayback}
                                    className="h-14 w-14 rounded-full bg-white/10 backdrop-blur-md hover:bg-red-500/30 text-white border border-white/20 transition-all"
                                    title="Stop"
                                >
                                    <Square className="w-6 h-6 fill-current" />
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleMute}
                                    className="h-14 w-14 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20 transition-all"
                                    title={isMuted ? "Unmute" : "Mute"}
                                >
                                    {isMuted ? (
                                        <VolumeX className="w-6 h-6" />
                                    ) : (
                                        <Volume2 className="w-6 h-6" />
                                    )}
                                </Button>

                                {song.audioUrl && (
                                    <Button
                                        variant="outline"
                                        className="h-14 px-6 rounded-full gap-2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border-white/30 hover:border-white/50"
                                        asChild
                                    >
                                        <a href={song.audioUrl} download>
                                            <Download className="w-5 h-5" />
                                            <span className="font-medium">Download</span>
                                        </a>
                                    </Button>
                                )}

                                <Button
                                    variant="outline"
                                    onClick={() => router.push('/')}
                                    className="h-14 px-6 rounded-full gap-2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border-white/30 hover:border-white/50"
                                >
                                    <Home className="w-5 h-5" />
                                    <span className="font-medium">Create Your Song</span>
                                </Button>
                            </div>

                            {/* Lyrics (if available) */}
                            {song.lyrics && (
                                <div className="mt-6 p-6 bg-black/30 backdrop-blur-md rounded-2xl border border-white/10">
                                    <h3 className="text-sm font-semibold text-white/90 mb-3">Lyrics</h3>
                                    <div className="text-sm text-white/70 whitespace-pre-wrap max-h-32 overflow-y-auto custom-scrollbar">
                                        {song.lyrics}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

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

            <style jsx global>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.8s ease-out;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.5);
                }
            `}</style>
        </div>
    );
}
