'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu01Icon, Delete02Icon, ArrowRight01Icon } from 'hugeicons-react';
import { Button } from '@/components/ui/button';

interface SongSession {
    formId: string;
    formData: {
        songs?: Array<{
            recipientName: string;
            relationship: string;
            theme: string;
        }>;
        recipientName?: string;
        relationship?: string;
        theme?: string;
    };
    variationTaskIds?: Record<number, string[]>;
    variationAudioUrls?: Record<number, Record<number, string>>;
    status?: string;
    timestamp: number;
}

export function HistoryMenu() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [sessions, setSessions] = useState<SongSession[]>([]);

    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = () => {
        const allSessions: SongSession[] = [];

        // Scan localStorage for all songForm_ entries
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('songForm_')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key) || '{}');
                    const formId = key.replace('songForm_', '');

                    allSessions.push({
                        formId,
                        formData: data.formData || {},
                        variationTaskIds: data.variationTaskIds,
                        variationAudioUrls: data.variationAudioUrls,
                        status: data.status,
                        timestamp: data.timestamp || Date.now()
                    });
                } catch (e) {
                    console.error('Error parsing session:', key, e);
                }
            }
        }

        // Sort by timestamp (newest first)
        allSessions.sort((a, b) => b.timestamp - a.timestamp);
        setSessions(allSessions);
    };

    const deleteSession = (formId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Delete this song session?')) {
            localStorage.removeItem(`songForm_${formId}`);
            loadSessions();
        }
    };

    const navigateToSession = (session: SongSession) => {
        const firstSong = session.formData.songs?.[0] || session.formData;
        const params = new URLSearchParams({
            recipient: firstSong.recipientName || 'Unknown',
            relationship: firstSong.relationship || 'Friend',
            theme: firstSong.theme || 'special-occasion',
            formId: session.formId
        });

        router.push(`/compose/variations?${params.toString()}`);
        setIsOpen(false);
    };

    const getSessionTitle = (session: SongSession) => {
        const firstSong = session.formData.songs?.[0] || session.formData;
        return firstSong.recipientName || 'Untitled Song';
    };

    const getSessionSubtitle = (session: SongSession) => {
        const firstSong = session.formData.songs?.[0] || session.formData;
        const songCount = session.formData.songs?.length || 1;
        return `${firstSong.relationship || 'Friend'} • ${firstSong.theme || 'Theme'} ${songCount > 1 ? `• ${songCount} songs` : ''}`;
    };

    const getSessionStatus = (session: SongSession) => {
        if (session.status === 'variations_ready') return '✅ Ready';
        if (session.status === 'variations_generating') return '⏳ Generating';
        if (session.status === 'payment_completed') return '💳 Paid';
        return '📝 Draft';
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
                            <h3 className="text-white font-semibold text-lg">Song History</h3>
                            <p className="text-white/60 text-sm mt-1">
                                {sessions.length} session{sessions.length !== 1 ? 's' : ''} saved locally
                            </p>
                        </div>

                        {/* Sessions List */}
                        <div className="p-2">
                            {sessions.length === 0 ? (
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
