'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { Lora } from 'next/font/google';

const lora = Lora({ subsets: ['latin'] });
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { PremiumButton } from '@/components/ui/premium-button';
import { Input } from '@/components/ui/input';
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loading01Icon, PlusSignIcon } from 'hugeicons-react';
import { PricingTable } from '@/components/dashboard/pricing-table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from 'next/image';
import { SongForm } from '@/components/create/song-form';

const songSchema = z.object({
    recipientName: z.string().min(1, "Please enter the recipient's name"),
    recipientNickname: z.string().optional(),
    relationship: z.string().min(1, "Please specify the relationship"),
    pronunciation: z.string().optional(),

    senderMessage: z.string().min(1, "Please add a short message"),

    theme: z.string().min(1, "Please select a theme"),
    aboutThem: z.string().min(10, "Please tell us more about them (at least 10 characters)"),
    moreInfo: z.string().optional(),

    voiceType: z.string().optional(),
    genreStyle: z.string().optional(),
    instrumentPreferences: z.string().optional(),

    vibe: z.string().min(1, "Please select an overall vibe"),
});

const formSchema = z.object({
    // Sender Info (Global)
    senderName: z.string().min(1, "Please enter your name"),
    senderEmail: z.string().email("Please enter a valid email"),
    senderPhone: z.string().min(1, "Please enter your phone number"),

    // Songs
    songs: z.array(songSchema).min(1),
});

const defaultSongValues = {
    recipientName: "",
    recipientNickname: "",
    relationship: "",
    pronunciation: "",
    senderMessage: "",
    theme: "",
    aboutThem: "",
    moreInfo: "",
    voiceType: "",
    genreStyle: "",
    instrumentPreferences: "",
    vibe: "",
};

