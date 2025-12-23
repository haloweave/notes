'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Delete02Icon, ArrowRight01Icon } from 'hugeicons-react';
import { Menu, Library } from 'lucide-react';
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
        const sessionMap = new Map<string, SongSession>();

        // Load from database if user is logged in
        if (session?.user?.id) {
            try {
                const response = await fetch('/api/compose/forms/list');
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.forms) {
                        data.forms.forEach((form: any) => {
                            // Convert DB form to session format
                            const dbSession: SongSession = {
                                formId: form.id,
                                formData: form.formData || {},
                                variationTaskIds: form.variationTaskIds,
                                variationAudioUrls: form.variationAudioUrls,
                                status: form.status,
                                timestamp: new Date(form.createdAt).getTime(),
                                source: 'database'
                            };
                            sessionMap.set(form.id, dbSession);
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

    // Show all sessions in history
    const displaySessions = sessions;

    const deleteSession = (formId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Delete this song from history?')) {
            localStorage.removeItem(`songForm_${formId}`);
            setHasLoaded(false);
            loadSessions();
        }
    };

    const navigateToSession = (session: SongSession) => {
        console.log('[HISTORY_MENU] Navigating to session:', {
            formId: session.formId,
            status: session.status,
            formData: session.formData
        });

        // Close menu immediately
        setIsOpen(false);

        // For drafts/in-progress, go to variations page
        const firstSong = session.formData.songs?.[0] || session.formData;
        const recipient = (firstSong as any).recipientName || (firstSong as any).recipient || 'Unknown';
        const relationship = firstSong.relationship || 'Friend';
        const theme = firstSong.theme || 'special-occasion';

        const params = new URLSearchParams({
            recipient,
            relationship,
            theme,
            formId: session.formId
        });

        const targetUrl = `/compose/variations?${params.toString()}`;
        console.log('[HISTORY_MENU] Navigating to variations page:', targetUrl);

        const currentUrl = window.location.pathname + window.location.search;

        // If we're already on this page, force a reload to refresh data
        if (currentUrl === targetUrl || window.location.search.includes(`formId=${session.formId}`)) {
            console.log('[HISTORY_MENU] Already on this page, reloading...');
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
        if (session.status === 'payment_completed' || session.status === 'payment_successful') return 'Paid';
        if (session.status === 'completed') return 'Completed';
        if (session.status === 'composing') return 'Composing';
        if (session.status === 'delivered') return 'Delivered';
        return 'Draft';
    };

    const getSongsReady = (session: SongSession) => {
        if (!session.variationAudioUrls) return 0;
        const songIndex = 0; // Check first song
        const urls = session.variationAudioUrls[songIndex];
        return urls ? Object.keys(urls).length : 0;
    };

    return (
        <div className="flex items-center gap-3">
            <div className="relative">
                {/* Hamburger Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-3 rounded-lg bg-[#1a3d5f]/80 backdrop-blur-sm hover:bg-[#1a3d5f]/90 transition-all duration-200 shadow-lg block"
                    aria-label="Menu"
                >
                    <Menu className="w-6 h-6 md:w-7 md:h-7 text-[#E0F4FF]" />
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Menu Panel */}
                        <div className="absolute top-14 right-0 w-96 max-h-[80vh] overflow-y-auto bg-[#0a1628]/95 backdrop-blur-xl border-2 border-white/20 rounded-2xl shadow-2xl z-40">
                            {/* Header */}
                            <div className="sticky top-0 bg-[#0a1628] border-b border-white/10 p-4 z-10 space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                        <h3 className="text-white font-semibold text-lg">Your Songs</h3>
                                        {session?.user && (
                                            <p className="text-[#87CEEB] text-xs mt-0.5 truncate">
                                                {session.user.email}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Purchased Songs Button */}
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        router.push('/compose/library');
                                    }}
                                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-br from-[#F5E6B8] to-[#D4C89A] hover:shadow-[0_0_15px_rgba(245,230,184,0.3)] text-[#1a3d5f] font-semibold transition-all duration-200"
                                >
                                    <Library className="w-4 h-4" />
                                    <span>View My Purchased Songs</span>
                                </button>

                                <div className="mt-4 pt-2 border-t border-white/10">
                                    <h3 className="text-[#87CEEB] font-semibold text-sm uppercase tracking-wider mb-2">History</h3>
                                    <p className="text-white/60 text-xs">
                                        {isLoading ? (
                                            'Loading...'
                                        ) : (
                                            <>
                                                {displaySessions.length} song{displaySessions.length !== 1 ? 's' : ''}
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Sessions List */}
                            <div className="p-2">
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-white/60">
                                        <LoadingSpinner size="md" variant="dots" customColor="#87CEEB" />
                                        <p className="text-sm mt-4">Loading your history...</p>
                                    </div>
                                ) : displaySessions.length === 0 ? (
                                    <div className="text-center py-12 text-white/60">
                                        <p>No history yet</p>
                                        <p className="text-sm mt-2">Start a new song to see it here!</p>
                                    </div>
                                ) : (
                                    displaySessions.map((session) => {
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
                            <div className="sticky bottom-0 bg-[#0a1628] border-t border-white/10 p-4">
                                <button
                                    onClick={async () => {
                                        if (confirm('Are you sure you want to sign out?')) {
                                            const { authClient } = await import('@/lib/auth-client');
                                            await authClient.signOut();
                                            router.push('/');
                                            setIsOpen(false);
                                        }
                                    }}
                                    className="w-full text-red-300 hover:text-red-200 text-sm py-2 transition-colors font-medium flex items-center justify-center gap-2"
                                >
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
