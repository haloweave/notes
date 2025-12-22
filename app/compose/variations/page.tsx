'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PremiumButton } from '@/components/ui/premium-button';
import { Lora } from 'next/font/google';
import { Play, Pause, Music } from 'lucide-react';
import { CheckmarkCircle01Icon } from 'hugeicons-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { LoginDialog } from '@/components/auth/login-dialog';
import { useSession } from '@/lib/auth-client';
import { useLoginDialog } from '@/contexts/login-dialog-context';

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
    // Musical preferences
    voiceType?: string;
    genreStyle?: string;
    style?: string;
    vibe?: string;
}

function VariationsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const { isOpen: showLoginDialog, openDialog, closeDialog } = useLoginDialog();

    // State
    const [songs, setSongs] = useState<SongData[]>([]);
    const [activeTab, setActiveTab] = useState(0);
    const [selections, setSelections] = useState<Record<number, number>>({}); // { songIndex: variationId }
    const [loading, setLoading] = useState(false);
    const [playingId, setPlayingId] = useState<number | null>(null);
    const [isBundle, setIsBundle] = useState(false);
    const [isLoadingSession, setIsLoadingSession] = useState(false);

    // Music Generation State
    const [taskIds, setTaskIds] = useState<Record<number, (string | null)[]>>({}); // { songIndex: [taskId1, taskId2, taskId3] }
    const [audioUrls, setAudioUrls] = useState<Record<number, Record<number, string>>>({}); // { songIndex: { variationId: audioUrl } }
    const [lyrics, setLyrics] = useState<Record<number, Record<number, string>>>({}); // { songIndex: { variationId: lyrics } }
    const [generationStatus, setGenerationStatus] = useState<'idle' | 'generating' | 'polling' | 'waiting' | 'ready' | 'error'>('idle');
    const [generationProgress, setGenerationProgress] = useState<string>('');
    const [audioRefs, setAudioRefs] = useState<Record<number, HTMLAudioElement | null>>({});
    const [audioProgress, setAudioProgress] = useState<Record<number, { currentTime: number; duration: number }>>({});

    // 🔥 CRITICAL: Prevent duplicate generation (React Strict Mode + effect re-runs)
    const generationStartedRef = useRef<boolean>(false);

    const formIdParam = searchParams.get('formId');

    // Associate form with logged-in user
    const associateFormWithUser = async () => {
        if (!session?.user?.id || !formIdParam) return;

        try {
            console.log('[VARIATIONS] Associating form with user:', session.user.id);
            const response = await fetch('/api/compose/forms', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    formId: formIdParam,
                    userId: session.user.id,
                })
            });

            if (response.ok) {
                console.log('[VARIATIONS] ✅ Form associated with user');
            } else {
                console.error('[VARIATIONS] Failed to associate form with user');
            }
        } catch (error) {
            console.error('[VARIATIONS] Error associating form:', error);
        }
    };

    // Auto-associate form when user logs in
    useEffect(() => {
        if (session?.user?.id && formIdParam) {
            associateFormWithUser();
        }
    }, [session?.user?.id, formIdParam]);

    // Clear loading state when session is ready (safety mechanism)
    useEffect(() => {
        if (session !== undefined) {
            // Session has loaded (either with user or without)
            const timer = setTimeout(() => {
                setIsLoadingSession(false);
                console.log('[VARIATIONS] Loading state cleared by session ready check');
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [session]);

    // Load Data
    useEffect(() => {
        const loadData = async () => {
            console.log('[VARIATIONS] Loading data for formId:', formIdParam);
            setIsLoadingSession(true);

            // Clear old data first
            setSongs([]);
            setTaskIds({});
            setAudioUrls({});
            setLyrics({});
            setSelections({});
            setActiveTab(0);

            let formData = null;
            let dbTaskIds = null;
            let dbAudioUrls = null;
            let dbLyrics = null;

            // If formId is present, fetch from database (for history/purchases)
            if (formIdParam) {
                console.log('[VARIATIONS] Fetching from database...');
                try {
                    const response = await fetch(`/api/compose/forms/${formIdParam}`);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.success && data.form) {
                            formData = data.form.formData;
                            dbTaskIds = data.form.variationTaskIds || {};
                            dbAudioUrls = data.form.variationAudioUrls || {};
                            dbLyrics = data.form.variationLyrics || {};
                            console.log('[VARIATIONS] ✅ Loaded from database');
                            console.log('[VARIATIONS] Existing taskIds:', dbTaskIds);
                            console.log('[VARIATIONS] Existing audioUrls:', dbAudioUrls);
                        }
                    }
                } catch (error) {
                    console.error('[VARIATIONS] Database fetch error:', error);
                }
            }

            // Fallback to sessionStorage (for new creations)
            if (!formData) {
                const sessionData = sessionStorage.getItem('songFormData');
                if (sessionData) {
                    try {
                        formData = JSON.parse(sessionData);
                        console.log('[VARIATIONS] Loaded from sessionStorage');
                    } catch (e) {
                        console.error('[VARIATIONS] Error parsing sessionStorage:', e);
                    }
                }
            }

            // Set songs data
            if (formData) {
                if (formData.songs && Array.isArray(formData.songs)) {
                    setSongs(formData.songs);
                } else {
                    // Handle legacy single song format
                    setSongs([formData]);
                }
            } else {
                console.warn('[VARIATIONS] No form data found');
            }

            // Restore existing variation data from database
            if (dbTaskIds && Object.keys(dbTaskIds).length > 0) {
                console.log('[VARIATIONS] Restoring existing variations from database');
                setTaskIds(dbTaskIds);
                setAudioUrls(dbAudioUrls || {});
                setLyrics(dbLyrics || {});
                setGenerationStatus('ready'); // Mark as ready since we have existing data
            }

            // Clear loading state
            setTimeout(() => {
                setIsLoadingSession(false);
                console.log('[VARIATIONS] Loading complete');
            }, 300);
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
            // 🔥 CRITICAL FIX: Prevent race condition during page load
            if (isLoadingSession) {
                console.log('[VARIATIONS] Still loading session data, skipping generation check');
                return;
            }

            if (songs.length === 0 || generationStatus !== 'idle') return;

            // 🔥 CRITICAL: Prevent duplicate generation (React Strict Mode)
            if (generationStartedRef.current) {
                console.log('[VARIATIONS] Generation already started, skipping duplicate request');
                return;
            }

            // Check if we already have task IDs for the current active tab (from localStorage or state)
            // Use the current value from state, not from dependencies
            const currentTaskIds = taskIds[activeTab];
            if (currentTaskIds && currentTaskIds.length > 0) {
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
                            const variationStyles = data.form.variationStyles as any || []; // NEW: Load variation styles from DB

                            // Store variation styles in sessionStorage for UI access
                            if (variationStyles && variationStyles.length > 0) {
                                sessionStorage.setItem('allVariationStyles', JSON.stringify(variationStyles));
                                console.log('[VARIATIONS] ✅ Loaded variation styles from database:', variationStyles);
                            }

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
            const allMusicStyles = JSON.parse(sessionStorage.getItem('allMusicStyles') || '[]'); // NEW: Get music styles
            const currentPrompt = allPrompts[activeTab];
            const currentMusicStyle = allMusicStyles[activeTab]; // NEW: Get style for current song

            if (!currentPrompt) {
                console.error('[VARIATIONS] No prompt found for song', activeTab);
                return;
            }

            console.log('[VARIATIONS] Starting music generation for song', activeTab);
            console.log('[VARIATIONS] Base music style:', currentMusicStyle);

            // 🔥 Mark generation as started to prevent duplicates
            generationStartedRef.current = true;

            setGenerationStatus('generating');
            setGenerationProgress('Generating your song...');

            try {
                // Generate 3 variations with AI-generated contextual styles
                // These styles are dynamically generated based on the song's theme, emotions, and vibe
                const newTaskIds: (string | null)[] = [];

                // Get AI-generated variation styles from sessionStorage (loaded from database)
                const allVariationStyles = JSON.parse(sessionStorage.getItem('allVariationStyles') || '[]');
                const currentVariationStyles = allVariationStyles[activeTab] || [
                    'standard tempo',
                    'slightly varied',
                    'alternative interpretation'
                ];

                console.log('[VARIATIONS] Using AI-generated variation styles:', currentVariationStyles);

                // Generate 3 variations with AI-generated styles
                for (let i = 0; i < 3; i++) {
                    setGenerationProgress(`Creating variation ${i + 1} of 3...`);

                    // Use the base prompt from form
                    // MusicGPT recommends <280 characters for optimal results
                    let finalPrompt = currentPrompt;

                    // Ensure prompt is within 280 character limit
                    if (finalPrompt.length > 280) {
                        finalPrompt = finalPrompt.substring(0, 277) + '...';
                        console.log(`[VARIATIONS] Truncated prompt to ${finalPrompt.length} chars`);
                    }

                    // Use the music style from the form
                    let musicStyle = currentMusicStyle;

                    // Add AI-generated variation style (contextually appropriate)
                    if (currentVariationStyles[i]) {
                        musicStyle = `${musicStyle}, ${currentVariationStyles[i]}`;
                        console.log(`[VARIATIONS] Added AI variation style: ${currentVariationStyles[i]}`);
                    }

                    // Add voice type if specified
                    const currentSong = songs[activeTab];
                    if (currentSong?.voiceType) {
                        musicStyle = `${musicStyle}, ${currentSong.voiceType} voice`;
                        console.log(`[VARIATIONS] Added voice type: ${currentSong.voiceType}`);
                    }

                    console.log(`[VARIATIONS] Generating variation ${i + 1} (${currentVariationStyles[i]})`);
                    console.log(`[VARIATIONS] Prompt length: ${finalPrompt.length}/280 chars`);
                    console.log(`[VARIATIONS] Prompt: ${finalPrompt}`);
                    console.log(`[VARIATIONS] Music Style: ${musicStyle}`);

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
                                    music_style: musicStyle,  // Pass style separately (now includes voice type)
                                    make_instrumental: false,
                                    wait_audio: false,
                                    preview_mode: true,  // Bypass credit check for preview
                                    custom_message: songs[activeTab]?.senderMessage || null
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

                        // 🔥 CRITICAL FIX: Save immediately to prevent data loss if user closes tab
                        // Update state immediately
                        setTaskIds(prev => ({
                            ...prev,
                            [activeTab]: [...newTaskIds]
                        }));

                        // Save to localStorage immediately
                        if (formIdParam) {
                            const savedData = localStorage.getItem(`songForm_${formIdParam}`);
                            if (savedData) {
                                const parsed = JSON.parse(savedData);
                                const updatedTaskIds = {
                                    ...parsed.variationTaskIds,
                                    [activeTab]: [...newTaskIds]
                                };
                                parsed.variationTaskIds = updatedTaskIds;
                                localStorage.setItem(`songForm_${formIdParam}`, JSON.stringify(parsed));
                                console.log(`[VARIATIONS] ✅ Saved task ID ${i + 1} to localStorage immediately`);

                                // 🔥 Save to database IMMEDIATELY (don't wait for all 3)
                                try {
                                    const response = await fetch('/api/compose/forms', {
                                        method: 'PATCH',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            formId: formIdParam,
                                            variationTaskIds: updatedTaskIds,
                                            status: i === 0 ? 'variations_generating' : undefined // Only update status on first save
                                        })
                                    });

                                    if (!response.ok && response.status !== 404) {
                                        console.error(`[VARIATIONS] ⚠️ Failed to save task ID ${i + 1} to database (non-critical)`);
                                        // Don't throw - continue generation even if DB save fails
                                    } else if (response.ok) {
                                        console.log(`[VARIATIONS] ✅ Saved task ID ${i + 1} to database immediately`);
                                    }
                                } catch (dbError) {
                                    console.error(`[VARIATIONS] ⚠️ Database save error for task ID ${i + 1}:`, dbError);
                                    // Don't throw - continue generation
                                }
                            }
                        }
                    } else {
                        console.warn(`[VARIATIONS] Pushing null for variation ${i + 1} due to failure`);
                        newTaskIds.push(null);
                    }

                    // Delay between requests to avoid rate limiting (5 seconds between variations)
                    if (i < 2) { // 3 variations total (0, 1, 2), so delay after 0 and 1
                        await new Promise(resolve => setTimeout(resolve, 5000));
                    }
                }

                // Final state update (redundant but ensures consistency)
                setTaskIds(prev => ({
                    ...prev,
                    [activeTab]: newTaskIds
                }));

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
                // Reset the ref on error so user can retry
                generationStartedRef.current = false;
            }
        };

        if (songs.length > 0 && generationStatus === 'idle' && !isLoadingSession) {
            generateVariations();
        }
    }, [songs, activeTab, generationStatus, isLoadingSession]); // Removed taskIds from dependencies!

    // Dynamic Variations based on current song
    const currentSong = songs[activeTab] || {};
    const recipientName = currentSong.recipientName || 'Name';
    const relationship = currentSong.relationship || 'Friend';
    const theme = currentSong.theme || 'Special Occasion';

    // Get AI-generated variation styles from sessionStorage
    const allVariationStyles = JSON.parse(sessionStorage.getItem('allVariationStyles') || '[]');
    const currentVariationStyles = allVariationStyles[activeTab] || [
        'standard tempo',
        'slightly varied',
        'alternative interpretation'
    ];

    // Capitalize first letter of each variation style for display
    const formatVariationName = (style: string) => {
        return style.charAt(0).toUpperCase() + style.slice(1);
    };

    const variations: Variation[] = [
        {
            id: 1,
            style: formatVariationName(currentVariationStyles[0]),
            description: 'Your song with the exact style you chose',
            lyricsPreview: `Through the years we've shared so much, ${recipientName}\nFrom ${theme} moments, memories gold\nMy dear ${relationship}, your touch\nA story that deserves to be told`,
        },
        {
            id: 2,
            style: formatVariationName(currentVariationStyles[1]),
            description: `A variation with ${currentVariationStyles[1]} feel`,
            lyricsPreview: `Hey ${recipientName}, remember all those days\nWhen we'd celebrate in simple ways\nMy ${relationship}, you're one of a kind\nThis ${theme} brings you to mind`,
        },
        {
            id: 3,
            style: formatVariationName(currentVariationStyles[2]),
            description: `A variation with ${currentVariationStyles[2]} feel`,
            lyricsPreview: `${recipientName}, my ${relationship}, my guiding light\nThis ${theme} message feels so right\nEvery moment that we've shared\nShows how deeply I have cared`,
        },
    ];

    // Check database for webhook updates (instead of polling API)
    const checkDatabaseForUpdates = async (songIndex: number) => {
        console.log('[VARIATIONS] Starting database check for song', songIndex);

        // 🔥 CRITICAL FIX: Add timeout to prevent infinite polling
        const startTime = Date.now();
        const MAX_WAIT_TIME = 5 * 60 * 1000; // 5 minutes

        const checkDatabase = async () => {
            if (!formIdParam) return;

            // Check if we've exceeded timeout
            const elapsed = Date.now() - startTime;
            if (elapsed > MAX_WAIT_TIME) {
                console.error('[VARIATIONS] ⏱️ Generation timeout after 5 minutes');
                setGenerationStatus('error');
                setGenerationProgress('Generation is taking longer than expected. Please refresh the page or contact support if the issue persists.');
                return; // Stop polling
            }

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

                    // Also check task IDs to know how many we SHOULD expect
                    // (Some might have failed generation and be null)
                    const formTaskIds = form.variationTaskIds?.[songIndex] || [];
                    const validTaskCount = Array.isArray(formTaskIds)
                        ? formTaskIds.filter(id => id !== null).length
                        : 3;

                    const expectedCount = validTaskCount > 0 ? validTaskCount : 3;

                    console.log(`[VARIATIONS] Found ${completedCount} completed variations in database (Expected: ${expectedCount})`);

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

                    // Check if all variations are ready
                    if (completedCount >= expectedCount) {
                        console.log('[VARIATIONS] All valid variations ready!');
                        setGenerationStatus('ready');
                        setGenerationProgress('All variations ready! Click play to listen.');
                        return; // Stop checking
                    } else {
                        // Show detailed progress with time remaining
                        const minutesElapsed = Math.floor(elapsed / 60000);
                        const timeRemaining = Math.max(0, 5 - minutesElapsed);

                        if (lyricsCount > audioCount) {
                            setGenerationProgress(`${lyricsCount} lyrics ready • ${audioCount} of ${expectedCount} audio ready... (~${timeRemaining} min remaining)`);
                        } else {
                            setGenerationProgress(`${completedCount} of ${expectedCount} variations ready... (~${timeRemaining} min remaining)`);
                        }
                    }
                }

                // Continue checking every 15 seconds
                setTimeout(checkDatabase, 15000);

            } catch (error) {
                console.error('[VARIATIONS] Error checking database:', error);

                // Check timeout even on error
                const elapsed = Date.now() - startTime;
                if (elapsed > MAX_WAIT_TIME) {
                    setGenerationStatus('error');
                    setGenerationProgress('Unable to check generation status. Please refresh the page.');
                    return;
                }

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

            // 🎵 PREVIEW MODE: Play 20 seconds from start initially
            const INITIAL_PREVIEW_DURATION = 20; // 20 seconds for first play
            let previewStartTime = 0;
            let previewDuration = INITIAL_PREVIEW_DURATION;

            audio.play();

            // Store reference
            setAudioRefs(prev => ({
                ...prev,
                [id]: audio
            }));

            // Track progress for seek slider
            audio.ontimeupdate = () => {
                // 🎵 Auto-stop after preview duration
                if (audio.currentTime >= previewStartTime + previewDuration) {
                    audio.pause();
                    setPlayingId(null);
                    setAudioRefs(prev => ({
                        ...prev,
                        [id]: null
                    }));
                }

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

            // 🎵 Store preview settings on audio element for handleSeek to access
            (audio as any).previewStartTime = previewStartTime;
            (audio as any).previewDuration = previewDuration;
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
            // 🎵 PREVIEW MODE: When seeking, play only 5 seconds from new position
            const SEEK_PREVIEW_DURATION = 5; // 5 seconds when seeking

            audio.currentTime = newTime;

            // Update preview settings for this seek
            (audio as any).previewStartTime = newTime;
            (audio as any).previewDuration = SEEK_PREVIEW_DURATION;

            // If audio was paused, start playing the 5-second snippet
            if (audio.paused) {
                audio.play();
                setPlayingId(id);
            }

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

                const taskId = songTaskIds[variationId - 1];
                if (songTaskIds && taskId) {
                    selectedTaskIds[songIndex] = taskId;
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
        <div className="w-full relative">
            {/* Session Loading Overlay - Shows when switching between sessions */}
            {isLoadingSession && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#0a1628]/95 border-2 border-[#87CEEB]/40 rounded-2xl p-8 flex flex-col items-center gap-4">
                        <LoadingSpinner size="lg" variant="dots" customColor="#87CEEB" />
                        <p className="text-white text-lg font-medium">Loading session...</p>
                    </div>
                </div>
            )}

            {/* Persistent Login Button (Top Right) - Always visible when not logged in */}
            {!session?.user && (
                <div className="max-w-6xl mx-auto px-4 mb-4">
                    <div className="flex justify-end">
                        <Button
                            onClick={openDialog}
                            className="bg-gradient-to-br from-[#87CEEB] to-[#5BA5D0] text-white hover:shadow-lg"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Sign In to Save
                        </Button>
                    </div>
                </div>
            )}

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
                            {!session?.user && (
                                <div className="mt-4 pt-4 border-t border-[#87CEEB]/20">
                                    <p className="text-white/80 text-sm mb-3">
                                        💡 Sign in now to save your song to your dashboard!
                                    </p>
                                    <Button
                                        onClick={openDialog}
                                        variant="outline"
                                        className="bg-white/10 hover:bg-white/20 border-[#87CEEB]/40 text-white"
                                    >
                                        Sign In to Save
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }

            {
                generationStatus === 'ready' && (
                    <div className="max-w-6xl mx-auto px-4 mb-6">
                        <div className="bg-[#1e293b]/80 border-2 border-[#F5E6B8]/60 rounded-xl p-4 text-center backdrop-blur-sm">
                            <p className="text-[#F5E6B8] font-medium">{generationProgress}</p>
                        </div>
                    </div>
                )
            }

            {
                generationStatus === 'error' && (
                    <div className="max-w-6xl mx-auto px-4 mb-6">
                        <div className="bg-red-900/20 border-2 border-red-500/40 rounded-xl p-6 text-center backdrop-blur-sm">
                            <p className="text-red-300 font-medium mb-4">❌ {generationProgress}</p>
                            <button
                                onClick={() => {
                                    console.log('[VARIATIONS] User clicked retry - resetting generation state');
                                    setGenerationStatus('idle');
                                    setTaskIds({});
                                    setAudioUrls({});
                                    setLyrics({});
                                    // Will trigger regeneration via useEffect
                                }}
                                className="bg-gradient-to-br from-[#87CEEB] to-[#5BA5D0] text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
                            >
                                🔄 Retry Generation
                            </button>
                        </div>
                    </div>
                )
            }

            <div className="text-center mb-8">
                <h1 className={`text-[#E8DCC0] text-2xl md:text-3xl lg:text-4xl mb-2 flex flex-col md:flex-row items-center justify-center gap-3 drop-shadow-xl ${lora.className}`} style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                    <span>{isBundle ? "Select a style for each song" : "Your Songs are Ready"}</span>
                    <Music className="hidden md:block w-10 lg:w-12 h-10 lg:h-12 text-[#87CEEB]" />
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                    {variations.map((variation) => (
                        <Card
                            key={variation.id}
                            className={`bg-white/5 backdrop-blur-md rounded-2xl border-2 shadow-lg transition-all duration-200 relative overflow-hidden ${isCurrentSelected(variation.id)
                                ? 'border-[#F5E6B8] shadow-[0_8px_30px_rgba(245,230,184,0.5)] bg-[#F5E6B8]/10'
                                : 'border-[#87CEEB]/40 hover:border-[#87CEEB] hover:shadow-[0_8px_30px_rgba(135,206,235,0.3)]'
                                }`}
                        >
                            <CardContent className="p-6">
                                {/* Variation Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Music className="w-5 h-5 text-[#87CEEB]" />
                                        <h3 className={`text-lg font-medium ${isCurrentSelected(variation.id) ? 'text-[#F5E6B8]' : 'text-white'}`}>
                                            Option {variation.id} - {recipientName}
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
                                    {/* Failed State - Only show if generation is complete, no audio URL, and no lyrics */}
                                    {(generationStatus === 'ready' || generationStatus === 'error') && !audioUrls[activeTab]?.[variation.id] && !lyrics[activeTab]?.[variation.id] && taskIds[activeTab] && taskIds[activeTab][variation.id - 1] === null && (
                                        <div className="flex items-center gap-2 text-sm text-red-400">
                                            <span>❌</span>
                                            <span>Generation Failed</span>
                                        </div>
                                    )}

                                    {/* Generating State (only if task ID exists or not loaded yet) */}
                                    {!lyrics[activeTab]?.[variation.id] && !audioUrls[activeTab]?.[variation.id] && (!taskIds[activeTab] || taskIds[activeTab][variation.id - 1]) && (
                                        <div className="flex items-center gap-2 text-sm text-white/60">
                                            <LoadingSpinner size="xs" variant="dots" color="primary" />
                                            <span>Generating your song...</span>
                                        </div>
                                    )}
                                    {lyrics[activeTab]?.[variation.id] && !audioUrls[activeTab]?.[variation.id] && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-[#F5E6B8]">✓</span>
                                            <span className="text-[#F5E6B8]">Lyrics ready</span>
                                            <span className="text-white/40">•</span>
                                            <LoadingSpinner size="xs" variant="dots" color="primary" />
                                            <span className="text-white/60">Generating audio...</span>
                                        </div>
                                    )}
                                    {audioUrls[activeTab]?.[variation.id] && (
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-sm text-[#87CEEB]">
                                                <span>✓</span>
                                                <span>Ready to play!</span>
                                            </div>
                                            <div className="text-xs text-white/50">
                                                🎵 Preview: 20s from start • 5s snippets when seeking
                                            </div>
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
                                                <Pause className="w-5 h-5" />
                                                <span className="font-medium">Pause</span>
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-5 h-5" />
                                                <span className="font-medium">Play</span>
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
                                        disabled={!audioUrls[activeTab]?.[variation.id]}
                                        className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-200 border-2 min-w-[200px] ${!audioUrls[activeTab]?.[variation.id]
                                            ? 'bg-white/5 text-white/40 border-white/10 cursor-not-allowed'
                                            : 'bg-white/10 text-[#87CEEB] border-[#87CEEB]/40 hover:border-[#87CEEB] hover:bg-white/20'
                                            }`}
                                    >
                                        Select This Version
                                    </button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Login Required Prompt (if not logged in and songs are ready) */}
                {!session?.user && generationStatus === 'ready' && (
                    <div className="mt-6 mb-4 max-w-2xl mx-auto">
                        <div className="bg-gradient-to-br from-[#87CEEB]/20 to-[#5BA5D0]/20 border-2 border-[#87CEEB]/40 rounded-xl p-6 text-center backdrop-blur-sm">
                            <h3 className="text-xl font-semibold text-white mb-2">🎵 Love your song?</h3>
                            <p className="text-white/80 mb-4">
                                Sign in to save it to your dashboard and proceed to payment!
                            </p>
                            <p className="text-white/60 text-sm mb-4">
                                Login is required to complete your purchase and access your songs.
                            </p>
                        </div>
                    </div>
                )}

                {/* Payment Button - Only show if logged in OR show Login button */}
                <div className="mt-6 flex justify-center">
                    {!session?.user ? (
                        // Not logged in - Show Login button
                        <PremiumButton
                            onClick={openDialog}
                            disabled={generationStatus !== 'ready'}
                            className={generationStatus !== 'ready' ? "opacity-50 cursor-not-allowed" : ""}
                        >
                            {generationStatus !== 'ready' ? (
                                <>
                                    <LoadingSpinner size="md" variant="dots" color="primary" />
                                    Generating Songs...
                                </>
                            ) : (
                                "Login to Continue"
                            )}
                        </PremiumButton>
                    ) : (
                        // Logged in - Show Proceed to Payment button
                        <button
                            onClick={handleContinue}
                            disabled={loading || (isBundle && completedCount < totalSongs)}
                            className={`inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-primary/90 h-10 has-[>svg]:px-4 w-full bg-gradient-to-br from-[#F5E6B8] to-[#E8D89F] hover:from-[#F8F0DC] hover:to-[#E8DCC0] text-[#1a3d5f] shadow-[0_8px_30px_rgba(245,230,184,0.4)] hover:shadow-[0_12px_40px_rgba(245,230,184,0.6)] px-8 py-6 border-3 border-[#D4C5A0] rounded-xl transform hover:scale-105 transition-all duration-200 text-xl ${loading || (isBundle && completedCount < totalSongs) ? "opacity-50 cursor-not-allowed" : ""} ${lora.className}`}
                        >
                            {loading ? (
                                <>
                                    <LoadingSpinner size="md" variant="dots" color="primary" />
                                    Processing...
                                </>
                            ) : (
                                isBundle ? `Proceed to Payment (${completedCount}/${totalSongs} Selected)` : "Proceed to Payment"
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Login Dialog */}
            <LoginDialog
                open={showLoginDialog}
                onOpenChange={(open) => open ? openDialog() : closeDialog()}
                onSuccess={() => {
                    console.log('[VARIATIONS] User logged in successfully');
                    // Form will be auto-associated via useEffect
                }}
                title="Save Your Song"
                description="Sign in to save your generated song and access it anytime from your dashboard."
            />

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
