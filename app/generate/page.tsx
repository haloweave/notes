'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Music, Download, LogOut, RefreshCw, PlayCircle } from 'lucide-react';

export default function GeneratePage() {
    const { data: session, isPending } = useSession();
    const router = useRouter();

    const [formData, setFormData] = useState({
        recipient: '',
        relationship: '',
        tone: '',
        vibe: '',
        style: '',
        story: '',
        personalization: 'medium',
        length: '2-3 minutes',
        include_name: true
    });

    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');
    const [taskId, setTaskId] = useState('');
    const [audioUrl, setAudioUrl] = useState('');
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        if (session) {
            fetchHistory();
        }
    }, [session]);

    const fetchHistory = async () => {
        try {
            const response = await fetch('/api/history');
            const data = await response.json();
            if (data.success) {
                setHistory(data.history);
                // Check if any items are still in progress and trigger status checks for them
                const inProgressItems = data.history.filter((item: any) =>
                    item.status === 'pending' || item.status === 'in_progress'
                );

                if (inProgressItems.length > 0) {
                    // Poll for each pending item
                    inProgressItems.forEach((item: any) => {
                        // Only poll if we aren't already polling this specific ID in the main view
                        if (item.taskId !== taskId) {
                            checkHistoryItemStatus(item.taskId);
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Failed to fetch history:', error);
        }
    };

    const checkHistoryItemStatus = async (id: string) => {
        try {
            const response = await fetch(`/api/status/${id}`);
            const data = await response.json();

            const status = data.status || data.state;
            const audioUrl = data.audio_url || data.audioUrl;

            if (status === 'COMPLETED' || status === 'complete' || status === 'failed' || status === 'error') {
                // Refresh history to update UI with final status
                fetchHistory();
            } else {
                // If still pending, check again in 5 seconds
                setTimeout(() => checkHistoryItemStatus(id), 5000);
            }
        } catch (err) {
            console.error('Error checking history item status:', err);
        }
    };

    // Redirect to login if not authenticated
    if (!isPending && !session) {
        router.push('/');
        return null;
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCheckboxChange = (checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            include_name: checked
        }));
    };

    const generatePrompt = async () => {
        console.log('[FRONTEND] Generate prompt clicked');
        setLoading(true);
        setError('');
        setStatus('Creating your music prompt...');
        try {
            console.log('[FRONTEND] Sending request to /api/create-prompt');
            const response = await fetch('/api/create-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            console.log('[FRONTEND] Response status:', response.status);
            const data = await response.json();
            console.log('[FRONTEND] Response data:', data);
            if (data.success) {
                console.log('[FRONTEND] Setting generated prompt:', data.prompt);
                setGeneratedPrompt(data.prompt);
                // Automatically start music generation
                await startMusicGeneration(data.prompt);
            } else {
                console.error('[FRONTEND] Error from API:', data.message);
                setError(data.message || 'Failed to generate prompt');
                setLoading(false);
            }
        } catch (err: any) {
            console.error('[FRONTEND] Exception:', err);
            setError(err.message || 'Error generating prompt');
            setLoading(false);
        }
    };

    const startMusicGeneration = async (prompt: string) => {
        console.log('[FRONTEND] Starting music generation with prompt:', prompt);
        setStatus('Generating your music...');
        setError(''); // Clear any previous errors

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: prompt,
                    make_instrumental: false,
                    wait_audio: false
                })
            });

            const data = await response.json();
            console.log('[FRONTEND] Generate response:', data);

            // Handle rate limiting
            if (response.status === 429) {
                setError('Rate limit reached. Please wait before trying again.');
                setLoading(false);
                return;
            }

            // MusicGPT returns task_id, not id
            const taskId = data.task_id || data.id;

            if (taskId) {
                setTaskId(taskId);
                const eta = data.eta ? `~${Math.ceil(data.eta / 60)} minutes` : 'a few minutes';
                setStatus(`Music generation started. ETA: ${eta}. Please wait...`);
                fetchHistory(); // Show the new pending item in history immediately
                pollStatus(taskId);
            } else {
                setError(data.message || data.detail || 'Failed to start music generation');
                setLoading(false);
            }
        } catch (err: any) {
            console.error('[FRONTEND] Music generation error:', err);
            setError(err.message || 'Error generating music');
            setLoading(false);
        }
    };

    const generateMusic = async () => {
        if (!generatedPrompt) {
            setError('Please generate a prompt first');
            return;
        }
        await startMusicGeneration(generatedPrompt);
    };

    const pollStatus = async (id: string) => {
        const checkStatus = async () => {
            try {
                console.log('[FRONTEND] Polling status for task:', id);
                const response = await fetch(`/api/status/${id}`);
                const data = await response.json();
                console.log('[FRONTEND] Status response:', data);

                // Check for completion - MusicGPT might use different field names
                const audioUrl = data.audio_url
                    || data.audioUrl
                    || data.url
                    || data.conversion?.conversion_path_1
                    || data.conversion?.conversion_path_2;
                const status = data.status || data.state;

                console.log('[FRONTEND] Extracted - Status:', status, 'Audio URL:', audioUrl);

                if ((status === 'COMPLETED' || status === 'complete') && audioUrl) {
                    console.log('[FRONTEND] ✅ Music complete! Audio URL:', audioUrl);
                    setAudioUrl(audioUrl);
                    setStatus('Music generated successfully!');
                    setLoading(false);
                    fetchHistory(); // Refresh history on completion
                } else if (status === 'error' || status === 'failed') {
                    console.error('[FRONTEND] Music generation failed:', data);
                    setError(data.error || data.message || 'Music generation failed');
                    setLoading(false);
                } else {
                    // Still processing
                    const currentStatus = status || 'processing';
                    console.log('[FRONTEND] Current status:', currentStatus);
                    setStatus(`Status: ${currentStatus}... (polling every 3s)`);
                    setTimeout(checkStatus, 3000); // Poll every 3 seconds
                }
            } catch (err: any) {
                console.error('[FRONTEND] Status check error:', err);
                setError(err.message || 'Error checking status');
                setLoading(false);
            }
        };

        checkStatus();
    };

    if (isPending) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    const handleRetry = () => {
        if (generatedPrompt) {
            startMusicGeneration(generatedPrompt);
        } else {
            generatePrompt();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header with Logout */}
                <div className="flex justify-between items-center pb-6 border-b border-gray-200">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Music Generator</h1>
                        <p className="text-gray-500 mt-1">Create custom AI-generated music</p>
                    </div>
                    <Button
                        onClick={() => signOut()}
                        variant="destructive"
                        className="flex items-center gap-2"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </Button>
                </div>

                {/* Form */}
                <Card className="shadow-sm border-0 ring-1 ring-gray-200">
                    <CardHeader>
                        <CardTitle>Song Details</CardTitle>
                        <CardDescription>Tell us about the song you want to create</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="recipient">Recipient</Label>
                                <Input
                                    id="recipient"
                                    name="recipient"
                                    value={formData.recipient}
                                    onChange={handleInputChange}
                                    placeholder="Who is this song for?"
                                    className="bg-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="relationship">Relationship</Label>
                                <Input
                                    id="relationship"
                                    name="relationship"
                                    value={formData.relationship}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Wife, Friend, Mother"
                                    className="bg-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tone">Tone/Feelings</Label>
                                <Input
                                    id="tone"
                                    name="tone"
                                    value={formData.tone}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Joyful, Romantic, Nostalgic"
                                    className="bg-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="vibe">Overall Vibe</Label>
                                <Input
                                    id="vibe"
                                    name="vibe"
                                    value={formData.vibe}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Upbeat, Calm, Energetic"
                                    className="bg-white"
                                />
                            </div>

                            <div className="space-y-2 col-span-1 md:col-span-2">
                                <Label htmlFor="style">Music Style</Label>
                                <Input
                                    id="style"
                                    name="style"
                                    value={formData.style}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Pop, Jazz, Rock, Classical"
                                    className="bg-white"
                                />
                            </div>

                            <div className="space-y-2 col-span-1 md:col-span-2">
                                <Label htmlFor="story">Story/Memories</Label>
                                <Textarea
                                    id="story"
                                    name="story"
                                    value={formData.story}
                                    onChange={handleInputChange}
                                    placeholder="Share the story or memories you want in the song..."
                                    rows={4}
                                    className="bg-white resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox
                                id="include_name"
                                checked={formData.include_name}
                                onCheckedChange={handleCheckboxChange}
                            />
                            <Label htmlFor="include_name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Include recipient's name in the song
                            </Label>
                        </div>

                        <Button
                            onClick={generatePrompt}
                            disabled={loading}
                            className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-700"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Generating Music...
                                </>
                            ) : (
                                <>
                                    <Music className="mr-2 h-5 w-5" />
                                    Generate Music
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Current Generation Card */}
                {(loading || status || error || (taskId && !audioUrl)) && (
                    <Card className={`shadow-sm border-l-4 ${error ? 'border-l-red-500' : 'border-l-indigo-500'}`}>
                        <CardHeader>
                            <CardTitle>Current Generation</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {error ? (
                                <div className="space-y-4">
                                    <p className="text-red-500">{error}</p>
                                    <Button onClick={handleRetry} variant="destructive" size="sm">
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Retry Generation
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        {loading && <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />}
                                        <p className="text-indigo-600 font-semibold">{status || 'Processing...'}</p>
                                    </div>
                                    {taskId && <p className="text-sm text-gray-500 font-mono">Task ID: {taskId}</p>}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Audio Player (Success State) */}
                {audioUrl && (
                    <Card className="shadow-sm border-l-4 border-l-green-500">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PlayCircle className="h-6 w-6 text-green-500" />
                                Your Generated Music
                            </CardTitle>
                            <CardDescription className="text-green-600 font-medium">
                                Generation Successful!
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <audio controls className="w-full">
                                <source src={audioUrl} />
                                Your browser does not support the audio element.
                            </audio>
                            <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700">
                                <a href={audioUrl} download>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Music
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* History Section */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900">Your Music History</h2>
                    {history.length > 0 ? (
                        <div className="grid gap-4">
                            {history.map((item) => (
                                <Card key={item.id} className="overflow-hidden">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                            <div className="flex-1 space-y-2">
                                                <p className="font-semibold text-gray-900 line-clamp-2">
                                                    {item.generatedPrompt || 'No prompt'}
                                                </p>
                                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                                    <span className={`flex items-center capitalize ${item.status === 'completed' ? 'text-green-600' :
                                                            item.status === 'failed' ? 'text-red-600' : 'text-orange-600'
                                                        }`}>
                                                        <span className="mr-1.5 h-2 w-2 rounded-full bg-current" />
                                                        {item.status}
                                                    </span>
                                                </div>
                                            </div>

                                            {item.status === 'completed' &&
                                                (item.audioUrlWav1 || item.audioUrlWav2 || item.audioUrl1 || item.audioUrl2) && (
                                                    <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                                                        <audio
                                                            controls
                                                            src={item.audioUrlWav1 || item.audioUrlWav2 || item.audioUrl1 || item.audioUrl2}
                                                            className="h-10 w-full md:w-64"
                                                        />
                                                        <Button variant="link" size="sm" asChild className="h-auto p-0 text-indigo-600">
                                                            <a href={item.audioUrlWav1 || item.audioUrlWav2 || item.audioUrl1 || item.audioUrl2} download>
                                                                <Download className="mr-1 h-3 w-3" />
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
                        <Card className="text-center py-12">
                            <CardContent>
                                <p className="text-gray-500">No music generated yet. Create your first song above!</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
