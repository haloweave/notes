'use client';

import { useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { MaterialIcon } from '@/components/ui/material-icon';

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

export default function CreatePage() {
    const { data: session } = useSession();
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');
    const [credits, setCredits] = useState(0); // This should ideally come from a shared context or layout fetch
    const [taskId, setTaskId] = useState('');
    const [audioUrl, setAudioUrl] = useState('');

    const form = useForm({
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

    const generatePrompt = async (values: z.infer<typeof formSchema>) => {
        const dataToSubmit = values;

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
        // Basic frontend check, backend also checks
        if (credits < 0) {
            // Logic to handle insufficient credits if we have that data
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

    const handleRetry = () => {
        if (generatedPrompt) {
            startMusicGeneration(generatedPrompt);
        } else {
            generatePrompt(form.getValues() as any);
        }
    };

    const mockPurchase = (type: 'single' | 'multi') => {
        alert(`Mock purchase of ${type} pack. In real app, this would integrate with payment gateway and add credits to your account.`);
        const added = type === 'single' ? 1 : 5;
        setCredits(prev => prev + added);
        setStatus(`Added ${added} credits!`);
        setTimeout(() => setStatus(''), 3000);
    };

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center pb-6 border-b border-gray-200">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Create New Song</h1>
                    <p className="text-gray-500 mt-1">Tell us your story and we'll craft a masterpiece.</p>
                </div>
                <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full text-sm text-green-800">
                    <MaterialIcon name="token" className="h-4 w-4" />
                    <span>{credits} Credits</span>
                </div>
            </header>

            {/* Form State */}
            <Card className="max-w-4xl mx-auto shadow-sm">
                <CardContent className="p-8 space-y-8">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(generatePrompt as any)} className="space-y-8">
                            {/* 1. Who is the song for? */}
                            <FormField
                                control={form.control as any}
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
                                    control={form.control as any}
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
                                    control={form.control as any}
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
                                    control={form.control as any}
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
                                    control={form.control as any}
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
                                control={form.control as any}
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
                                    control={form.control as any}
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
                                    control={form.control as any}
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
                                control={form.control as any}
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
                                    className="w-full h-14 text-lg bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01]"
                                >
                                    {loading ? (
                                        <>
                                            <MaterialIcon name="progress_activity" className="h-6 w-6 animate-spin" />
                                            Generating Prompt...
                                        </>
                                    ) : (
                                        <>
                                            <MaterialIcon name="auto_awesome" className="h-6 w-6" />
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
                                <MaterialIcon name="lightbulb" className="h-5 w-5" />
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
                                    disabled={loading}
                                    className="flex items-center gap-2"
                                >
                                    <MaterialIcon name="music_note" className="h-4 w-4" />
                                    Create Song (1 Credit)
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Current Generation Card */}
            {(loading || status || error || (taskId && !audioUrl)) && (
                <Card className={`shadow-sm border-l-4 ${error ? 'border-l-red-500 bg-red-50' : 'border-l-primary bg-primary/5'}`}>
                    <CardHeader>
                        <CardTitle>Current Generation</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {error ? (
                            <div className="space-y-4">
                                <p className="text-red-500">{error}</p>
                                <Button onClick={handleRetry} variant="destructive" size="sm">
                                    <MaterialIcon name="refresh" className="mr-2 h-4 w-4" />
                                    Retry Generation
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    {loading && <MaterialIcon name="progress_activity" className="h-5 w-5 animate-spin text-primary" />}
                                    <p className="text-primary font-semibold">{status || 'Processing...'}</p>
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
                            <MaterialIcon name="play_circle" className="h-6 w-6 text-green-500" />
                            Your Generated Music
                        </CardTitle>
                        <CardDescription className="text-green-600 font-medium">
                            Generation Successful!
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 p-6">
                        <audio controls className="w-full">
                            <source src={audioUrl || undefined} />
                            Your browser does not support the audio element.
                        </audio>
                        <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                            <a href={audioUrl || undefined} download>
                                <MaterialIcon name="download" className="mr-2 h-4 w-4" />
                                Download Music
                            </a>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
