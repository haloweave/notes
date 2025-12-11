'use client';

import { useState, useRef, useEffect } from 'react';

interface AudioPlayerProps {
    title: string;
    artist: string;
    audioSrc: string;
}

export default function AudioPlayer({ title, artist, audioSrc }: AudioPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const sliderRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateProgress = () => {
            if (!isDragging && audio.duration) {
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(0);
        };

        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [isDragging]);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play().catch(() => { });
        }
        setIsPlaying(!isPlaying);
    };

    const handleSliderClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const audio = audioRef.current;
        const slider = sliderRef.current;
        if (!audio || !slider) return;

        const rect = slider.getBoundingClientRect();
        const value = (e.clientX - rect.left) / rect.width;
        const clampedValue = Math.max(0, Math.min(1, value));

        setProgress(clampedValue * 100);
        if (audio.duration) {
            audio.currentTime = clampedValue * audio.duration;
        }
    };

    return (
        <div style={{
            background: 'white',
            border: '1px solid #e5e5e5',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    background: '#6366f1',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold'
                }}>
                    H
                </div>
            </div>

            {/* Track Info & Play Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>{title}</h4>
                    <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>{artist}</p>
                </div>
                <button
                    onClick={togglePlay}
                    style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: '#6366f1',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {isPlaying ? '⏸' : '▶'}
                </button>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#666' }}>
                    ⏮
                </button>

                <div
                    ref={sliderRef}
                    onClick={handleSliderClick}
                    style={{
                        flex: 1,
                        height: '6px',
                        background: '#e5e5e5',
                        borderRadius: '3px',
                        position: 'relative',
                        cursor: 'pointer'
                    }}
                >
                    <div style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: '#6366f1',
                        borderRadius: '3px',
                        position: 'relative'
                    }}>
                        <div style={{
                            position: 'absolute',
                            right: '-6px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '12px',
                            height: '12px',
                            background: '#6366f1',
                            borderRadius: '50%',
                            border: '2px solid white',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                        }} />
                    </div>
                </div>

                <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#666' }}>
                    ⏭
                </button>
            </div>

            <audio ref={audioRef} src={audioSrc} preload="metadata" />
        </div>
    );
}
