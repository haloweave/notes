'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Add01Icon, MusicNote01Icon, Coins01Icon, Loading01Icon } from 'hugeicons-react';
import { type MusicGeneration } from '@/lib/db/schema';
import { SongCard } from '@/components/dashboard/song-card';

export default function DashboardPage() {
    const { data: session, isPending } = useSession();
    const router = useRouter();

    const [credits, setCredits] = useState(0);
    const [history, setHistory] = useState<MusicGeneration[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);

    // Polling state for any pending items on the dashboard
    const [pollingIds, setPollingIds] = useState<Set<string>>(new Set());

    const checkHistoryItemStatus = async (id: string) => {
        try {
            const response = await fetch(`/api/status/${id}`);
            const data = await response.json();

            const status = data.status || data.state;

            if (status === 'COMPLETED' || status === 'complete' || status === 'failed' || status === 'error') {
                // Refresh history to update UI with final status
                fetchHistory(false); // Don't trigger full loading state on status check updates
                setPollingIds(prev => {
                    const next = new Set(prev);
                    next.delete(id);
                    return next;
                });
            } else {
                // If still pending, check again in 5 seconds
                setTimeout(() => checkHistoryItemStatus(id), 5000);
            }
        } catch (err) {
            console.error('Error checking history item status:', err);
            // Stop polling on error to avoid infinite loops if API is down
            setPollingIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };

    const fetchHistory = async (showLoading = true) => {
        if (showLoading) setIsLoadingHistory(true);
        try {
            const response = await fetch('/api/history');
            const data = await response.json();
            if (data.success) {
                setHistory(data.history);
                setCredits(data.credits || 0);

                // Check if any items are still in progress and trigger status checks for them
                const inProgressItems = data.history.filter((item: MusicGeneration) =>
                    (item.status === 'pending' || item.status === 'in_progress') && item.taskId
                );

                inProgressItems.forEach((item: MusicGeneration) => {
                    if (item.taskId && !pollingIds.has(item.taskId)) {
                        setPollingIds(prev => new Set(prev).add(item.taskId!));
                        checkHistoryItemStatus(item.taskId);
                    }
                });
            }
        } catch (error) {
            console.error('Failed to fetch history:', error);
        } finally {
            if (showLoading) setIsLoadingHistory(false);
        }
    };

    useEffect(() => {
        if (session) {
            fetchHistory();
        } else if (!isPending) {
            // If not pending and no session, we aren't loading history
            setIsLoadingHistory(false);
        }
    }, [session, isPending]);

    // Redirect to login if not authenticated
    if (!isPending && !session) {
        router.push('/');
        return null;
    }

    if (isPending || (session && isLoadingHistory)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-2">
                    <Loading01Icon className="animate-spin h-8 w-8 text-primary" />
                    <p className="text-gray-500 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Home Header */}
            <header className="flex justify-between items-center pb-6 border-b border-gray-200">
                <div>
                    <h1 className="text-5xl font-bold text-gray-900">My Songs</h1>
                    <p className="text-gray-500 mt-1">Manage and share your custom holiday songs.</p>
                </div>
                <Button
                    className="flex items-center gap-2 h-14 text-lg px-8"
                    onClick={() => router.push('/dashboard/create')}
                >
                    <Add01Icon className="h-5 w-5" />
                    New Song
                </Button>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                    <CardContent className="flex items-center gap-4 p-6 pt-6">
                        <div className="p-3 bg-purple-100 rounded-xl">
                            <MusicNote01Icon className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-gray-900">{history.filter((h: MusicGeneration) => h.status === 'completed').length}</div>
                            <div className="text-sm text-muted-foreground">Songs Created</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-4 p-6 pt-6">
                        <div className="p-3 bg-emerald-100 rounded-xl">
                            <Coins01Icon className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-gray-900">{credits}</div>
                            <div className="text-sm text-muted-foreground">Credits Available</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Songs List */}
            <div className="song-list-wrapper">
                {history.length > 0 ? (
                    <div className="grid gap-6">
                        {history.map((item: MusicGeneration) => (
                            <SongCard key={item.id} item={item} />
                        ))}
                    </div>
                ) : (
                    <div className="empty-state text-center py-12 bg-white rounded-lg shadow-sm">
                        <MusicNote01Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No songs yet</h3>
                        <p className="text-gray-600 mb-6">You haven't created any songs yet. Use a credit to get started!</p>
                        <Button onClick={() => router.push('/dashboard/create')}>
                            Create Song
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
