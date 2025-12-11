'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MaterialIcon } from '@/components/ui/material-icon';
import { type MusicGeneration } from '@/lib/db/schema';

export default function DashboardPage() {
    const { data: session, isPending } = useSession();
    const router = useRouter();

    const [credits, setCredits] = useState(0);
    const [history, setHistory] = useState<MusicGeneration[]>([]);

    // Polling state for any pending items on the dashboard
    const [pollingIds, setPollingIds] = useState<Set<string>>(new Set());

    const checkHistoryItemStatus = async (id: string) => {
        try {
            const response = await fetch(`/api/status/${id}`);
            const data = await response.json();

            const status = data.status || data.state;

            if (status === 'COMPLETED' || status === 'complete' || status === 'failed' || status === 'error') {
                // Refresh history to update UI with final status
                fetchHistory();
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

    const fetchHistory = async () => {
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
        }
    };

    useEffect(() => {
        if (session) {
            fetchHistory();
        }
    }, [session]);

    // Redirect to login if not authenticated
    if (!isPending && !session) {
        router.push('/');
        return null;
    }

    if (isPending) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-2">
                    <MaterialIcon name="progress_activity" className="h-8 w-8 animate-spin text-indigo-600" />
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Home Header */}
            <header className="flex justify-between items-center pb-6 border-b border-gray-200">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Songs</h1>
                    <p className="text-gray-500 mt-1">Manage and share your custom holiday songs.</p>
                </div>
                <Button
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => router.push('/dashboard/create')}
                >
                    <MaterialIcon name="add" className="h-4 w-4" />
                    New Song
                </Button>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                    <CardContent className="flex items-center gap-4 p-6 pt-6">
                        <div className="p-3 bg-purple-100 rounded-full">
                            <MaterialIcon name="music_note" className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-gray-900">{history.filter((h: MusicGeneration) => h.status === 'completed').length}</div>
                            <div className="text-sm text-muted-foreground">Songs Created</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-4 p-6 pt-6">
                        <div className="p-3 bg-green-100 rounded-full">
                            <MaterialIcon name="token" className="h-6 w-6 text-green-600" />
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
                            <Card key={item.id} className="overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div className="flex-1 space-y-2">
                                            <p className="font-semibold text-gray-900 line-clamp-2">
                                                {item.generatedPrompt || 'No prompt'}
                                            </p>
                                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                        item.status === 'failed' ? 'bg-red-100 text-red-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {item.status?.toUpperCase() || 'UNKNOWN'}
                                                </span>
                                                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        {item.status === 'completed' &&
                                            (item.audioUrlWav1 || item.audioUrlWav2 || item.audioUrl1 || item.audioUrl2) && (
                                                <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                                                    <audio
                                                        controls
                                                        src={item.audioUrlWav1 || item.audioUrlWav2 || item.audioUrl1 || item.audioUrl2 || undefined}
                                                        className="h-10 w-full md:w-64"
                                                    />
                                                    <Button variant="link" size="sm" asChild className="h-auto p-0 text-indigo-600">
                                                        <a href={item.audioUrlWav1 || item.audioUrlWav2 || item.audioUrl1 || item.audioUrl2 || undefined} download>
                                                            <MaterialIcon name="download" className="mr-1 h-3 w-3" />
                                                            Download
                                                        </a>
                                                    </Button>
                                                </div>
                                            )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state text-center py-12 bg-white rounded-lg shadow-sm">
                        <MaterialIcon name="music_note" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No songs yet</h3>
                        <p className="text-gray-600 mb-6">You haven't created any songs yet. Use a credit to get started!</p>
                        <Button onClick={() => router.push('/dashboard/create')} className="bg-primary text-primary-foreground">
                            Create Song
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
