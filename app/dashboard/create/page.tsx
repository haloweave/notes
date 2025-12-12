'use client';

import { useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
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
import { Coins01Icon, Loading01Icon, SparklesIcon, BulbIcon, MusicNote01Icon, RefreshIcon, PlayCircleIcon, Download01Icon } from 'hugeicons-react';
import { db } from '@/lib/db'; // Will fetch via API actually
import { PricingTable } from '@/components/dashboard/pricing-table';
import { useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

// ... (schema remains same)

const formSchema = z.object({
    recipient: z.string().min(1, "Please tell us who this is for"),
    relationship: z.string().min(1, "Please select a relationship"),
    tone: z.string().min(1, "Please select a tone"),
    vibe: z.string().min(1, "Please select a vibe"),
    style: z.string().min(1, "Please select a style"),
    story: z.string().min(10, "Please share a bit more detail (at least 10 characters)"),
    personalization: z.string().min(1, "Please select personalization level"),
    length: z.string().min(1, "Please select song length"),
    include_name: z.boolean().default(false),
});

export default function CreatePage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [loading, setLoading] = useState(false); // Used for both prompt and music generation loading states
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');
    const [credits, setCredits] = useState<number | null>(null);
    const [taskId, setTaskId] = useState('');
    const [audioUrl, setAudioUrl] = useState('');
    const [showCreditsDialog, setShowCreditsDialog] = useState(false);

    // New state for dialog
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        const fetchCredits = async () => {
            try {
                const res = await fetch('/api/credits');
                if (res.ok) {
                    const data = await res.json();
                    setCredits(data.credits);
                }
            } catch (e) {
                console.error("Failed to fetch credits", e);
            }
        };
        fetchCredits();
    }, []);

    const form = useForm({
        // ... (remains same)
    });

    const generatePrompt = async (values: z.infer<typeof formSchema>) => {
        if (credits !== null && credits < 1) {
            setShowCreditsDialog(true);
            return;
        }

        const dataToSubmit = values;

        console.log('[FRONTEND] Generate prompt clicked', dataToSubmit);
        setIsDialogOpen(true); // Open dialog immediately
        setGeneratedPrompt(''); // Reset previous prompt
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
                // Status cleared so "Current Generation" card doesn't show background noise
                setStatus('');
            } else {
                console.error('[FRONTEND] Error from API:', data.message);
                setError(data.message || 'Failed to generate prompt');
                setLoading(false);
                // Keep dialog open to show error? or close?
            }
        } catch (err: any) {
            console.error('[FRONTEND] Exception:', err);
            setError(err.message || 'Error generating prompt');
            setLoading(false);
        }
    };

    const startMusicGeneration = async (prompt: string) => {
        setIsDialogOpen(false); // Close dialog as we start generation
        console.log('[FRONTEND] Starting music generation with prompt:', prompt);
        setStatus('Generating your music...');
        setError(''); // Clear any previous errors
        setLoading(true); // Set loading true for the main page card

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
                // pollStatus(taskId); // No longer needed as we redirect

                // Redirect immediately to dashboard where it will appear in the history
                router.push('/dashboard');
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

    // ... (rest of functions: pollStatus, copyPrompt, handleRetry, mockPurchase)

    return (
        <div className="space-y-8">
            <DashboardHeader
                title="Create New Song"
                description="Tell us your story and we'll craft a masterpiece."
            >
                <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard')}
                >
                    View All Your Songs
                </Button>
            </DashboardHeader>

            {/* Form State */}
            <Card className="max-w-4xl mx-auto shadow-sm">
                <CardContent className="p-8 space-y-8">
                    <Form {...form}>
                        {/* ... form content ... */}
                        {/* Form code will be preserved by replacement logic if careful, but since I am replacing a huge chunk, I need to be careful. 
                             Actually, the Instruction says "Remove the on-page 'Generated Prompt' section.".
                             I will include the Form and the Dialog at the end. 
                         */}
                        <form onSubmit={form.handleSubmit(generatePrompt as any)} className="space-y-8">
                            {/* ... Fields ... I will have to include the fields in replacement if I replace the whole return block, 
                                but I can target StartLine/EndLine to partial replace. 
                                The user request implies replacing the workflow. 
                            */}
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
                                    className="w-full h-14 text-lg flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01]"
                                >
                                    {loading ? (
                                        <>
                                            <Loading01Icon className="h-6 w-6 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <SparklesIcon className="h-6 w-6" />
                                            Generate Music
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                    {/* Removed Generated Prompt Section */}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>
                            {loading && !generatedPrompt ? "Crafting Your Song..." : "Confirm Your Song"}
                        </DialogTitle>
                        <DialogDescription>
                            {loading && !generatedPrompt ? "Our AI is writing the perfect lyrics and prompt based on your story." : "Review the generated lyrics prompt below before we create the audio."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        {loading && !generatedPrompt ? (
                            <div className="flex flex-col items-center justify-center py-8 space-y-4">
                                <SparklesIcon className="h-12 w-12 text-primary animate-pulse" />
                                <p className="text-center text-muted-foreground animate-pulse">Writing lyrics and composing melody instructions...</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {generatedPrompt && (
                                    <div className="p-4 bg-muted rounded-md text-sm font-mono whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                                        {generatedPrompt}
                                    </div>
                                )}
                                {error && (
                                    <p className="text-destructive text-sm font-medium">{error}</p>
                                )}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="sm:justify-between gap-2">
                        <div className="flex-1"></div>
                        {(!loading || generatedPrompt) && (
                            <>
                                <Button variant="secondary" onClick={() => setIsDialogOpen(false)} disabled={loading && !generatedPrompt}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={generateMusic}
                                    disabled={!generatedPrompt || loading}
                                    className="gap-2"
                                >
                                    <MusicNote01Icon className="h-4 w-4" />
                                    Generate Song (1 Credit)
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Credits Dialog */}
            <Dialog open={showCreditsDialog} onOpenChange={setShowCreditsDialog}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Insufficient Credits</DialogTitle>
                        <DialogDescription>
                            You need at least 1 credit to generate a song. Please purchase a credit package below to continue.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <PricingTable />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Current Generation and Audio Player sections removed as redirected to Dashboard */}
        </div >
    );
}
