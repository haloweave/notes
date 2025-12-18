'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu01Icon, Delete02Icon, ArrowRight01Icon } from 'hugeicons-react';
import { Button } from '@/components/ui/button';
import { useSession } from '@/lib/auth-client';
import { useLoginDialog } from '@/contexts/login-dialog-context';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface SongSession {
    formId: string;
    formData: {
        songs?: Array<{
            recipientName?: string;
            recipient?: string; // Alternative field name
            relationship: string;
            theme: string;
        }>;
        recipientName?: string;
        recipient?: string; // Alternative field name
        relationship?: string;
        theme?: string;
    };
    variationTaskIds?: Record<number, string[]>;
    variationAudioUrls?: Record<number, Record<number, string>>;
    status?: string;
    timestamp: number;
    source?: 'local' | 'database' | 'both'; // Track where the data came from
}

export function HistoryMenu() {
    const router = useRouter();
    const { data: session } = useSession();
    const { openDialog } = useLoginDialog();
    const [isOpen, setIsOpen] = useState(false);
    const [sessions, setSessions] = useState<SongSession[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);

    useEffect(() => {
        // Only load sessions if menu is open AND we haven't loaded yet
        if (isOpen && !hasLoaded) {
            loadSessions();
        }
    }, [isOpen, hasLoaded]);

    // Reset hasLoaded when user logs in/out to refresh data
    useEffect(() => {
        setHasLoaded(false);
    }, [session?.user?.id]);

    const loadSessions = async () => {
        setIsLoading(true);
        const allSessions: SongSession[] = [];
        const sessionMap = new Map<string, SongSession>();

        // 1. Load from localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('songForm_')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key) || '{}');
                    const formId = key.replace('songForm_', '');

                    sessionMap.set(formId, {
                        formId,
                        formData: data.formData || {},
                        variationTaskIds: data.variationTaskIds,
                        variationAudioUrls: data.variationAudioUrls,
                        status: data.status,
                        timestamp: data.timestamp || Date.now(),
                        source: 'local'
                    });
                } catch (e) {
                    console.error('Error parsing session:', key, e);
                }
            }
        }

        // 2. Load from database if user is logged in
        if (session?.user?.id) {
            try {
                const response = await fetch('/api/compose/forms/list');
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.forms) {
                        data.forms.forEach((form: any) => {
                            const existing = sessionMap.get(form.id);

                            sessionMap.set(form.id, {
                                formId: form.id,
                                formData: form.formData || {},
                                variationTaskIds: form.variationTaskIds,
                                variationAudioUrls: form.variationAudioUrls,
                                status: form.status,
                                timestamp: new Date(form.createdAt).getTime(),
                                source: existing ? 'both' : 'database'
                            });
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching database sessions:', error);
            }
        }

        // Convert map to array and sort
        const sessionsArray = Array.from(sessionMap.values());
        sessionsArray.sort((a, b) => b.timestamp - a.timestamp);
        setSessions(sessionsArray);
        setIsLoading(false);
        setHasLoaded(true);
    };

    const deleteSession = (formId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Delete this song session?')) {
            localStorage.removeItem(`songForm_${formId}`);
            setHasLoaded(false);
            loadSessions();
        }
    };

    const navigateToSession = (session: SongSession) => {
        // Handle both formats: { songs: [...] } and direct { recipientName, relationship, theme }
        const firstSong = session.formData.songs?.[0] || session.formData;

        // Extract values with better fallbacks
        const recipient = (firstSong as any).recipientName || (firstSong as any).recipient || 'Unknown';
        const relationship = firstSong.relationship || 'Friend';
        const theme = firstSong.theme || 'special-occasion';

        console.log('[HISTORY_MENU] Navigating to session:', {
            formId: session.formId,
            recipient,
            relationship,
            theme,
            formData: session.formData
        });

        const params = new URLSearchParams({
            recipient,
            relationship,
            theme,
            formId: session.formId
        });

        const targetUrl = `/compose/variations?${params.toString()}`;
        const currentUrl = window.location.pathname + window.location.search;

        // Close menu immediately
        setIsOpen(false);

        // If we're already on this page, force a reload to refresh data
        if (currentUrl === targetUrl || window.location.search.includes(`formId=${session.formId}`)) {
            console.log('[HISTORY_MENU] Already on this session, reloading page...');
            window.location.href = targetUrl;
        } else {
            router.push(targetUrl);
        }
    };

    const getSessionTitle = (session: SongSession) => {
        const firstSong = session.formData.songs?.[0] || session.formData;
        return (firstSong as any).recipientName || (firstSong as any).recipient || 'Untitled Song';
    };

    const getSessionSubtitle = (session: SongSession) => {
        const firstSong = session.formData.songs?.[0] || session.formData;
        const songCount = session.formData.songs?.length || 1;
        const relationship = firstSong.relationship || 'Friend';
        const theme = firstSong.theme || 'Theme';
        return `${relationship} • ${theme} ${songCount > 1 ? `• ${songCount} songs` : ''}`;
    };

    const getSessionStatus = (session: SongSession) => {
        if (session.status === 'variations_ready') return 'Ready';
        if (session.status === 'variations_generating') return 'Generating';
        if (session.status === 'payment_completed') return 'Paid';
        return 'Draft';
    };

    const getSongsReady = (session: SongSession) => {
        if (!session.variationAudioUrls) return 0;
        const songIndex = 0; // Check first song
        const urls = session.variationAudioUrls[songIndex];
        return urls ? Object.keys(urls).length : 0;
    };

    return (
        <div className="relative">
            {/* Hamburger Button */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-white/10 backdrop-blur-md border-2 border-white/20 hover:bg-white/20 text-white rounded-xl p-3 shadow-lg"
            >
                <Menu01Icon className="w-6 h-6" />
            </Button>

            {/* Dropdown Menu */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menu Panel */}
                    <div className="absolute top-14 right-0 w-96 max-h-[80vh] overflow-y-auto bg-[#0a1628]/95 backdrop-blur-xl border-2 border-white/20 rounded-2xl shadow-2xl">
                        {/* Header */}
                        <div className="sticky top-0 bg-[#0a1628] border-b border-white/10 p-4">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1">
                                    <h3 className="text-white font-semibold text-lg">Song History</h3>
                                    {session?.user && (
                                        <p className="text-[#87CEEB] text-xs mt-0.5 truncate">
                                            {session.user.email}
                                        </p>
                                    )}
                                </div>
                                {!session?.user && (
                                    <Button
                                        onClick={() => {
                                            setIsOpen(false);
                                            openDialog();
                                        }}
                                        size="sm"
                                        className="bg-gradient-to-br from-[#87CEEB] to-[#5BA5D0] text-white hover:shadow-lg text-xs px-3 py-1 h-auto"
                                    >
                                        Sign In
                                    </Button>
                                )}
                            </div>
                            <p className="text-white/60 text-sm">
                                {isLoading ? (
                                    'Loading...'
                                ) : (
                                    <>
                                        {sessions.length} session{sessions.length !== 1 ? 's' : ''}
                                    </>
                                )}
                            </p>
                        </div>

                        {/* Sessions List */}
                        <div className="p-2">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-12 text-white/60">
                                    <LoadingSpinner size="md" variant="dots" customColor="#87CEEB" />
                                    <p className="text-sm mt-4">Loading your sessions...</p>
                                </div>
                            ) : sessions.length === 0 ? (
                                <div className="text-center py-12 text-white/60">
                                    <p>No song sessions yet</p>
                                    <p className="text-sm mt-2">Create your first song to see it here!</p>
                                </div>
                            ) : (
                                sessions.map((session) => {
                                    const songsReady = getSongsReady(session);

                                    return (
                                        <div
                                            key={session.formId}
                                            onClick={() => navigateToSession(session)}
                                            className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#87CEEB]/50 rounded-xl p-4 mb-2 cursor-pointer transition-all duration-200"
                                        >
                                            {/* Title */}
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="text-white font-medium text-base pr-8 line-clamp-1">
                                                    {getSessionTitle(session)}
                                                </h4>
                                                <ArrowRight01Icon className="w-5 h-5 text-white/40 group-hover:text-[#87CEEB] transition-colors flex-shrink-0" />
                                            </div>

                                            {/* Subtitle */}
                                            <p className="text-white/60 text-sm mb-3 line-clamp-1">
                                                {getSessionSubtitle(session)}
                                            </p>

                                            {/* Status & Progress */}
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-white/50">
                                                    {getSessionStatus(session)}
                                                </span>
                                                {songsReady > 0 && (
                                                    <span className="text-[#87CEEB]">
                                                        {songsReady}/3 songs ready
                                                    </span>
                                                )}
                                            </div>

                                            {/* Delete Button */}
                                            <button
                                                onClick={(e) => deleteSession(session.formId, e)}
                                                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg p-1.5 transition-all duration-200"
                                                title="Delete session"
                                            >
                                                <Delete02Icon className="w-4 h-4" />
                                            </button>

                                            {/* Timestamp */}
                                            <div className="text-white/40 text-xs mt-2">
                                                {new Date(session.timestamp).toLocaleDateString()} {new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer */}
                        {sessions.length > 0 && (
                            <div className="sticky bottom-0 bg-[#0a1628] border-t border-white/10 p-4">
                                <button
                                    onClick={() => {
                                        if (confirm('Clear all song history? This cannot be undone.')) {
                                            sessions.forEach(s => localStorage.removeItem(`songForm_${s.formId}`));
                                            loadSessions();
                                        }
                                    }}
                                    className="w-full text-red-300 hover:text-red-200 text-sm py-2 transition-colors"
                                >
                                    Clear All History
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
