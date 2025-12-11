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
import { Loader2, Music, Download, LogOut, RefreshCw, PlayCircle, Lock, Lightbulb, Coins, Sparkles, User, PlusCircle, Receipt, Settings, BookOpen } from 'lucide-react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
    recipient: z.string().min(1, "Recipient is required"),
    relationship: z.string().min(1, "Relationship is required"),
    tone: z.string().min(1, "Tone is required"),
    vibe: z.string().min(1, "Vibe is required"),
    style: z.string().min(1, "Style is required"),
    story: z.string().min(10, "Please share at least 10 characters about them"),
    personalization: z.string().min(1, "Personalization level is required"),
    length: z.string().min(1, "Length is required"),
    include_name: z.boolean().default(true)
});

export default function DashboardPage() {
    const { data: session, isPending } = useSession();
    const router = useRouter();



    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            recipient: '',
            relationship: '',
            tone: '',
            vibe: '',
            style: '',
            story: '',
            personalization: '',
            length: '',
            include_name: true
        }
    });

    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');
    const [credits, setCredits] = useState(0);
    const [currentView, setCurrentView] = useState<'home' | 'create' | 'orders' | 'settings'>('create');
    const [taskId, setTaskId] = useState('');
    const [audioUrl, setAudioUrl] = useState('');
    const [history, setHistory] = useState<MusicGeneration[]>([]);

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

    const fetchHistory = async () => {
        try {
            const response = await fetch('/api/history');
            const data = await response.json();
            if (data.success) {
                setHistory(data.history);
                setCredits(data.credits || 0);
                // Check if any items are still in progress and trigger status checks for them
                const inProgressItems = data.history.filter((item: MusicGeneration) =>
                    item.status === 'pending' || item.status === 'in_progress'
                );

                if (inProgressItems.length > 0) {
                    // Poll for each pending item
                    inProgressItems.forEach((item: MusicGeneration) => {
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

    const generatePrompt = async (values?: z.infer<typeof formSchema>) => {
        const dataToSubmit = values || form.getValues();

        console.log('[FRONTEND] Generate prompt clicked', dataToSubmit);
        setLoading(true);
        setError('');
        setStatus('Creating your music prompt...');
        try {
            console.log('[FRONTEND] Sending request to /api/create-prompt');
            const response = await fetch('/api/create-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSubmit)
            });
            console.log('[FRONTEND] Response status:', response.status);
            const data = await response.json();
            console.log('[FRONTEND] Response data:', data);
            if (data.success) {
                console.log('[FRONTEND] Setting generated prompt:', data.prompt);
                setGeneratedPrompt(data.prompt);
                setLoading(false);
                setStatus('Prompt generated successfully! Now click "Create Song" to generate music (costs 1 credit).');
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
        if (credits <= 0) {
            setError('Insufficient credits. Please purchase more to create song.');
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

    const copyPrompt = () => {
        if (generatedPrompt) {
            navigator.clipboard.writeText(generatedPrompt).then(() => {
                setStatus('Prompt copied to clipboard!');
                setTimeout(() => setStatus(''), 3000);
            }).catch((err) => {
                console.error('Failed to copy', err);
                setError('Failed to copy prompt');
            });
        }
    };

    const mockPurchase = (type: 'single' | 'multi') => {
        alert(`Mock purchase of ${type} pack. In real app, this would integrate with payment gateway and add credits to your account.`);
        // For demo, simulate adding credits (but not persisted)
        const added = type === 'single' ? 1 : 5;
        setCredits(prev => prev + added);
        setStatus(`Added ${added} credits!`);
        setTimeout(() => setStatus(''), 3000);
        // TODO: Call API to update credits in DB
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
            generatePrompt(form.getValues());
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 h-screen bg-white border-r shadow-sm flex flex-col shrink-0">
                {/* Logo */}
                <div className="p-4 border-b bg-gray-50">
                    <a href="/dashboard" className="logo flex items-center gap-2 font-bold text-lg">
                        <span className="logo-badge bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-black">H</span>
                        Huggnote
                    </a>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    <Button
                        variant={currentView === 'home' ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setCurrentView('home')}
                    >
                        <BookOpen className="mr-3 h-5 w-5 shrink-0" />
                        My Songs
                    </Button>
                    <Button
                        variant={currentView === 'create' ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setCurrentView('create')}
                    >
                        <PlusCircle className="mr-3 h-5 w-5 shrink-0" />
                        Create New
                    </Button>
                    <Button
                        variant={currentView === 'orders' ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setCurrentView('orders')}
                    >
                        <Receipt className="mr-3 h-5 w-5 shrink-0" />
                        Orders
                    </Button>
                    <Button
                        variant={currentView === 'settings' ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setCurrentView('settings')}
                    >
                        <Settings className="mr-3 h-5 w-5 shrink-0" />
                        Settings
                    </Button>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50">
                    <div className="user-info flex items-center gap-3 mb-4 p-3 bg-white rounded-lg shadow-sm">
                        <div className="user-avatar bg-gray-200 p-2 rounded-full">
                            <User className="h-6 w-6 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{session?.user?.email || 'User'}</p>
                            <p className="text-xs text-muted-foreground">{credits} Credits</p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => signOut()}
                        size="sm"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto p-6 md:p-10">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {currentView === 'create' && (
                            <>
                                {/* Create Header */}
                                <header className="flex justify-between items-center pb-6 border-b border-gray-200">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900">Create New Song</h1>
                                        <p className="text-gray-500 mt-1">Tell us your story and we'll craft a masterpiece.</p>
                                    </div>
                                    <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full text-sm text-green-800">
                                        <Coins className="h-4 w-4" />
                                        <span>{credits} Credits</span>
                                    </div>
                                </header>
                            </>
                        )}
                        {/* Rest of create view content (form, etc.) will be added/structured separately */}


                        {credits === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow-sm border">
                                {/* No Credits State */}
                                <div className="text-center mb-8">
                                    <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold mb-2">You need credits</h3>
                                    <p className="text-gray-600 max-w-md">Purchase a package to start creating custom songs.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                                    {/* Single Pack */}
                                    <Card className="p-6 relative">
                                        <CardContent className="pt-0">
                                            <h4 className="font-semibold mb-2 text-lg">Single Pack</h4>
                                            <div className="text-3xl font-bold text-primary mb-4">$79</div>
                                            <ul className="space-y-1 mb-6 text-sm text-muted-foreground">
                                                <li>• 1 Song + 5 Regenerations</li>
                                            </ul>
                                            <Button className="w-full" onClick={() => mockPurchase('single')} variant="default">
                                                Buy Single
                                            </Button>
                                        </CardContent>
                                    </Card>
                                    {/* Multi Pack */}
                                    <Card className="p-6 relative border-2 border-primary">
                                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">Best Value</div>
                                        <CardContent className="pt-0">
                                            <h4 className="font-semibold mb-2 text-lg">Multi Pack</h4>
                                            <div className="text-3xl font-bold text-primary mb-4">$299</div>
                                            <ul className="space-y-1 mb-6 text-sm text-muted-foreground">
                                                <li>• 5 Songs + Regenerations</li>
                                            </ul>
                                            <Button className="w-full" onClick={() => mockPurchase('multi')} variant="default">
                                                Buy Multi
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        ) : (
                            /* Form State */
                            <Card className="max-w-4xl mx-auto shadow-sm">
                                <CardContent className="p-8 space-y-8">
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(generatePrompt)} className="space-y-8">
                                            {/* 1. Who is the song for? */}
                                            <FormField
                                                control={form.control}
                                                name="recipient"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Who is the song for?</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g. Mum, Sarah, my boyfriend, my best friend" className="h-11" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* 2 & 3. Relationship & Tone */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <FormField
                                                    control={form.control}
                                                    name="relationship"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>How would you describe your relationship?</FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger className="h-11">
                                                                        <SelectValue placeholder="Select relationship" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectGroup>
                                                                        <SelectLabel>Family</SelectLabel>
                                                                        <SelectItem value="Mum / Dad">Mum / Dad</SelectItem>
                                                                        <SelectItem value="Brother / Sister">Brother / Sister</SelectItem>
                                                                        <SelectItem value="Son / Daughter">Son / Daughter</SelectItem>
                                                                        <SelectItem value="Aunt / Uncle / Cousin">Aunt / Uncle / Cousin</SelectItem>
                                                                        <SelectItem value="Other family">Other family</SelectItem>
                                                                    </SelectGroup>
                                                                    <SelectGroup>
                                                                        <SelectLabel>Friend</SelectLabel>
                                                                        <SelectItem value="Close friend">Close friend</SelectItem>
                                                                        <SelectItem value="Good friend">Good friend</SelectItem>
                                                                        <SelectItem value="New friend / colleague">New friend / colleague</SelectItem>
                                                                    </SelectGroup>
                                                                    <SelectGroup>
                                                                        <SelectLabel>Romantic</SelectLabel>
                                                                        <SelectItem value="Boyfriend / Girlfriend">Boyfriend / Girlfriend</SelectItem>
                                                                        <SelectItem value="Partner / Spouse">Partner / Spouse</SelectItem>
                                                                        <SelectItem value="Someone I'm dating">Someone I'm dating</SelectItem>
                                                                    </SelectGroup>
                                                                    <SelectGroup>
                                                                        <SelectLabel>Neutral / Not sure</SelectLabel>
                                                                        <SelectItem value="Someone special (keep non-romantic)">Someone special (keep non-romantic)</SelectItem>
                                                                        <SelectItem value="Someone I care about (general)">Someone I care about (general)</SelectItem>
                                                                    </SelectGroup>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="tone"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>How should the song express your feelings?</FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger className="h-11">
                                                                        <SelectValue placeholder="Select tone" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="Warm & caring (but not romantic)">Warm & caring (but not romantic)</SelectItem>
                                                                    <SelectItem value="Romantic & loving">Romantic & loving</SelectItem>
                                                                    <SelectItem value="Light & flirty">Light & flirty</SelectItem>
                                                                    <SelectItem value="Keep it neutral">Keep it neutral</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            {/* 4 & 5. Vibe & Style */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <FormField
                                                    control={form.control}
                                                    name="vibe"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>How should the song feel overall?</FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger className="h-11">
                                                                        <SelectValue placeholder="Select vibe" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="Heartfelt & emotional">Heartfelt & emotional</SelectItem>
                                                                    <SelectItem value="Fun & joyful">Fun & joyful</SelectItem>
                                                                    <SelectItem value="Romantic & cosy">Romantic & cosy</SelectItem>
                                                                    <SelectItem value="Uplifting & festive">Uplifting & festive</SelectItem>
                                                                    <SelectItem value="Surprise me">Surprise me</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="style"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Christmas style</FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger className="h-11">
                                                                        <SelectValue placeholder="Select style" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="Very Christmassy (bells + big festive feel)">Very Christmassy (bells + big festive feel)</SelectItem>
                                                                    <SelectItem value="Warm & wintry (cosy Christmas)">Warm & wintry (cosy Christmas)</SelectItem>
                                                                    <SelectItem value="Modern pop holiday">Modern pop holiday</SelectItem>
                                                                    <SelectItem value="Acoustic & intimate">Acoustic & intimate</SelectItem>
                                                                    <SelectItem value="Surprise me">Surprise me</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            {/* 6. Story */}
                                            <FormField
                                                control={form.control}
                                                name="story"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Tell us a little about them</FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                placeholder="Share a couple of details, memories, special things, in-jokes or words you'd love included."
                                                                className="resize-none"
                                                                rows={5}
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <p className="text-sm text-muted-foreground">The magic box — this gives the AI everything it needs.</p>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* 7 & 8. Personalisation & Length */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <FormField
                                                    control={form.control}
                                                    name="personalization"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Personalisation level</FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger className="h-11">
                                                                        <SelectValue placeholder="Select level" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="Very personal (use name + details)">Very personal (use name + details)</SelectItem>
                                                                    <SelectItem value="Personal but gentle">Personal but gentle</SelectItem>
                                                                    <SelectItem value="More general">More general</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="length"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Song length</FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger className="h-11">
                                                                        <SelectValue placeholder="Select length" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="Short & sweet">Short & sweet</SelectItem>
                                                                    <SelectItem value="Standard">Standard</SelectItem>
                                                                    <SelectItem value="Full song">Full song</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            {/* Optional Toggle */}
                                            <FormField
                                                control={form.control}
                                                name="include_name"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        </FormControl>
                                                        <div className="space-y-1 leading-none">
                                                            <FormLabel>
                                                                Include their name in the lyrics?
                                                            </FormLabel>
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="pt-8">
                                                <Button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="w-full h-14 text-lg bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01]"
                                                >
                                                    {loading ? (
                                                        <>
                                                            <Loader2 className="h-6 w-6 animate-spin" />
                                                            Generating Prompt...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Sparkles className="h-6 w-6" />
                                                            Generate Prompt
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </form>
                                    </Form>

                                    {/* Generated Prompt Section */}
                                    {generatedPrompt && (
                                        <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                                            <h4 className="flex items-center gap-2 mb-4 text-green-800 font-semibold text-lg">
                                                <Lightbulb className="h-5 w-5" />
                                                Generated Prompt
                                            </h4>
                                            <pre className="mb-4 p-3 bg-white rounded border text-sm font-mono text-green-700 overflow-auto whitespace-pre-wrap">
                                                {generatedPrompt}
                                            </pre>
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={copyPrompt}
                                                    disabled={loading}
                                                >
                                                    Copy
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={generateMusic}
                                                    disabled={loading || credits <= 0}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Music className="h-4 w-4" />
                                                    Create Song (1 Credit)
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

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

                        {/* Current Generation Card and Audio stay in create view */}
                        {/* History moved to home view */}

                        {currentView === 'home' && (
                            <div id="view-home" className="dashboard-view">
                                {/* Home Header */}
                                <header className="flex justify-between items-center pb-6 border-b border-gray-200">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900">My Songs</h1>
                                        <p className="text-gray-500 mt-1">Manage and share your custom holiday songs.</p>
                                    </div>
                                    <Button
                                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                                        onClick={() => setCurrentView('create')}
                                    >
                                        <PlusCircle className="h-4 w-4" />
                                        New Song
                                    </Button>
                                </header>

                                {/* Stats Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <Card>
                                        <CardContent className="flex items-center gap-4 p-6 pt-6">
                                            <div className="p-3 bg-purple-100 rounded-full">
                                                <Music className="h-6 w-6 text-purple-600" />
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
                                                <Coins className="h-6 w-6 text-green-600" />
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
                                        <div className="empty-state text-center py-12 bg-white rounded-lg shadow-sm">
                                            <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold mb-2">No songs yet</h3>
                                            <p className="text-gray-600 mb-6">You haven't created any songs yet. Use a credit to get started!</p>
                                            <Button onClick={() => setCurrentView('create')} className="bg-primary text-primary-foreground">
                                                Create Song
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {currentView === 'orders' && (
                            <div id="view-orders" className="dashboard-view">
                                <header className="flex justify-between items-center pb-6 border-b border-gray-200">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
                                        <p className="text-gray-500 mt-1">View your past purchases and invoices.</p>
                                    </div>
                                </header>
                                <Card className="overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No orders yet. Purchase credits to see your purchase history here.</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </div>
                        )}

                        {currentView === 'settings' && (
                            <div id="view-settings" className="dashboard-view">
                                <header className="flex justify-between items-center pb-6 border-b border-gray-200">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                                        <p className="text-gray-500 mt-1">Manage your profile and preferences.</p>
                                    </div>
                                </header>
                                <Card className="max-w-2xl">
                                    <CardContent className="p-6 space-y-6">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-4">Profile</h3>
                                            <form id="settings-form" className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="settings-email">Email Address</Label>
                                                    <Input
                                                        id="settings-email"
                                                        type="email"
                                                        value={session?.user?.email || ''}
                                                        disabled
                                                        className="bg-gray-50"
                                                    />
                                                    <p className="text-sm text-muted-foreground">Contact support to change email.</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="display-name">Display Name</Label>
                                                    <Input id="display-name" placeholder="Your Name" />
                                                </div>
                                                <Button type="submit" className="w-full">Save Changes</Button>
                                            </form>
                                        </div>
                                        <div className="pt-6 border-t">
                                            <h3 className="text-lg font-semibold mb-4">Danger Zone</h3>
                                            <p className="text-sm text-muted-foreground mb-4">Resetting data will clear all local storage, including your session and created songs. This cannot be undone.</p>
                                            <Button
                                                variant="destructive"
                                                className="w-full flex items-center gap-2"
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to reset local data? This action cannot be undone.')) {
                                                        localStorage.clear();
                                                        sessionStorage.clear();
                                                        signOut();
                                                        router.push('/');
                                                    }
                                                }}
                                            >
                                                <RefreshCw className="h-4 w-4" />
                                                Reset Local Data
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Current Generation and Audio for create view */}
                        {currentView === 'create' && (
                            <>
                                {/* Current Generation Card */}
                                {(loading || status || error || (taskId && !audioUrl)) && (
                                    <Card className={`shadow-sm border-l-4 ${error ? 'border-l-red-500 bg-red-50' : 'border-l-indigo-500 bg-indigo-50'}`}>
                                        <CardHeader>
                                            <CardTitle>Current Generation</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6">
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
                                    <Card className="shadow-sm border-l-4 border-l-green-500 bg-green-50">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <PlayCircle className="h-6 w-6 text-green-500" />
                                                Your Generated Music
                                            </CardTitle>
                                            <CardDescription className="text-green-600 font-medium">
                                                Generation Successful!
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4 p-6">
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
                            </>
                        )}
                    </div>
                </div >
            </main >
        </div >
    );
}
