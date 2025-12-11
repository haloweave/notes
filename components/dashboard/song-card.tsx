'use client';

import { useState, useRef, useEffect } from 'react';
import { type MusicGeneration } from '@/lib/db/schema';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, Square, Download, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SongCardProps {
    item: MusicGeneration;
}

export function SongCard({ item }: SongCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const audioUrl = item.audioUrlWav1 || item.audioUrlWav2 || item.audioUrl1 || item.audioUrl2;

    useEffect(() => {
        if (audioRef.current) {
            // Reset state when audio source changes
            setProgress(0);
            setIsPlaying(false);
        }
    }, [audioUrl]);

    const togglePlay = (e?: React.MouseEvent) => {
        e?.stopPropagation();

        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
            setIsExpanded(true);
        }
        setIsPlaying(!isPlaying);
    };

    const stopPlayback = (e?: React.MouseEvent) => {
        e?.stopPropagation();
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

    if (!audioUrl) return null; // Or some error state

    return (
        <Card className={cn(
            "group relative overflow-hidden transition-all duration-300 border border-gray-100 hover:shadow-lg hover:border-purple-100 bg-white",
            isExpanded ? "shadow-md ring-1 ring-purple-100" : ""
        )}>
            {/* Background Gradient Effect on Hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-50/0 via-purple-50/30 to-purple-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="p-6 relative z-10">
                <div className="flex items-center justify-between gap-6">
                    {/* Left: Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            <span className={cn(
                                "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                                item.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            )}>
                                {item.status || 'Processed'}
                            </span>
                            <div className="flex items-center text-xs text-gray-400 gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(item.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg leading-tight truncate pr-4" title={item.generatedPrompt || 'Untitled'}>
                            {item.generatedPrompt || 'Untitled Composition'}
                        </h3>

                    </div>

                    {/* Right: Big Play Button */}
                    <button
                        onClick={togglePlay}
                        className={cn(
                            "flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm",
                            isPlaying
                                ? "bg-purple-100 text-purple-600 scale-95"
                                : "bg-gray-900 text-white hover:bg-purple-600 hover:scale-105 hover:shadow-purple-200 hover:shadow-xl"
                        )}
                    >
                        {isPlaying ? (
                            <Pause className="w-8 h-8 fill-current" />
                        ) : (
                            <Play className="w-8 h-8 fill-current ml-1" />
                        )}
                    </button>
                </div>

                {/* Expanded Section */}
                <div className={cn(
                    "grid transition-all duration-500 ease-in-out",
                    isExpanded ? "grid-rows-[1fr] opacity-100 mt-6 pt-6 border-t border-gray-100" : "grid-rows-[0fr] opacity-0"
                )}>
                    <div className="overflow-hidden min-h-0">
                        {/* Progress Bar */}
                        <div className="flex items-center gap-4 mb-4">
                            <span className="text-xs font-medium text-gray-500 w-10 text-right">{formatTime(currentTime)}</span>
                            <div className="flex-1 h-8 flex items-center relative group/slider">
                                {/* Custom track background */}
                                <div className="absolute w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-purple-500 transition-all duration-100 ease-out"
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
                                {/* Thumb indicator (visual only) */}
                                <div
                                    className="w-4 h-4 bg-white border-2 border-purple-600 rounded-full shadow-md absolute pointer-events-none transition-all duration-100 ease-out"
                                    style={{ left: `calc(${progress}% - 8px)` }}
                                />
                            </div>
                            <span className="text-xs font-medium text-gray-500 w-10">{formatTime(duration)}</span>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-center gap-6">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={stopPlayback}
                                className="h-12 w-12 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
                                title="Stop"
                            >
                                <Square className="w-5 h-5 fill-current" />
                            </Button>

                            <Button
                                variant="outline"
                                className="h-12 px-6 rounded-full gap-2 border-gray-200 hover:border-purple-200 hover:bg-purple-50 text-gray-700"
                                asChild
                            >
                                <a href={audioUrl} download>
                                    <Download className="w-4 h-4" />
                                    <span className="font-medium">Download MP3</span>
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                preload="metadata"
                className="hidden"
            />
        </Card>
    );
}