export default function CreatePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');
    const [credits, setCredits] = useState<number | null>(null);
    const [showCreditsDialog, setShowCreditsDialog] = useState(false);
    const [isBundle, setIsBundle] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    // Cache for avoiding regeneration
    const cachedPrompts = useRef<string[]>([]);
    const lastSubmittedData = useRef<z.infer<typeof formSchema> | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        shouldUnregister: false, // Keep values when switching tabs
        defaultValues: {
            senderName: "",
            senderEmail: "",
            senderPhone: "",
            songs: [defaultSongValues],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "songs",
    });

    // Check selected package on mount
    useEffect(() => {
        const pkg = sessionStorage.getItem('selectedPackageId');
        if (pkg === 'holiday-hamper') {
            setIsBundle(true);
        } else {
            setIsBundle(false);
        }
    }, []);

    const handleAddSong = () => {
        if (fields.length < 5) {
            append(defaultSongValues);
            setActiveTab(fields.length); // Switch to the new tab (length is next index)
        }
    };

    const handleRemoveSong = (index: number) => {
        remove(index);
        // Adjust active tab if we removed the current one or one before it
        if (activeTab >= index && activeTab > 0) {
            setActiveTab(activeTab - 1);
        }
    };

    // Load saved form data on mount
    useEffect(() => {
        // Try to get current form ID from sessionStorage
        const currentFormId = sessionStorage.getItem('currentFormId');

        if (currentFormId) {
            // Load from localStorage using form ID
            const savedFormData = localStorage.getItem(`songForm_${currentFormId}`);
            if (savedFormData) {
                try {
                    const parsed = JSON.parse(savedFormData);
                    console.log('[FRONTEND] Restoring form data from localStorage:', parsed);

                    // Create migration logic
                    let formDataToReset = parsed.formData;

                    // Migration logic: if old flat format, convert to nested
                    if (parsed.formData && !parsed.formData.songs) {
                        const migrated = {
                            senderName: parsed.formData.senderName,
                            senderEmail: parsed.formData.senderEmail,
                            senderPhone: parsed.formData.senderPhone,
                            songs: [{
                                recipientName: parsed.formData.recipientName,
                                recipientNickname: parsed.formData.recipientNickname,
                                relationship: parsed.formData.relationship,
                                pronunciation: parsed.formData.pronunciation,
                                senderMessage: parsed.formData.senderMessage,
                                theme: parsed.formData.theme,
                                aboutThem: parsed.formData.aboutThem,
                                moreInfo: parsed.formData.moreInfo,
                                voiceType: parsed.formData.voiceType,
                                genreStyle: parsed.formData.genreStyle,
                                instrumentPreferences: parsed.formData.instrumentPreferences,
                                vibe: parsed.formData.vibe,
                            }]
                        };
                        formDataToReset = migrated;
                    }

                    if (formDataToReset) {
                        form.reset(formDataToReset);
                        // Store for cache comparison
                        lastSubmittedData.current = formDataToReset;
                    }

                    // Restore prompts cache if available
                    if (parsed.allPrompts && Array.isArray(parsed.allPrompts)) {
                        cachedPrompts.current = parsed.allPrompts;
                    } else if (parsed.generatedPrompt) {
                        cachedPrompts.current = [parsed.generatedPrompt];
                    }

                } catch (e) {
                    console.error('[FRONTEND] Error parsing saved form data:', e);
                }
            }
        }
    }, [form]);

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

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (credits !== null && credits < 1) {
            setShowCreditsDialog(true);
            return;
        }

        setLoading(true);
        setStatus('Initializing your masterpiece...');
        setError('');

        try {
            // Check if we can reuse the existing form ID or generate a new one?
            // Usually valid to keep same ID if just updating, but creating new ensures fresh start.
            // However, to allow "add song and come back", let's keep using the one in session if valid.
            let formId = sessionStorage.getItem('currentFormId');
            if (!formId) {
                formId = `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                console.log('[FRONTEND] Generated new form ID:', formId);
            } else {
                console.log('[FRONTEND] Reusing form ID:', formId);
            }

            const generatedPrompts = [];

            // Loop through songs and generate prompts
            for (let i = 0; i < values.songs.length; i++) {
                const song = values.songs[i];

                // Smart Caching Check
                let shouldUseCached = false;
                if (
                    lastSubmittedData.current &&
                    lastSubmittedData.current.songs &&
                    lastSubmittedData.current.songs[i] &&
                    cachedPrompts.current[i]
                ) {
                    // Compare fields relevant to prompt generation
                    const prevSong = lastSubmittedData.current.songs[i];
                    const prevGlobal = {
                        senderName: lastSubmittedData.current.senderName,
                        senderEmail: lastSubmittedData.current.senderEmail,
                    };

                    // Deep comparison of song fields + relevant global sender fields
                    const isSongSame = JSON.stringify(song) === JSON.stringify(prevSong);
                    const isGlobalSame = values.senderName === prevGlobal.senderName && values.senderEmail === prevGlobal.senderEmail;

                    if (isSongSame && isGlobalSame) {
                        shouldUseCached = true;
                    }
                }

                if (shouldUseCached) {
                    console.log(`[FRONTEND] Using cached prompt for song ${i + 1}`);
                    setStatus(`Using cached result for song ${i + 1}...`);
                    generatedPrompts.push(cachedPrompts.current[i]);
                    // Artificial delay for UX flow
                    await new Promise(r => setTimeout(r, 500));
                } else {
                    setStatus(`Composing song ${i + 1} of ${values.songs.length}...`);

                    // Construct payload for API
                    const apiPayload = {
                        ...song,
                        senderName: values.senderName,
                        senderEmail: values.senderEmail,
                        senderPhone: values.senderPhone,
                    };

                    console.log(`[FRONTEND] Generating prompt for song ${i + 1}:`, apiPayload);
                    const response = await fetch('/api/create-song-prompt', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(apiPayload)
                    });

                    const data = await response.json();
                    if (data.success && data.prompt) {
                        generatedPrompts.push(data.prompt);
                    } else {
                        throw new Error(data.message || `Failed to generate prompt for song ${i + 1}`);
                    }
                }
            }

            if (generatedPrompts.length > 0) {
                console.log('[FRONTEND] Generated/Cached prompts:', generatedPrompts);

                const formDataWithMetadata = {
                    formId,
                    timestamp: new Date().toISOString(),
                    formData: values,
                    generatedPrompt: generatedPrompts[0],
                    allPrompts: generatedPrompts,
                    status: 'prompt_generated'
                };

                // Save to localStorage
                localStorage.setItem(`songForm_${formId}`, JSON.stringify(formDataWithMetadata));

                // Update caches
                cachedPrompts.current = generatedPrompts;
                lastSubmittedData.current = values;

                // Also save to a list of all form IDs if new
                const existingFormIds = JSON.parse(localStorage.getItem('songFormIds') || '[]');
                if (!existingFormIds.includes(formId)) {
                    existingFormIds.push(formId);
                    localStorage.setItem('songFormIds', JSON.stringify(existingFormIds));
                }

                // Store in sessionStorage
                sessionStorage.setItem('songFormData', JSON.stringify(values));
                sessionStorage.setItem('generatedPrompt', generatedPrompts[0]);
                sessionStorage.setItem('allPrompts', JSON.stringify(generatedPrompts)); // Added for symmetry
                sessionStorage.setItem('currentFormId', formId);

                setStatus('Preparing your variations...');

                // Redirect logic
                setTimeout(() => {
                    const params = new URLSearchParams({
                        recipient: values.songs[0].recipientName,
                        relationship: values.songs[0].relationship,
                        theme: values.songs[0].theme,
                        formId: formId,
                    });
                    router.push(`/variations?${params.toString()}`);
                }, 1000);
            }
        } catch (err: any) {
            console.error('[FRONTEND] Error generating prompt:', err);
            setError(err.message || 'Error generating song prompt. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex flex-col overflow-x-hidden font-sans" style={{ backgroundColor: '#2A374F' }}>
            {/* Background Image Layer - Fixed */}
            <div
                className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/web background image.png')" }}
            />

            {/* Dark Overlay */}
            <div className="fixed inset-0 z-[1] bg-black/30" />

            {/* Snowfall Effect - Fixed */}
            <div className="fixed inset-0 z-[5] pointer-events-none overflow-hidden">
                <div className="snowflakes" aria-hidden="true">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="snowflake">❅</div>
                    ))}
                </div>
            </div>

            {/* Header */}
            <div className="relative z-10 max-w-4xl mx-auto mb-8 text-center pt-8 px-4">
                <div className="flex justify-start mb-4">
                    <button
                        onClick={() => router.push('/select-package')}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all hover:bg-white/10 h-9 px-4 py-2 text-white/80 hover:text-white"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                        Back
                    </button>
                </div>

                <div className="mb-6">
                    <Image
                        src="/huggnote bespoke logo.png"
                        alt="Huggnote"
                        width={300}
                        height={100}
                        className="w-[200px] h-auto mx-auto drop-shadow-md"
                        priority
                    />
                </div>
                {isBundle && (
                    <h2 className={`text-white md:text-[#E8DCC0] lg:text-[#E8DCC0] text-2xl md:text-3xl font-normal mb-2 drop-shadow-xl ${lora.className}`}>
                        Merry Medley
                    </h2>
                )}
                <h1 className={`text-white md:text-[#E8DCC0] lg:text-[#E8DCC0] text-2xl md:text-3xl lg:text-3xl font-normal mb-2 drop-shadow-xl ${lora.className}`} style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                    Compose Your Masterpiece
                </h1>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-4xl mx-auto px-4 pb-8 relative z-10">

                    {/* Global Sender Information (Only once) */}
                    <Card>
                        <CardContent>
                            <h2 className={`text-xl md:text-2xl text-[#E8DCC0] ${lora.className}`}>Who's sending the Song?</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                <FormField
                                    control={form.control}
                                    name="senderName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="block text-[#87CEEB] mb-2">From <span className="text-[#87CEEB]">*</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder="Your name" className="w-full px-4 py-3 bg-[#0f1e30]/60 border-2 border-[#87CEEB]/40 text-white placeholder-white/50 italic rounded-lg focus:outline-none focus:border-[#F5E6B8] transition-all duration-200 backdrop-blur-sm" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="senderEmail"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="block text-[#87CEEB] mb-2">Email <span className="text-[#87CEEB]">*</span></FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="your@email.com" className="w-full px-4 py-3 bg-[#0f1e30]/60 border-2 border-[#87CEEB]/40 text-white placeholder-white/50 italic rounded-lg focus:outline-none focus:border-[#F5E6B8] transition-all duration-200 backdrop-blur-sm" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="senderPhone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="block text-[#87CEEB] mb-2">Phone Number <span className="text-[#87CEEB]">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="+353 86 123 4567" className="w-full px-4 py-3 bg-[#0f1e30]/60 border-2 border-[#87CEEB]/40 text-white placeholder-white/50 italic rounded-lg focus:outline-none focus:border-[#F5E6B8] transition-all duration-200 backdrop-blur-sm" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                        </CardContent>
                    </Card>

                    {/* Song Bundle Tabs */}
                    {isBundle && (
                        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
                            {fields.map((field, index) => (
                                <button
                                    key={field.id}
                                    type="button"
                                    onClick={() => setActiveTab(index)}
                                    className={`
                                        relative flex items-center justify-center gap-2 px-6 py-3 rounded-t-xl font-medium transition-all duration-200 min-w-[120px]
                                        ${activeTab === index
                                            ? 'bg-[#1e293b]/80 text-[#F5E6B8] border-t-2 border-x-2 border-[#F5E6B8] shadow-[0_-4px_20px_rgba(245,230,184,0.1)] z-10 translate-y-[2px]'
                                            : 'bg-white/5 text-[#87CEEB]/70 border-t-2 border-x-2 border-transparent hover:bg-white/10 hover:text-[#87CEEB]'
                                        }
                                    `}
                                >
                                    <span className={`${lora.className} text-sm md:text-base whitespace-nowrap`}>Song {index + 1}</span>
                                </button>
                            ))}

                            {fields.length < 5 && (
                                <button
                                    type="button"
                                    onClick={handleAddSong}
                                    className="flex items-center justify-center p-3 rounded-full bg-[#87CEEB]/10 text-[#87CEEB] hover:bg-[#87CEEB]/20 hover:text-[#F5E6B8] border-2 border-[#87CEEB]/30 hover:border-[#87CEEB]/60 transition-all duration-200 ml-2 shadow-lg backdrop-blur-sm"
                                    title="Add another song"
                                >
                                    <PlusSignIcon className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    )}

                    {/* Active Song Form */}
                    <div className={isBundle ? "bg-[#1e293b]/20 rounded-b-xl rounded-tr-xl border-t-2 border-[#F5E6B8]/20 -mt-6 pt-6" : ""}>
                        {/* We render ALL forms but hide inactive ones to preserve state properly with RHF */}
                        {fields.map((field, index) => (
                            <div key={field.id} className={index === activeTab ? "block animate-in fade-in zoom-in-95 duration-300" : "hidden"}>
                                <SongForm
                                    index={index}
                                    title={isBundle ? `Song ${index + 1} Details` : "Who is this song for?"}
                                    namePrefix={`songs.${index}`}
                                    canRemove={isBundle && fields.length > 1}
                                    onRemove={() => handleRemoveSong(index)}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Status Messages */}
                    {status && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                            <p className="text-blue-800 text-sm font-medium">{status}</p>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-red-800 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="pt-6 flex justify-center">
                        <PremiumButton
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loading01Icon className="h-6 w-6 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                "I'm Ready! Compose My Song" + (isBundle ? "s" : "")
                            )}
                        </PremiumButton>
                    </div>
                </form>
            </Form>

            {/* Credits Dialog */}
            <Dialog open={showCreditsDialog} onOpenChange={setShowCreditsDialog}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Insufficient Songs</DialogTitle>
                        <DialogDescription>
                            You need at least 1 song available to generate a track. Please purchase a song package below to continue.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <PricingTable />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Snowfall CSS */}
            <style jsx>{`
                .snowflakes {
                    position: absolute;
                    top: -10%;
                    width: 100%;
                    height: 110%;
                }

                .snowflake {
                    position: absolute;
                    top: -10%;
                    color: #fff;
                    font-size: 1em;
                    font-family: Arial, sans-serif;
                    text-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
                    animation: fall linear infinite;
                    opacity: 0.8;
                }

                @keyframes fall {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 0.8;
                    }
                    100% {
                        transform: translateY(110vh) rotate(360deg);
                        opacity: 0.3;
                    }
                }

                .snowflake:nth-child(1) {
                    left: 10%;
                    animation-duration: 10s;
                    animation-delay: 0s;
                    font-size: 1.2em;
                }

                .snowflake:nth-child(2) {
                    left: 20%;
                    animation-duration: 12s;
                    animation-delay: 2s;
                    font-size: 0.8em;
                }

                .snowflake:nth-child(3) {
                    left: 30%;
                    animation-duration: 15s;
                    animation-delay: 4s;
                    font-size: 1em;
                }

                .snowflake:nth-child(4) {
                    left: 40%;
                    animation-duration: 11s;
                    animation-delay: 0s;
                    font-size: 1.5em;
                }

                .snowflake:nth-child(5) {
                    left: 50%;
                    animation-duration: 13s;
                    animation-delay: 3s;
                    font-size: 0.9em;
                }

                .snowflake:nth-child(6) {
                    left: 60%;
                    animation-duration: 14s;
                    animation-delay: 1s;
                    font-size: 1.1em;
                }

                .snowflake:nth-child(7) {
                    left: 70%;
                    animation-duration: 16s;
                    animation-delay: 5s;
                    font-size: 1.3em;
                }

                .snowflake:nth-child(8) {
                    left: 80%;
                    animation-duration: 12s;
                    animation-delay: 2s;
                    font-size: 0.7em;
                }

                .snowflake:nth-child(9) {
                    left: 90%;
                    animation-duration: 11s;
                    animation-delay: 4s;
                    font-size: 1em;
                }

                .snowflake:nth-child(10) {
                    left: 15%;
                    animation-duration: 13s;
                    animation-delay: 1s;
                    font-size: 1.4em;
                }

                .snowflake:nth-child(11) {
                    left: 35%;
                    animation-duration: 14s;
                    animation-delay: 3s;
                    font-size: 0.8em;
                }

                .snowflake:nth-child(12) {
                    left: 55%;
                    animation-duration: 15s;
                    animation-delay: 0s;
                    font-size: 1.2em;
                }
            `}</style>
        </div>
    );
}
