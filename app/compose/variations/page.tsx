'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PremiumButton } from '@/components/ui/premium-button';
import { Lora } from 'next/font/google';
import { PlayIcon, CheckmarkCircle01Icon, PauseIcon } from 'hugeicons-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const lora = Lora({ subsets: ['latin'] });

interface Variation {
    id: number;
    style: string;
    description: string;
    lyricsPreview: string;
}

interface SongData {
    recipientName: string;
    recipientNickname?: string;
    relationship: string;
    theme: string;
    aboutThem: string;
    moreInfo?: string;
    senderMessage?: string;
}

function VariationsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State
    const [songs, setSongs] = useState<SongData[]>([]);
    const [activeTab, setActiveTab] = useState(0);
    const [selections, setSelections] = useState<Record<number, number>>({}); // { songIndex: variationId }
    const [loading, setLoading] = useState(false);
    const [playingId, setPlayingId] = useState<number | null>(null);
    const [isBundle, setIsBundle] = useState(false);

    // Music Generation State
    const [taskIds, setTaskIds] = useState<Record<number, string[]>>({}); // { songIndex: [taskId1, taskId2, taskId3] }
    const [audioUrls, setAudioUrls] = useState<Record<number, Record<number, string>>>({}); // { songIndex: { variationId: audioUrl } }
    const [lyrics, setLyrics] = useState<Record<number, Record<number, string>>>({}); // { songIndex: { variationId: lyrics } }
    const [generationStatus, setGenerationStatus] = useState<'idle' | 'generating' | 'polling' | 'waiting' | 'ready' | 'error'>('idle');
    const [generationProgress, setGenerationProgress] = useState<string>('');
    const [audioRefs, setAudioRefs] = useState<Record<number, HTMLAudioElement | null>>({});
    const [audioProgress, setAudioProgress] = useState<Record<number, { currentTime: number; duration: number }>>({});

    const formIdParam = searchParams.get('formId');

    // Load Data
    useEffect(() => {
        const loadData = () => {
            let dataToParse = sessionStorage.getItem('songFormData');

            // Fallback to localStorage if needed
            if (!dataToParse && formIdParam) {
                const savedData = localStorage.getItem(`songForm_${formIdParam}`);
                if (savedData) {
                    try {
                        const parsed = JSON.parse(savedData);
                        dataToParse = JSON.stringify(parsed.formData);
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

        // Load existing task IDs and audio URLs from localStorage
        if (songs.length > 0 && formIdParam) {
            const savedData = localStorage.getItem(`songForm_${formIdParam}`);
            if (savedData) {
                try {
                    const parsed = JSON.parse(savedData);

                    // Restore task IDs if they exist
                    if (parsed.variationTaskIds) {
                        console.log('[VARIATIONS] Restoring task IDs from localStorage:', parsed.variationTaskIds);
                        setTaskIds(parsed.variationTaskIds);

                        // Start polling for these existing tasks
                        Object.keys(parsed.variationTaskIds).forEach(songIndexStr => {
                            const songIndex = parseInt(songIndexStr);
                            const taskIdList = parsed.variationTaskIds[songIndex];
                            if (taskIdList && taskIdList.length > 0) {
                                setGenerationStatus('waiting');
                                setGenerationProgress('Checking status of existing variations...');
                                checkDatabaseForUpdates(songIndex);
                            }
                        });
                    }

                    // Restore audio URLs if they exist
                    if (parsed.variationAudioUrls) {
                        console.log('[VARIATIONS] Restoring audio URLs from localStorage:', parsed.variationAudioUrls);
                        setAudioUrls(parsed.variationAudioUrls);

                        // Check if all are ready
                        const allReady = Object.keys(parsed.variationAudioUrls).every(songIndexStr => {
                            const urls = parsed.variationAudioUrls[parseInt(songIndexStr)];
                            return urls && Object.keys(urls).length === 3;
                        });

                        if (allReady) {
                            setGenerationStatus('ready');
                            setGenerationProgress('All variations ready! Click play to listen.');
                        }
                    }
                } catch (e) {
                    console.error('[VARIATIONS] Error loading saved data:', e);
                }
            }
        }
    }, [songs, formIdParam]);

    // Generate music variations when songs are loaded
    useEffect(() => {
        const generateVariations = async () => {
            if (songs.length === 0 || generationStatus !== 'idle') return;

            // Check if we already have task IDs for the current active tab (from localStorage or state)
            if (taskIds[activeTab] && taskIds[activeTab].length > 0) {
                console.log('[VARIATIONS] Task IDs already exist in state for song', activeTab, '- skipping generation');
                return;
            }

            // IMPORTANT: Check database for existing task IDs before generating
            // This prevents wasteful regeneration on page refresh
            if (formIdParam) {
                console.log('[VARIATIONS] Checking database for existing task IDs...');
                try {
                    const response = await fetch(`/api/compose/forms?formId=${formIdParam}`);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.success && data.form) {
                            const existingTaskIds = data.form.variationTaskIds as any || {};
                            const existingAudioUrls = data.form.variationAudioUrls as any || {};
                            const existingLyrics = data.form.variationLyrics as any || {};

                            // Check if we have task IDs for this song in the database
                            if (existingTaskIds[activeTab] && existingTaskIds[activeTab].length > 0) {
                                console.log('[VARIATIONS] ✅ Found existing task IDs in database for song', activeTab);
                                console.log('[VARIATIONS] Task IDs:', existingTaskIds[activeTab]);

                                // Load them into state
                                setTaskIds(existingTaskIds);

                                // Also load audio URLs and lyrics if available
                                if (existingAudioUrls[activeTab]) {
                                    console.log('[VARIATIONS] ✅ Found existing audio URLs in database');
                                    setAudioUrls(existingAudioUrls);
                                    setGenerationStatus('ready');
                                    setGenerationProgress('All variations ready! Click play to listen.');
                                } else {
                                    console.log('[VARIATIONS] Task IDs found but no audio yet - will check database periodically');
                                    setGenerationStatus('waiting');
                                    setGenerationProgress('Generating your song... This may take 2-3 minutes.');
                                    checkDatabaseForUpdates(activeTab);
                                }

                                if (existingLyrics[activeTab]) {
                                    setLyrics(existingLyrics);
                                }

                                // Save to localStorage
                                if (formIdParam) {
                                    const savedData = localStorage.getItem(`songForm_${formIdParam}`);
                                    if (savedData) {
                                        const parsed = JSON.parse(savedData);
                                        parsed.variationTaskIds = existingTaskIds;
                                        parsed.variationAudioUrls = existingAudioUrls;
                                        parsed.variationLyrics = existingLyrics;
                                        localStorage.setItem(`songForm_${formIdParam}`, JSON.stringify(parsed));
                                    }
                                }

                                return; // Don't generate - we already have task IDs!
                            } else {
                                console.log('[VARIATIONS] No existing task IDs found in database - will generate');
                            }
                        }
                    }
                } catch (error) {
                    console.error('[VARIATIONS] Error checking database:', error);
                    // Continue to generation if database check fails
                }
            }

            const allPrompts = JSON.parse(sessionStorage.getItem('allPrompts') || '[]');
            const currentPrompt = allPrompts[activeTab];

            if (!currentPrompt) {
                console.error('[VARIATIONS] No prompt found for song', activeTab);
                return;
            }

            console.log('[VARIATIONS] Starting music generation for song', activeTab);
            setGenerationStatus('generating');
            setGenerationProgress('Generating your song...');

            try {
                // Generate 3 DIFFERENT variations with unique styles
                const songVariations = [
                    {
                        id: 1,
                        name: 'Poetic & Romantic',
                        modifier: 'with poetic romantic style, soft ballad'
                    },
                    {
                        id: 2,
                        name: 'Upbeat & Playful',
                        modifier: 'with upbeat playful style, catchy pop'
                    },
                    {
                        id: 3,
                        name: 'Heartfelt & Emotional',
                        modifier: 'with heartfelt emotional style, acoustic'
                    }
                ];

                const newTaskIds: string[] = [];

                // Generate 3 different songs with unique prompts
                for (let i = 0; i < songVariations.length; i++) {
                    setGenerationProgress(`Creating variation ${i + 1} of 3...`);

                    // Create a unique prompt for each song variation
                    // IMPORTANT: MusicGPT has a 300-character limit!
                    const modifier = songVariations[i].modifier;
                    let basePrompt = currentPrompt;

                    // Calculate combined length and truncate base if needed
                    const maxBaseLength = 300 - modifier.length - 1; // -1 for the space
                    if (basePrompt.length > maxBaseLength) {
                        basePrompt = basePrompt.substring(0, maxBaseLength - 3) + '...';
                        console.log(`[VARIATIONS] Truncated base prompt to ${basePrompt.length} chars to fit modifier`);
                    }

                    const uniquePrompt = `${basePrompt} ${modifier}`;

                    // Final safety check
                    const finalPrompt = uniquePrompt.length > 300
                        ? uniquePrompt.substring(0, 297) + '...'
                        : uniquePrompt;

                    console.log(`[VARIATIONS] Generating variation ${i + 1} (${songVariations[i].name})`);
                    console.log(`[VARIATIONS] Prompt length: ${finalPrompt.length}/300 chars`);
                    console.log(`[VARIATIONS] Prompt: ${finalPrompt}`);

                    let retries = 0;
                    let success = false;
                    let taskId = null;

                    while (!success && retries < 2) {
                        try {
                            const response = await fetch('/api/generate', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    prompt: finalPrompt,
                                    make_instrumental: false,
                                    wait_audio: false,
                                    preview_mode: true,  // Bypass credit check for preview
                                    custom_message: songs[activeTab]?.senderMessage || null  // Add sender message
                                })
                            });

                            const data = await response.json();

                            if (response.status === 429) {
                                console.warn(`[VARIATIONS] Rate limited on variation ${i + 1}, waiting 5s before retry...`);
                                retries++;
                                if (retries < 2) {
                                    await new Promise(resolve => setTimeout(resolve, 5000));
                                    continue;
                                }
                            }

                            console.log(`[VARIATIONS] Variation ${i + 1} response:`, data);

                            if (data.task_id) {
                                taskId = data.task_id;
                                success = true;
                            } else {
                                console.error(`[VARIATIONS] No task_id for variation ${i + 1}`);
                                break; // Break if no task_id and not a 429
                            }
                        } catch (error) {
                            console.error(`[VARIATIONS] Error on variation ${i + 1}:`, error);
                            retries++;
                            if (retries < 2) {
                                await new Promise(resolve => setTimeout(resolve, 5000));
                            }
                        }
                    }

                    if (taskId) {
                        newTaskIds.push(taskId);
                    }

                    // Delay between requests to avoid rate limiting (5 seconds between variations)
                    if (i < songVariations.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 5000));
                    }
                }

                // Store task IDs for this song
                setTaskIds(prev => ({
                    ...prev,
                    [activeTab]: newTaskIds
                }));

                // Save to localStorage
                if (formIdParam) {
                    const savedData = localStorage.getItem(`songForm_${formIdParam}`);
                    if (savedData) {
                        const parsed = JSON.parse(savedData);
                        const updatedTaskIds = {
                            ...parsed.variationTaskIds,
                            [activeTab]: newTaskIds
                        };
                        parsed.variationTaskIds = updatedTaskIds;
                        localStorage.setItem(`songForm_${formIdParam}`, JSON.stringify(parsed));
                        console.log('[VARIATIONS] Saved task IDs to localStorage');

                        // Save to database (BLOCKING - must succeed before starting polling)
                        try {
                            const response = await fetch('/api/compose/forms', {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    formId: formIdParam,
                                    variationTaskIds: updatedTaskIds,
                                    status: 'variations_generating'
                                })
                            });

                            if (!response.ok) {
                                if (response.status === 404) {
                                    console.warn('[VARIATIONS] Form not found in database (old session)');
                                    // For old sessions, we can continue with localStorage only
                                } else {
                                    const errorData = await response.json();
                                    throw new Error(errorData.message || `Database save failed: ${response.status}`);
                                }
                            } else {
                                console.log('[VARIATIONS] ✅ Saved task IDs to database');
                            }
                        } catch (dbError: any) {
                            console.error('[VARIATIONS] ❌ Database save failed:', dbError);
                            setGenerationStatus('error');
                            setGenerationProgress(`Database error: ${dbError.message}. Please refresh and try again.`);
                            return; // STOP - don't start polling
                        }
                    }
                }

                console.log('[VARIATIONS] All variations submitted. Task IDs:', newTaskIds);
                setGenerationStatus('waiting');
                setGenerationProgress('Generating 3 variations... This may take 2-3 minutes per variation.');

                // DISABLED POLLING - Using webhooks instead!
                // The MusicGPT webhook will update the compose_forms table when the song is ready
                // We'll check the database periodically instead of polling the API
                checkDatabaseForUpdates(activeTab);

            } catch (error) {
                console.error('[VARIATIONS] Error generating variations:', error);
                setGenerationStatus('error');
                setGenerationProgress('Failed to generate variations. Please try again.');
            }
        };

        if (songs.length > 0 && generationStatus === 'idle') {
            generateVariations();
        }
    }, [songs, activeTab, generationStatus, taskIds]);

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

    // Check database for webhook updates (instead of polling API)
    const checkDatabaseForUpdates = async (songIndex: number) => {
        console.log('[VARIATIONS] Starting database check for song', songIndex);

        const checkDatabase = async () => {
            if (!formIdParam) return;

            try {
                const response = await fetch(`/api/compose/forms?formId=${formIdParam}`);
                if (!response.ok) {
                    console.error('[VARIATIONS] Failed to fetch form data');
                    return;
                }

                const data = await response.json();
                if (!data.success || !data.form) {
                    console.error('[VARIATIONS] No form data received');
                    return;
                }

                const form = data.form;
                const variationAudioUrls = form.variationAudioUrls || {};
                const variationLyrics = form.variationLyrics || {};

                // Check if we have audio URLs for this song
                if (variationAudioUrls[songIndex]) {
                    const urls = variationAudioUrls[songIndex];
                    const completedCount = Object.keys(urls).length;

                    console.log(`[VARIATIONS] Found ${completedCount} completed variations in database`);

                    // Update state
                    setAudioUrls(prev => ({
                        ...prev,
                        [songIndex]: urls
                    }));

                    if (variationLyrics[songIndex]) {
                        setLyrics(prev => ({
                            ...prev,
                            [songIndex]: variationLyrics[songIndex]
                        }));
                    }

                    // Also update localStorage
                    const savedData = localStorage.getItem(`songForm_${formIdParam}`);
                    if (savedData) {
                        const parsed = JSON.parse(savedData);
                        parsed.variationAudioUrls = variationAudioUrls;
                        parsed.variationLyrics = variationLyrics;
                        localStorage.setItem(`songForm_${formIdParam}`, JSON.stringify(parsed));
                    }

                    // Count lyrics and audio separately
                    const lyricsCount = variationLyrics[songIndex] ? Object.keys(variationLyrics[songIndex]).length : 0;
                    const audioCount = completedCount;

                    // Check if all variations are ready (expecting 3)
                    if (completedCount >= 3) {
                        console.log('[VARIATIONS] All variations ready!');
                        setGenerationStatus('ready');
                        setGenerationProgress('All variations ready! Click play to listen.');
                        return; // Stop checking
                    } else {
                        // Show detailed progress
                        if (lyricsCount > audioCount) {
                            setGenerationProgress(`${lyricsCount} lyrics ready • ${audioCount} of 3 audio ready...`);
                        } else {
                            setGenerationProgress(`${completedCount} of 3 variations ready...`);
                        }
                    }
                }

                // Continue checking every 15 seconds
                setTimeout(checkDatabase, 15000);

            } catch (error) {
                console.error('[VARIATIONS] Error checking database:', error);
                setTimeout(checkDatabase, 15000); // Retry on error
            }
        };

        // Start first check after 10 seconds (give webhook time to process)
        setTimeout(checkDatabase, 10000);
    };

    // COMMENTED OUT: Old polling function (replaced with webhook-based approach)
    /* 
    const pollForAudio = async (songIndex: number, taskIdList: string[]) => {
        console.log('[VARIATIONS] Starting polling for song', songIndex, 'with task IDs:', taskIdList);

        const checkStatus = async () => {
            let completedVariations = 0;
            const currentAudioUrls = audioUrls[songIndex] || {};
            const currentLyrics = lyrics[songIndex] || {};
            const newAudioUrls = { ...currentAudioUrls };
            const newLyrics = { ...currentLyrics };

            // OPTIMIZED: Since all 3 variations use the same task ID now,
            // we only need to poll once and apply to all variations
            const uniqueTaskIds = [...new Set(taskIdList)]; // Remove duplicates

            for (const taskId of uniqueTaskIds) {
                try {
                    const response = await fetch(`/api/status/${taskId}`);
                    const data = await response.json();

                    console.log(`[VARIATIONS] Status for task ${taskId}:`, data.status);

                    if (data.status === 'COMPLETED' || data.status === 'PARTIAL_COMPLETED') {
                        // Each task generates one complete song - use conversion_path_1
                        if (data.conversion?.conversion_path_1) {
                            console.log(`[VARIATIONS] Song completed!`, data.conversion.conversion_path_1);

                            // Apply the same audio URL to ALL variations that use this task ID
                            taskIdList.forEach((tid, index) => {
                                if (tid === taskId) {
                                    const variationId = index + 1;
                                    newAudioUrls[variationId] = data.conversion.conversion_path_1;

                                    // Also store lyrics if available
                                    if (data.conversion?.lyrics_1) {
                                        newLyrics[variationId] = data.conversion.lyrics_1;
                                    }
                                }
                            });

                            console.log(`[VARIATIONS] Applied audio to all variations using task ${taskId}`);
                        }
                    } else if (data.status === 'FAILED') {
                        console.error(`[VARIATIONS] Task ${taskId} failed`);
                    }
                } catch (error) {
                    console.error(`[VARIATIONS] Error checking status for task ${taskId}:`, error);
                }
            }

            // Count how many variations we have now
            completedVariations = Object.keys(newAudioUrls).length;

            // Update state if we have new URLs or lyrics
            if (completedVariations > Object.keys(currentAudioUrls).length) {
                setAudioUrls(prev => ({
                    ...prev,
                    [songIndex]: newAudioUrls
                }));

                setLyrics(prev => ({
                    ...prev,
                    [songIndex]: newLyrics
                }));

                // Save to localStorage
                if (formIdParam) {
                    const savedData = localStorage.getItem(`songForm_${formIdParam}`);
                    if (savedData) {
                        const parsed = JSON.parse(savedData);
                        const updatedAudioUrls = {
                            ...parsed.variationAudioUrls,
                            [songIndex]: newAudioUrls
                        };
                        const updatedLyrics = {
                            ...parsed.variationLyrics,
                            [songIndex]: newLyrics
                        };
                        parsed.variationAudioUrls = updatedAudioUrls;
                        parsed.variationLyrics = updatedLyrics;
                        localStorage.setItem(`songForm_${formIdParam}`, JSON.stringify(parsed));
                        console.log('[VARIATIONS] Saved audio URLs and lyrics to localStorage');

                        // Also save to database
                        try {
                            const response = await fetch('/api/compose/forms', {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    formId: formIdParam,
                                    variationAudioUrls: updatedAudioUrls,
                                    variationLyrics: updatedLyrics,
                                })
                            });

                            if (response.ok) {
                                console.log('[VARIATIONS] Saved audio URLs and lyrics to database');
                            } else if (response.status === 404) {
                                console.warn('[VARIATIONS] Form not found in database (old session) - skipping DB save');
                            } else {
                                console.error('[VARIATIONS] Failed to save to database:', response.status);
                            }
                        } catch (dbError) {
                            console.error('[VARIATIONS] Failed to save audio URLs to database:', dbError);
                        }
                    }
                }
            }

            // Update progress (we expect 3 songs total)
            const expectedSongs = 3;
            setGenerationProgress(`${completedVariations} of ${expectedSongs} songs ready`);

            // Check if all songs are ready
            if (completedVariations >= expectedSongs) {
                console.log('[VARIATIONS] All songs ready!');
                setGenerationStatus('ready');
                setGenerationProgress(`${expectedSongs} songs ready! Click play to listen.`);

                // Update database status to variations_ready
                if (formIdParam) {
                    try {
                        const response = await fetch('/api/compose/forms', {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                formId: formIdParam,
                                status: 'variations_ready'
                            })
                        });

                        if (response.ok) {
                            console.log('[VARIATIONS] Updated database status to variations_ready');
                        } else if (response.status === 404) {
                            console.warn('[VARIATIONS] Form not found in database (old session) - skipping status update');
                        } else {
                            console.error('[VARIATIONS] Failed to update status:', response.status);
                        }
                    } catch (dbError) {
                        console.error('[VARIATIONS] Failed to update status in database:', dbError);
                    }
                }
            } else {
                // Continue polling every 10 seconds
                setTimeout(checkStatus, 10000);
            }
        };

        // Start first check after 5 seconds (give API time to process)
        setTimeout(checkStatus, 5000);
    };
    */


    const handlePlay = (id: number) => {
        const currentSongAudioUrls = audioUrls[activeTab] || {};
        const audioUrl = currentSongAudioUrls[id];

        if (!audioUrl) {
            alert('This variation is still generating. Please wait a moment and try again.');
            return;
        }

        // Stop any currently playing audio
        if (playingId !== null && audioRefs[playingId]) {
            audioRefs[playingId]?.pause();
            audioRefs[playingId] = null;
        }

        if (playingId === id) {
            setPlayingId(null);
            setAudioProgress(prev => ({
                ...prev,
                [id]: { currentTime: 0, duration: 0 }
            }));
        } else {
            setPlayingId(id);
            const audio = new Audio(audioUrl);
            audio.play();

            // Store reference
            setAudioRefs(prev => ({
                ...prev,
                [id]: audio
            }));

            // Track progress for seek slider
            audio.ontimeupdate = () => {
                setAudioProgress(prev => ({
                    ...prev,
                    [id]: {
                        currentTime: audio.currentTime,
                        duration: audio.duration || 0
                    }
                }));
            };

            // Set duration when metadata loads
            audio.onloadedmetadata = () => {
                setAudioProgress(prev => ({
                    ...prev,
                    [id]: {
                        currentTime: 0,
                        duration: audio.duration
                    }
                }));
            };

            // Auto-stop when finished
            audio.onended = () => {
                setPlayingId(null);
                setAudioRefs(prev => ({
                    ...prev,
                    [id]: null
                }));
                setAudioProgress(prev => ({
                    ...prev,
                    [id]: { currentTime: 0, duration: prev[id]?.duration || 0 }
                }));
            };
        }
    };

    const formatTime = (seconds: number): string => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSeek = (id: number, newTime: number) => {
        const audio = audioRefs[id];
        if (audio) {
            audio.currentTime = newTime;
            setAudioProgress(prev => ({
                ...prev,
                [id]: {
                    ...prev[id],
                    currentTime: newTime
                }
            }));
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
            const generatedPrompt = sessionStorage.getItem('generatedPrompt');
            const formId = sessionStorage.getItem('currentFormId');

            // Save selections to localStorage
            if (formId) {
                const savedData = localStorage.getItem(`songForm_${formId}`);
                if (savedData) {
                    const parsedData = JSON.parse(savedData);
                    const updatedData = {
                        ...parsedData,
                        selections: selections,
                        selectedVariationId: selections[0],
                        status: 'payment_initiated',
                        lastUpdated: new Date().toISOString()
                    };
                    localStorage.setItem(`songForm_${formId}`, JSON.stringify(updatedData));
                }

                // Save selections to database
                try {
                    const response = await fetch('/api/compose/forms', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            formId: formId,
                            selectedVariations: selections,
                            status: 'payment_initiated'
                        })
                    });

                    if (!response.ok) {
                        console.error('[VARIATIONS] Failed to save selections to database');
                    } else {
                        console.log('[VARIATIONS] ✅ Saved selections to database');
                    }
                } catch (dbError) {
                    console.error('[VARIATIONS] Error saving selections:', dbError);
                    // Continue anyway - localStorage has the data
                }
            }

            const selectedPackage = sessionStorage.getItem('selectedPackageId') || (songs.length > 1 ? 'holiday-hamper' : 'solo-serenade');

            // Prepare task IDs for selected variations
            const selectedTaskIds: Record<number, string> = {};
            Object.keys(selections).forEach(songIndexStr => {
                const songIndex = parseInt(songIndexStr);
                const variationId = selections[songIndex];
                const songTaskIds = taskIds[songIndex];

                if (songTaskIds && songTaskIds[variationId - 1]) {
                    selectedTaskIds[songIndex] = songTaskIds[variationId - 1];
                }
            });

            console.log('[VARIATIONS] Selected task IDs for payment:', selectedTaskIds);

            // Call Stripe checkout API
            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    packageId: selectedPackage,
                    selections,
                    selectedVariation: selections[0],
                    selectedTaskIds: JSON.stringify(selectedTaskIds),
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

    // Loading state
    if (songs.length === 0 && !loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <LoadingSpinner size="lg" variant="dots" color="primary" />
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Generation Progress Banner */}
            {
                generationStatus !== 'idle' && generationStatus !== 'ready' && (
                    <div className="max-w-6xl mx-auto px-4 mb-6">
                        <div className="bg-[#1e293b]/80 border-2 border-[#87CEEB]/40 rounded-xl p-4 text-center backdrop-blur-sm">
                            <div className="flex items-center justify-center gap-3">
                                <LoadingSpinner size="sm" variant="dots" color="primary" />
                                <p className="text-[#87CEEB] font-medium">{generationProgress}</p>
                            </div>
                            <p className="text-white/60 text-sm mt-2">
                                This may take 2-3 minutes. You can listen to songs as they become ready.
                            </p>
                        </div>
                    </div>
                )
            }

            {
                generationStatus === 'ready' && (
                    <div className="max-w-6xl mx-auto px-4 mb-6">
                        <div className="bg-[#1e293b]/80 border-2 border-[#F5E6B8]/60 rounded-xl p-4 text-center backdrop-blur-sm">
                            <p className="text-[#F5E6B8] font-medium">✨ {generationProgress}</p>
                        </div>
                    </div>
                )
            }

            {
                generationStatus === 'error' && (
                    <div className="max-w-6xl mx-auto px-4 mb-6">
                        <div className="bg-red-900/20 border-2 border-red-500/40 rounded-xl p-4 text-center backdrop-blur-sm">
                            <p className="text-red-300 font-medium">❌ {generationProgress}</p>
                        </div>
                    </div>
                )
            }

            {/* Title */}
            <div className="text-center mb-8">
                <h1 className={`text-white md:text-[#E8DCC0] text-2xl md:text-3xl font-normal mb-2 drop-shadow-xl ${lora.className}`} style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                    {isBundle ? "Select a style for each song" : "Listen and select your favorite"}
                </h1>

                {isBundle && (
                    <p className="text-[#87CEEB] text-center mt-4">
                        {completedCount} of {totalSongs} songs selected
                    </p>
                )}
            </div>

            {/* Tabs for Bundle */}
            {
                isBundle && (
                    <div className="max-w-6xl mx-auto px-4 mb-6">
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
                                                ? 'bg-[#1e293b]/60 text-[#87CEEB] border-[#87CEEB]/50'
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
                )
            }

            {/* Variations Grid */}
            <div className="max-w-6xl mx-auto px-4 pb-8">
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
                                            Song {variation.id}
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

                                {/* Status Indicator */}
                                <div className="mb-3">
                                    {!lyrics[activeTab]?.[variation.id] && !audioUrls[activeTab]?.[variation.id] && (
                                        <div className="flex items-center gap-2 text-sm text-white/60">
                                            <LoadingSpinner size="xs" variant="dots" color="primary" />
                                            <span>Generating your song...</span>
                                        </div>
                                    )}
                                    {lyrics[activeTab]?.[variation.id] && !audioUrls[activeTab]?.[variation.id] && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-green-400">✓</span>
                                            <span className="text-green-400">Lyrics ready</span>
                                            <span className="text-white/40">•</span>
                                            <LoadingSpinner size="xs" variant="dots" color="primary" />
                                            <span className="text-white/60">Generating audio...</span>
                                        </div>
                                    )}
                                    {audioUrls[activeTab]?.[variation.id] && (
                                        <div className="flex items-center gap-2 text-sm text-green-400">
                                            <span>✓</span>
                                            <span>Ready to play!</span>
                                        </div>
                                    )}
                                </div>

                                {/* Lyrics Preview - Show even if audio isn't ready */}
                                {lyrics[activeTab]?.[variation.id] && (
                                    <div className="mb-4 bg-[#0f1e30]/60 rounded-xl p-4 border border-[#87CEEB]/20">
                                        <h4 className="text-[#87CEEB] text-sm font-medium mb-2">📝 Lyrics Preview</h4>
                                        <div className="text-white/80 text-sm leading-relaxed whitespace-pre-line max-h-32 overflow-y-auto custom-scrollbar">
                                            {lyrics[activeTab][variation.id].split('\n').slice(0, 8).join('\n')}
                                            {lyrics[activeTab][variation.id].split('\n').length > 8 && '\n...'}
                                        </div>
                                    </div>
                                )}

                                {/* Play Button */}
                                <div className="mb-4">
                                    <Button
                                        onClick={() => handlePlay(variation.id)}
                                        disabled={!audioUrls[activeTab]?.[variation.id]}
                                        className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 border-0 ${audioUrls[activeTab]?.[variation.id]
                                            ? 'bg-gradient-to-br from-[#87CEEB] to-[#5BA5D0] text-white shadow-[0_4px_20px_rgba(135,206,235,0.4)] hover:shadow-[0_6px_25px_rgba(135,206,235,0.5)]'
                                            : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        {!audioUrls[activeTab]?.[variation.id] ? (
                                            <>
                                                <LoadingSpinner size="sm" variant="dots" color="white" />
                                                <span className="font-medium">Audio Generating...</span>
                                            </>
                                        ) : playingId === variation.id ? (
                                            <>
                                                <PauseIcon className="w-5 h-5" />
                                                <span className="font-medium">Pause</span>
                                            </>
                                        ) : (
                                            <>
                                                <PlayIcon className="w-5 h-5" />
                                                <span className="font-medium">Play Preview</span>
                                            </>
                                        )}
                                    </Button>

                                    {/* Seek Slider */}
                                    {audioUrls[activeTab]?.[variation.id] && audioProgress[variation.id] && (
                                        <div className="mt-3 px-2">
                                            <input
                                                type="range"
                                                min="0"
                                                max={audioProgress[variation.id]?.duration || 0}
                                                value={audioProgress[variation.id]?.currentTime || 0}
                                                onChange={(e) => handleSeek(variation.id, parseFloat(e.target.value))}
                                                className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#87CEEB] hover:accent-[#5BA5D0]"
                                                style={{
                                                    background: `linear-gradient(to right, #87CEEB 0%, #87CEEB ${((audioProgress[variation.id]?.currentTime || 0) / (audioProgress[variation.id]?.duration || 1)) * 100}%, rgba(255,255,255,0.2) ${((audioProgress[variation.id]?.currentTime || 0) / (audioProgress[variation.id]?.duration || 1)) * 100}%, rgba(255,255,255,0.2) 100%)`
                                                }}
                                            />
                                            <div className="flex justify-between text-xs text-white/60 mt-1">
                                                <span>{formatTime(audioProgress[variation.id]?.currentTime || 0)}</span>
                                                <span>{formatTime(audioProgress[variation.id]?.duration || 0)}</span>
                                            </div>
                                        </div>
                                    )}
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
                <div className="mt-6 flex justify-center">
                    <PremiumButton
                        onClick={handleContinue}
                        disabled={loading}
                        className={isBundle && completedCount < totalSongs ? "opacity-70" : ""}
                    >
                        {loading ? (
                            <>
                                <LoadingSpinner size="md" variant="dots" color="primary" />
                                Generating Your Song...
                            </>
                        ) : (
                            isBundle ? `Proceed to Payment (${completedCount}/${totalSongs} Selected)` : "Proceed to Payment"
                        )}
                    </PremiumButton>
                </div>
            </div>

            {/* Custom Scrollbar CSS */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(135, 206, 235, 0.3); border-radius: 10px; }
            `}</style>
        </div >
    );
}

export default function VariationsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[50vh]">
                <LoadingSpinner size="lg" variant="dots" color="primary" />
            </div>
        }>
            <VariationsContent />
        </Suspense>
    );
}
