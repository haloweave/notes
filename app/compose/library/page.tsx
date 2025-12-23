'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lora } from 'next/font/google';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Share2, Download, Music, Play, Pause } from 'lucide-react';
import Link from 'next/link';

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

function LibraryContent() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [songs, setSongs] = useState<SongData[]>([]);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [audioElements, setAudioElements] = useState<{ [key: string]: HTMLAudioElement }>({});
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    // Fetch all purchased songs
    useEffect(() => {
        const fetchSongs = async () => {
            try {
                const response = await fetch('/api/compose/forms/list', { cache: 'no-store' });
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.forms) {
                        console.log('[LIBRARY] All forms:', data.forms);

                        const purchased = data.forms.filter((f: any) =>
                            f.status === 'payment_successful' ||
                            f.status === 'payment_completed' ||
                            f.status === 'delivered' ||
                            f.status === 'completed'
                        );
                        console.log('[LIBRARY] Purchased forms:', purchased);

                        const formattedSongs = purchased.map((form: any) => {
                            const songIndex = 0;
                            const variationAudioUrls = form.variationAudioUrls || {};
                            const variationTaskIds = form.variationTaskIds || {};
                            const variationTitles = form.variationTitles || {};
                            const variationLyrics = form.variationLyrics || {};
                            const selectedVariations = form.selectedVariations || {};

                            console.log(`[LIBRARY] Processing form ${form.id}`, {
                                variationAudioUrls,
                                variationTaskIds,
                                selectedVariations,
                                songIndex
                            });

                            // Determine which variation was 'purchased' or selected
                            let targetVarId = selectedVariations[songIndex];

                            // Handle potential type mismatches or missing selections
                            if (!targetVarId) {
                                // If variationAudioUrls is an array-like object or has keys
                                const available = variationAudioUrls[songIndex] ? Object.keys(variationAudioUrls[songIndex]) : [];
                                if (available.length > 0) {
                                    // Prefer the first available key
                                    targetVarId = available[0];
                                } else {
                                    targetVarId = 1;
                                }
                            }

                            // Convert to string for safe lookup if keys are strings, but keep int for others if needed
                            // Most likely keys are "1", "2", "3" strings in JSON
                            const varKey = String(targetVarId);

                            // Try to get direct audio URL
                            let audioUrl = variationAudioUrls[songIndex]?.[varKey] || variationAudioUrls[songIndex]?.[Number(targetVarId)];

                            // Fallback: Construct URL from Task ID if possible
                            // Use Task IDs which were confirmed to exist in DB
                            if (!audioUrl) {
                                const taskIdsForSong = variationTaskIds[songIndex];

                                if (Array.isArray(taskIdsForSong)) {
                                    // taskIdsForSong is ["id1", "id2", "id3"]
                                    // targetVarId is likely 1-based index (1, 2, 3)
                                    const index = Number(targetVarId) - 1;
                                    const taskId = taskIdsForSong[index];
                                    if (taskId) {
                                        audioUrl = `https://cdn1.suno.ai/${taskId}.mp3`;
                                    }
                                } else if (taskIdsForSong && typeof taskIdsForSong === 'object') {
                                    const taskId = taskIdsForSong[varKey] || taskIdsForSong[Number(targetVarId)];
                                    if (taskId) {
                                        audioUrl = `https://cdn1.suno.ai/${taskId}.mp3`;
                                    }
                                }
                            }

                            // Extract Lyrics
                            const lyrics = variationLyrics[songIndex]?.[varKey] || variationLyrics[songIndex]?.[Number(targetVarId)];

                            // Extract Metadata
                            const recipient = form.formData?.songs?.[0]?.recipientName || form.formData?.recipientName || 'Unknown';
                            const relationship = form.formData?.songs?.[0]?.relationship || form.formData?.relationship;
                            const theme = form.formData?.songs?.[0]?.theme || form.formData?.theme;

                            // Robust Title Extraction
                            // DB might return variationTitles as array of arrays [["Title 1"], ["Title 2"]] or object {1: "Title 1"}
                            let title = `Song for ${recipient}`;
                            const rawTitles = variationTitles[songIndex];

                            if (Array.isArray(rawTitles)) {
                                // If it's an array ["Title1", "Title2"]
                                const index = Number(targetVarId) - 1;
                                if (rawTitles[index]) {
                                    title = Array.isArray(rawTitles[index]) ? rawTitles[index][0] : rawTitles[index];
                                }
                            } else if (rawTitles && typeof rawTitles === 'object') {
                                // If it's an object {1: "Title1", 2: "Title2"}
                                const t = rawTitles[varKey] || rawTitles[Number(targetVarId)];
                                if (t) title = t;
                            }

                            return {
                                id: form.id,
                                title: title,
                                description: `${theme || 'Special Song'} • ${relationship || 'Loved One'}`,
                                audioUrl: audioUrl,
                                date: new Date(form.createdAt).toLocaleDateString(),
                                recipient: recipient,
                                relationship,
                                theme,
                                lyrics
                            };
                        }).filter((song: any) => song.audioUrl);

                        console.log('[LIBRARY] Formatted songs:', formattedSongs);
                        setSongs(formattedSongs);
                    }
                }
            } catch (error) {
                console.error("Error fetching library:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSongs();
    }, []);

    const togglePlay = (id: string, url: string) => {
        if (playingId === id) {
            // Pause
            if (audioElements[id]) {
                audioElements[id].pause();
            }
            setPlayingId(null);
        } else {
            // Stop currently playing
            if (playingId && audioElements[playingId]) {
                audioElements[playingId].pause();
                audioElements[playingId].currentTime = 0; // Optional: reset previous song
            }

            // Play new
            if (!audioElements[id]) {
                const audio = new Audio(url);

                audio.addEventListener('loadedmetadata', () => {
                    setDuration(audio.duration);
                });

                audio.addEventListener('timeupdate', () => {
                    setProgress(audio.currentTime);
                });

                audio.addEventListener('ended', () => {
                    setPlayingId(null);
                    setProgress(0);
                });

                setAudioElements(prev => ({ ...prev, [id]: audio }));
                audio.play();
            } else {
                audioElements[id].play();
            }
            setPlayingId(id);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (playingId && audioElements[playingId]) {
            const time = parseFloat(e.target.value);
            audioElements[playingId].currentTime = time;
            setProgress(time);
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleDownload = (song: SongData) => {
        // HTML Template for standalone player
        const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${song.title} - Huggnote Solo Serenade</title>
  
  <!-- Google Fonts - Lora -->
  <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap" rel="stylesheet">
  
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Lora', Georgia, serif; margin: 0; padding: 0; overflow-x: hidden; background-color: #0f2438; color: #E0F4FF; }
    
    /* Background with overlay */
    .page-wrapper { min-height: 100vh; position: relative; overflow: hidden; }
    .background-image { position: absolute; inset: 0; background: radial-gradient(circle at center, #1a3d5f 0%, #0a1420 100%); z-index: 0; }
    
    /* Twinkling stars */
    .stars-container { position: absolute; inset: 0; z-index: 2; pointer-events: none; }
    .star { position: absolute; border-radius: 50%; background: white; animation: twinkle 3s infinite ease-in-out; }
    @keyframes twinkle { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }

    /* Header */
    .header { position: relative; z-index: 20; padding: 2rem 1rem 1rem 1rem; text-align: center; }
    .logo { height: 4rem; width: auto; margin-bottom: 1.5rem; }
    .nav-buttons { display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap; }
    .nav-button { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; background: rgba(255, 255, 255, 0.05); border: 2px solid rgba(135, 206, 235, 0.4); border-radius: 12px; color: #E0F4FF; text-decoration: none; transition: all 0.2s; backdrop-filter: blur(10px); }
    .nav-button:hover { background: rgba(135, 206, 235, 0.2); border-color: #87CEEB; transform: translateY(-2px); }
    .nav-button.gold { border-color: rgba(245, 230, 184, 0.4); }
    .nav-button.gold:hover { border-color: #F5E6B8; background: rgba(245, 230, 184, 0.2); }

    /* Content */
    .content { position: relative; z-index: 10; max-width: 60rem; margin: 0 auto; padding: 1rem 1rem 3rem 1rem; text-align: center; }
    .main-title { color: #E8DCC0; font-size: 2rem; margin-bottom: 0.5rem; }
    .package-title { color: #E8DCC0; font-size: 1.5rem; font-style: italic; margin-bottom: 1rem; opacity: 0.8; }
    .welcome-text { font-size: 1.125rem; font-style: italic; margin-bottom: 3rem; opacity: 0.9; }

    /* Song Card */
    .song-card { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border: 2px solid rgba(135, 206, 235, 0.4); border-radius: 16px; padding: 2rem; margin: 0 auto; box-shadow: 0 8px 30px rgba(135, 206, 235, 0.1); }
    .song-title { color: #F5E6B8; font-size: 1.5rem; margin-bottom: 1.5rem; font-weight: 600; }
    
    /* Player */
    .audio-player { width: 100%; height: 50px; border-radius: 25px; margin-bottom: 1.5rem; }
    
    /* Actions */
    .action-buttons { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
    .action-button { display: flex; align-items: center; gap: 0.5rem; padding: 0.8rem 1.5rem; background: rgba(255, 255, 255, 0.1); border: none; border-radius: 12px; color: #E0F4FF; cursor: pointer; transition: all 0.2s; font-family: 'Lora', serif; }
    .action-button:hover { background: rgba(135, 206, 235, 0.2); transform: translateY(-2px); }
    .action-button svg { width: 1.25rem; height: 1.25rem; }

    @media (min-width: 768px) {
        .main-title { font-size: 3rem; }
        .song-card { padding: 3rem; }
    }
  </style>
</head>
<body>
  <div class="page-wrapper">
    <div class="background-image"></div>
    <div class="stars-container" id="stars"></div>

    <header class="header">
      <!-- Implicit Logo or Text if image missing -->
      <h2 style="color: #F5E6B8; font-style: italic; margin-bottom: 1rem;">Huggnote</h2>
      
      <nav class="nav-buttons">
        <a href="https://huggnote.com/compose/library" class="nav-button">My Library</a>
        <a href="https://huggnote.com/compose" class="nav-button gold">Order New Song</a>
      </nav>
    </header>

    <main class="content">
      <div class="title-section">
        <h1 class="main-title">Presenting Your Bespoke Song</h1>
        <h2 class="package-title">Solo Serenade</h2>
        <p class="welcome-text">Hi ${song.recipient}, please find your masterpiece below - giftwrapped in emotion and ready to share.</p>
      </div>

      <div class="song-card">
        <h3 class="song-title">${song.title}</h3>
        <audio controls class="audio-player">
          <source src="${song.audioUrl}" type="audio/mpeg">
          Your browser does not support the audio element.
        </audio>
        
        <div class="action-buttons">
            <!-- Download Button -->
            <a href="${song.audioUrl}" download class="action-button" title="Download MP3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                <span>Download MP3</span>
            </a>
             <!-- Share Button -->
            <button class="action-button" onclick="navigator.clipboard.writeText(window.location.href); alert('Link copied!')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                <span>Share</span>
            </button>
        </div>
      </div>
      
      ${song.lyrics ? `
      <div style="margin-top: 3rem; background: rgba(0,0,0,0.2); padding: 2rem; border-radius: 12px; max-width: 40rem; margin-left: auto; margin-right: auto;">
        <h3 style="color: #F5E6B8; margin-bottom: 1rem; text-transform: uppercase; font-size: 0.9rem; letter-spacing: 2px;">Lyrics</h3>
        <p style="white-space: pre-wrap; line-height: 1.8; opacity: 0.9;">${song.lyrics}</p>
      </div>
      ` : ''}

    </main>
  </div>

  <script>
    // Star Animation
    const stars = document.getElementById('stars');
    for(let i=0; i<80; i++) {
        const s = document.createElement('div');
        s.className = 'star';
        s.style.left = Math.random()*100 + '%';
        s.style.top = Math.random()*100 + '%';
        s.style.width = (Math.random()*3+1) + 'px';
        s.style.height = s.style.width;
        s.style.animationDelay = Math.random()*3 + 's';
        stars.appendChild(s);
    }
  </script>
</body>
</html>`;

        const blob = new Blob([htmlTemplate], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${song.title.replace(/\s+/g, '-')}_Gift.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleShare = async (song: SongData) => {
        const shareUrl = `${window.location.origin}`;

        try {
            await navigator.clipboard.writeText(shareUrl);
            alert('Link copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <LoadingSpinner size="lg" variant="dots" customColor="#F5E6B8" />
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Main Content */}
            <main className="relative z-10 max-w-5xl mx-auto px-4 py-8">
                <div className="mb-10 text-center">
                    <h1 className={`text-3xl md:text-4xl text-[#E8DCC0] mb-3 ${lora.className}`}>
                        Your Song Library
                    </h1>
                    <p className={`text-[#E0F4FF]/70 text-lg italic ${lora.className}`}>
                        A collection of your bespoke musical memories
                    </p>
                </div>

                {songs.length === 0 ? (
                    <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                        <Music className="w-16 h-16 text-[#F5E6B8]/50 mx-auto mb-4" />
                        <h3 className={`text-xl text-[#F5E6B8] mb-2 ${lora.className}`}>No Songs Yet</h3>
                        <p className="text-[#E0F4FF]/60 mb-6">You haven't purchased any songs yet.</p>
                        <Link
                            href="/compose"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#87CEEB] hover:bg-[#5BA5D0] text-[#0f2438] rounded-xl font-medium transition-colors"
                        >
                            Create Your First Song
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {songs.map((song) => {
                            const isPlaying = playingId === song.id;

                            return (
                                <div
                                    key={song.id}
                                    className={`group relative bg-white/5 backdrop-blur-md border border-[#87CEEB]/20 rounded-2xl p-6 transition-all duration-300 shadow-lg ${isPlaying ? 'border-[#87CEEB] bg-white/10' : 'hover:border-[#87CEEB]/50 hover:bg-white/10 hover:-translate-y-1'}`}
                                >
                                    <div className="flex flex-col md:flex-row items-center gap-6">
                                        {/* Play Button */}
                                        <button
                                            onClick={() => togglePlay(song.id, song.audioUrl)}
                                            className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F5E6B8] to-[#D4C89A] flex items-center justify-center flex-shrink-0 shadow-lg hover:scale-105 transition-transform group-hover:shadow-[0_0_20px_rgba(245,230,184,0.4)]"
                                        >
                                            {isPlaying ? (
                                                <Pause className="w-8 h-8 text-[#1a3d5f] fill-current" />
                                            ) : (
                                                <Play className="w-8 h-8 text-[#1a3d5f] fill-current ml-1" />
                                            )}
                                        </button>

                                        {/* Info */}
                                        <div className="flex-1 text-center md:text-left w-full">
                                            <h3 className={`text-xl md:text-2xl text-[#E0F4FF] mb-1 ${lora.className}`}>
                                                {song.title}
                                            </h3>
                                            <p className="text-[#87CEEB] text-sm md:text-base mb-2 font-medium">
                                                For {song.recipient}
                                            </p>
                                            {!isPlaying && (
                                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs md:text-sm text-[#E0F4FF]/50">
                                                    <span>{song.date}</span>
                                                    <span>•</span>
                                                    <span>{song.description}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions (Hidden when playing on mobile to save space, shown otherwise) */}
                                        {!isPlaying && (
                                            <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-white/10">
                                                <button
                                                    onClick={() => handleShare(song)}
                                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-[#87CEEB]/20 text-[#87CEEB] transition-colors"
                                                >
                                                    <Share2 className="w-4 h-4" />
                                                    <span>Share</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDownload(song)}
                                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-[#F5E6B8]/20 text-[#F5E6B8] transition-colors"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    <span>Download</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Expanded Player & Lyrics */}
                                    {isPlaying && (
                                        <div className="mt-8 pt-6 border-t border-white/10 animate-fade-in">
                                            {/* Progress Bar */}
                                            <div className="mb-6">
                                                <div className="flex items-center justify-between text-xs text-[#E0F4FF]/60 mb-2 font-mono">
                                                    <span>{formatTime(progress)}</span>
                                                    <span>{formatTime(duration)}</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max={duration || 100}
                                                    value={progress}
                                                    onChange={handleSeek}
                                                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#F5E6B8] hover:accent-[#E8DCC0]"
                                                />
                                            </div>

                                            {/* Lyrics */}
                                            {song.lyrics && (
                                                <div className="bg-black/20 rounded-xl p-6 max-h-[300px] overflow-y-auto custom-scrollbar">
                                                    <h4 className={`text-[#F5E6B8] mb-4 text-center text-sm uppercase tracking-widest ${lora.className}`}>Lyrics</h4>
                                                    <p className={`text-[#E0F4FF]/90 text-center whitespace-pre-wrap leading-relaxed ${lora.className}`}>
                                                        {song.lyrics}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Actions moved here when playing */}
                                            <div className="flex items-center justify-center gap-4 mt-6">
                                                <button
                                                    onClick={() => handleShare(song)}
                                                    className="flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 hover:bg-[#87CEEB]/20 text-[#87CEEB] transition-colors border border-white/5"
                                                >
                                                    <Share2 className="w-4 h-4" />
                                                    <span>Share Song</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDownload(song)}
                                                    className="flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 hover:bg-[#F5E6B8]/20 text-[#F5E6B8] transition-colors border border-white/5"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    <span>Download MP3</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(245, 230, 184, 0.3);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(245, 230, 184, 0.5);
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
            `}</style>

            {/* Footer */}
            <footer className="relative z-10 py-8 text-center opacity-60">
                <p className={`text-[#E0F4FF] text-sm ${lora.className}`}>
                    Created with ❤️ by Huggnote
                </p>
            </footer>
        </div>
    );
}

export default function LibraryPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0f2438]" />}>
            <LibraryContent />
        </Suspense>
    );
}
