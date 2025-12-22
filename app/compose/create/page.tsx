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
import { PlusSignIcon } from 'hugeicons-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PricingTable } from '@/components/dashboard/pricing-table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from 'next/image';
import { SongForm } from '@/components/create/song-form';
import { Gift, Clock, Zap } from 'lucide-react';

const songSchema = z.object({
    // Recipient Information
    recipientName: z.string()
        .trim()
        .min(1, "Please enter the recipient's name")
        .max(100, "Recipient's name is too long"),
    pronunciation: z.string()
        .trim()
        .min(1, "Please provide pronunciation")
        .max(100, "Pronunciation is too long"),
    recipientNickname: z.string()
        .trim()
        .min(1, "Please tell us what you'll call them")
        .max(50, "Nickname is too long"),
    recipientNickname2: z.string()
        .trim()
        .max(50, "Nickname is too long")
        .transform(val => val === "" ? undefined : val)
        .optional(),
    relationship: z.string()
        .trim()
        .min(1, "Please specify the relationship")
        .max(50, "Relationship is too long"),

    // Theme selection (NEW - Required)
    theme: z.string()
        .min(1, "Please select a theme"),

    // Style Modifiers (Optional)
    childFriendly: z.boolean().optional(),
    faithBased: z.boolean().optional(),

    // Short Phrase (Optional)
    shortPhrase: z.string()
        .trim()
        .max(200, "Short phrase must be less than 200 characters")
        .transform(val => val === "" ? undefined : val)
        .optional(),

    // Emotions to Convey (NEW - Required)
    emotions: z.string()
        .min(1, "Please select the emotions you want to convey"),

    // About Them - Detailed fields
    overallMessage: z.string()
        .trim()
        .min(1, "Please tell us who they are to you")
        .max(300, "Message must be less than 300 characters"),
    storySummary: z.string()
        .trim()
        .min(1, "Please provide a short summary of your story")
        .max(500, "Story summary must be less than 500 characters"),
    qualities: z.string()
        .trim()
        .min(1, "Please list some qualities you admire")
        .max(300, "Qualities must be less than 300 characters"),
    characteristics: z.string()
        .trim()
        .max(300, "Characteristics must be less than 300 characters")
        .transform(val => val === "" ? undefined : val)
        .optional(),

    // Grateful For (NEW - Optional)
    gratefulFor: z.string()
        .trim()
        .max(300, "Grateful for must be less than 300 characters")
        .transform(val => val === "" ? undefined : val)
        .optional(),

    activitiesTogether: z.string()
        .trim()
        .max(300, "Activities must be less than 300 characters")
        .transform(val => val === "" ? undefined : val)
        .optional(),
    favoriteMemory: z.string()
        .trim()
        .max(300, "Favorite memory must be less than 300 characters")
        .transform(val => val === "" ? undefined : val)
        .optional(),
    locationDetails: z.string()
        .trim()
        .max(300, "Location details must be less than 300 characters")
        .transform(val => val === "" ? undefined : val)
        .optional(),

    // Festive Lyrics Level (NEW - Required)
    festiveLyricsLevel: z.string()
        .min(1, "Please select how festive you want the lyrics to be"),

    // Musical Preferences
    voiceType: z.string()
        .trim()
        .transform(val => val === "" ? undefined : val)
        .optional(),
    style: z.string()
        .trim()
        .transform(val => val === "" ? undefined : val)
        .optional(),

    // Festive Sound Level (NEW - Required)
    festiveSoundLevel: z.string()
        .min(1, "Please select how festive you want the song to sound"),

    // Vibe (Required)
    vibe: z.string()
        .min(1, "Please select an overall vibe"),
});

const formSchema = z.object({
    // Sender Info (Global)
    senderName: z.string()
        .trim()
        .min(1, "Please enter your name")
        .max(100, "Name is too long"),
    senderEmail: z.string()
        .trim()
        .toLowerCase()
        .email("Please enter a valid email")
        .min(5, "Email is too short")
        .max(100, "Email is too long"),
    senderPhone: z.string()
        .trim()
        .min(1, "Please enter your phone number")
        .regex(/^[\d\s\+\-\(\)]+$/, "Please enter a valid phone number")
        .min(10, "Phone number must be at least 10 characters"),

    // Global Message & Delivery
    senderMessage: z.string()
        .trim()
        .min(1, "Please add a short message")
        .max(200, "Personal note must be less than 200 characters"),
    deliverySpeed: z.string()
        .min(1, "Please select a delivery speed"),

    // Songs
    songs: z.array(songSchema).min(1),
});

const defaultSongValues = {
    recipientName: "",
    pronunciation: "",
    recipientNickname: "",
    recipientNickname2: "",
    relationship: "",
    theme: "merry-christmas", // Preselect "Merry Christmas" as default
    childFriendly: false,
    faithBased: false,
    shortPhrase: "",
    emotions: "love", // Preselect "Love" as default
    overallMessage: "",
    storySummary: "",
    qualities: "",
    characteristics: "",
    gratefulFor: "",
    activitiesTogether: "",
    favoriteMemory: "",
    locationDetails: "",
    festiveLyricsLevel: "lightly-festive", // Preselect "Lightly Festive" as default
    voiceType: "",
    style: "",
    festiveSoundLevel: "lightly-festive", // Preselect "Lightly Festive" as default
    vibe: "loving",
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
        mode: 'onSubmit', // Show errors when submit is clicked
        reValidateMode: 'onChange', // Re-validate on every change after first validation
        shouldUnregister: false, // Keep values when switching tabs
        defaultValues: {
            senderName: "",
            senderEmail: "",
            senderPhone: "",
            senderMessage: "",
            deliverySpeed: "express",
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

                    // Brief migration check if needed (e.g. if senderMessage was previously in songs, move it out)
                    // For now assuming compatible or fresh reset if structure changed significantly

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
        // Log form submission
        console.log('=== FORM SUBMITTED ===');
        console.log('Form Values:', JSON.stringify(values, null, 2));
        console.log('Songs:', values.songs.map((s, i) => ({
            song: i + 1,
            vibe: s.vibe,
            theme: s.theme,
            globalDelivery: values.deliverySpeed
        })));

        if (credits !== null && credits < 1) {
            setShowCreditsDialog(true);
            return;
        }

        setLoading(true);
        setStatus('Initializing your masterpiece...');
        setError('');

        try {
            let formId = sessionStorage.getItem('currentFormId');
            if (!formId) {
                formId = `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                console.log('[FRONTEND] Generated new form ID:', formId);
            } else {
                console.log('[FRONTEND] Reusing form ID:', formId);
            }

            const generatedPrompts = [];
            const generatedMusicStyles = []; // Store music styles
            const generatedVariationStyles = []; // NEW: Store AI-generated variation styles

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
                    const prevSong = lastSubmittedData.current.songs[i];
                    const prevGlobal = {
                        senderName: lastSubmittedData.current.senderName,
                        senderEmail: lastSubmittedData.current.senderEmail,
                        senderMessage: lastSubmittedData.current.senderMessage, // Included in check
                    };

                    // Deep comparison of song fields + relevant global sender fields
                    const isSongSame = JSON.stringify(song) === JSON.stringify(prevSong);
                    const isGlobalSame =
                        values.senderName === prevGlobal.senderName &&
                        values.senderEmail === prevGlobal.senderEmail &&
                        values.senderMessage === prevGlobal.senderMessage;

                    if (isSongSame && isGlobalSame) {
                        shouldUseCached = true;
                    }
                }

                if (shouldUseCached) {
                    console.log(`[FRONTEND] Using cached prompt for song ${i + 1}`);
                    setStatus(`Using cached result for song ${i + 1}...`);
                    generatedPrompts.push(cachedPrompts.current[i]);
                    // Also use cached music style and variation styles if available
                    const savedData = localStorage.getItem(`songForm_${formId}`);
                    if (savedData) {
                        const parsed = JSON.parse(savedData);
                        if (parsed.allMusicStyles && parsed.allMusicStyles[i]) {
                            generatedMusicStyles.push(parsed.allMusicStyles[i]);
                        }
                        // NEW: Also load cached variation styles
                        if (parsed.allVariationStyles && parsed.allVariationStyles[i]) {
                            generatedVariationStyles.push(parsed.allVariationStyles[i]);
                        }
                    }
                    await new Promise(r => setTimeout(r, 500));
                } else {
                    setStatus(`Composing song ${i + 1} of ${values.songs.length}...`);

                    // Construct payload for API - Inject Global Values
                    const apiPayload = {
                        ...song,
                        senderName: values.senderName,
                        senderEmail: values.senderEmail,
                        senderPhone: values.senderPhone,
                        senderMessage: values.senderMessage, // Global
                        deliverySpeed: values.deliverySpeed // Global
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
                        // Store music_style from response
                        if (data.music_style) {
                            generatedMusicStyles.push(data.music_style);
                            console.log(`[FRONTEND] Music style for song ${i + 1}:`, data.music_style);
                        }
                        // NEW: Store variation_styles from response
                        if (data.variation_styles) {
                            generatedVariationStyles.push(data.variation_styles);
                            console.log(`[FRONTEND] Variation styles for song ${i + 1}:`, data.variation_styles);
                        }
                    } else {
                        throw new Error(data.message || `Failed to generate prompt for song ${i + 1}`);
                    }
                }
            }

            if (generatedPrompts.length > 0) {
                console.log('[FRONTEND] Generated/Cached prompts:', generatedPrompts);
                console.log('[FRONTEND] Generated music styles:', generatedMusicStyles);
                console.log('[FRONTEND] Generated variation styles:', generatedVariationStyles);
                const formDataWithMetadata = {
                    formId,
                    timestamp: Date.now(),
                    formData: values, // Includes global fields
                    generatedPrompt: generatedPrompts[0],
                    allPrompts: generatedPrompts,
                    allMusicStyles: generatedMusicStyles,
                    allVariationStyles: generatedVariationStyles, // NEW: Store variation styles
                    status: 'prompt_generated'
                };

                localStorage.setItem(`songForm_${formId}`, JSON.stringify(formDataWithMetadata));

                cachedPrompts.current = generatedPrompts;
                lastSubmittedData.current = values;

                const existingFormIds = JSON.parse(localStorage.getItem('songFormIds') || '[]');
                if (!existingFormIds.includes(formId)) {
                    existingFormIds.push(formId);
                    localStorage.setItem('songFormIds', JSON.stringify(existingFormIds));
                }

                try {
                    setStatus('Saving to database...');
                    const dbResponse = await fetch('/api/compose/forms', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            formId,
                            packageType: isBundle ? 'holiday-hamper' : 'solo-serenade',
                            songCount: values.songs.length,
                            formData: values, // Full values including global
                            generatedPrompts: generatedPrompts,
                            musicStyles: generatedMusicStyles, // NEW: Save to database
                            variationStyles: generatedVariationStyles, // NEW: Save AI-generated variation styles
                        })
                    });

                    if (!dbResponse.ok) {
                        const errorData = await dbResponse.json();
                        throw new Error(errorData.message || 'Failed to save to database');
                    }

                    console.log('[FRONTEND] ✅ Saved form to database');
                } catch (dbError: any) {
                    console.error('[FRONTEND] ❌ Database save failed:', dbError);
                    setError(`Failed to save to database: ${dbError.message}. Please try again.`);
                    setLoading(false);
                    return;
                }

                sessionStorage.setItem('songFormData', JSON.stringify(values));
                sessionStorage.setItem('generatedPrompt', generatedPrompts[0]);
                sessionStorage.setItem('allPrompts', JSON.stringify(generatedPrompts));
                sessionStorage.setItem('allMusicStyles', JSON.stringify(generatedMusicStyles));
                sessionStorage.setItem('allVariationStyles', JSON.stringify(generatedVariationStyles)); // NEW: Store AI-generated variation styles
                sessionStorage.setItem('currentFormId', formId);

                setStatus('Preparing your variations...');

                setTimeout(() => {
                    const params = new URLSearchParams({
                        recipient: values.songs[0].recipientName,
                        relationship: values.songs[0].relationship,
                        theme: values.songs[0].theme,
                        formId: formId,
                    });
                    router.push(`/compose/variations?${params.toString()}`);
                }, 1000);
            }
        } catch (err: any) {
            console.error('[FRONTEND] Error generating prompt:', err);
            setError(err.message || 'Error generating song prompt. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <div className="text-center mb-6 md:mb-8 relative z-10 px-4">
                <h1 className={`text-[#E8DCC0] text-3xl md:text-3xl lg:text-4xl mb-2 drop-shadow-xl ${lora.className}`} style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                    Compose Your Masterpiece
                </h1>
                <h2 className={`text-[#E8DCC0] text-2xl md:text-3xl lg:text-4xl italic drop-shadow-xl ${lora.className}`} style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                    {isBundle ? "Merry Medley" : "Solo Serenade"}
                </h2>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-4xl mx-auto px-4 pb-8 relative z-10">

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

                    {/* Details and Delivery (Global) */}
                    <div className="space-y-6">
                        {/* Your Details Card */}
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl border-2 border-[#87CEEB]/40 p-6 md:p-8 shadow-[0_8px_30px_rgba(135,206,235,0.3)]">
                            <FormLabel className={`block text-[#E8DCC0] mb-6 text-xl md:text-2xl ${lora.className}`}>Your Details</FormLabel>

                            <FormField
                                control={form.control}
                                name="senderName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="block text-[#87CEEB] mb-2">Your Name <span className="text-[#87CEEB]">*</span></FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Your name"
                                                className="w-full px-4 py-3 bg-[#0f1e30]/60 border-2 border-[#87CEEB]/40 text-white placeholder-white/50 italic rounded-lg focus:outline-none focus:border-[#F5E6B8] transition-all duration-200 backdrop-blur-sm"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">
                                <FormField
                                    control={form.control}
                                    name="senderEmail"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="block text-[#87CEEB] mb-2">Email <span className="text-[#87CEEB]">*</span></FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="email"
                                                    placeholder="your@email.com"
                                                    className="w-full px-4 py-3 bg-[#0f1e30]/60 border-2 border-[#87CEEB]/40 text-white placeholder-white/50 italic rounded-lg focus:outline-none focus:border-[#F5E6B8] transition-all duration-200 backdrop-blur-sm"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="senderPhone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="block text-[#87CEEB] mb-2">Phone Number <span className="text-[#87CEEB]">*</span></FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="tel"
                                                    placeholder="+353 86 123 4567"
                                                    className="w-full px-4 py-3 bg-[#0f1e30]/60 border-2 border-[#87CEEB]/40 text-white placeholder-white/50 italic rounded-lg focus:outline-none focus:border-[#F5E6B8] transition-all duration-200 backdrop-blur-sm"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="mt-4 md:mt-6">
                                <FormField
                                    control={form.control}
                                    name="senderMessage"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="block text-[#87CEEB] mb-2">Add a Short Personal Note (which will be added to your theme - e.g. Merry Christmas) <span className="text-[#87CEEB]">*</span></FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="e.g. Thanks for being my bestie"
                                                    className="w-full px-4 py-3 bg-[#0f1e30]/60 border-2 border-[#87CEEB]/40 text-white placeholder-white/50 italic rounded-lg focus:outline-none focus:border-[#F5E6B8] transition-all duration-200 backdrop-blur-sm"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Delivery Speed Selection Card */}
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl border-2 border-[#87CEEB]/40 p-6 md:p-8 shadow-[0_8px_30px_rgba(135,206,235,0.3)]">
                            <FormField
                                control={form.control}
                                name="deliverySpeed"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={`block text-[#F5E6B8] mb-6 text-xl md:text-2xl ${lora.className}`}>Choose Your Delivery Speed<span className="text-[#F5E6B8]"> *</span></FormLabel>
                                        <FormControl>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Standard Option */}
                                                <div
                                                    onClick={() => field.onChange('standard')}
                                                    className={`flex flex-col p-6 rounded-xl border-2 text-left cursor-pointer opacity-60 border-[#87CEEB]/30 bg-white/5`}
                                                >
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <Clock className="w-7 h-7 text-[#87CEEB]/70" />
                                                        <div className={`text-xl text-[#F5E6B8] ${lora.className}`}>Standard</div>
                                                    </div>
                                                    <div className="text-sm text-[#87CEEB]/80">Within 24 hours</div>
                                                    <div className="mt-2 text-lg text-[#F5E6B8]">Included</div>
                                                </div>

                                                {/* Express Option with Gifted Badge */}
                                                <div
                                                    onClick={() => field.onChange('express')}
                                                    className="flex flex-col p-6 rounded-xl border-2 text-left cursor-pointer relative border-[#F5E6B8] bg-[#F5E6B8]/10 shadow-[0_8px_30px_rgba(245,230,184,0.4)] scale-105"
                                                >
                                                    {/* Gifted Badge */}
                                                    <div className="absolute -top-3 -right-3 bg-gradient-to-br from-[#F5E6B8] to-[#E8D89F] text-[#1a3d5f] px-3 py-1 rounded-full text-xs font-semibold shadow-lg z-20">
                                                        Gifted
                                                    </div>
                                                    {/* Gift Icon */}
                                                    <Gift className="w-6 h-6 text-[#F5E6B8] absolute top-7 right-12 z-10" />

                                                    <div className="flex items-center gap-3 mb-3 relative z-10">
                                                        <Zap className="w-7 h-7 text-[#F5E6B8]" />
                                                        <div className={`text-xl text-white ${lora.className}`}>Express ⚡</div>
                                                    </div>
                                                    <div className="text-sm text-white/90 relative z-10">Within 1 hour</div>
                                                    <div className="mt-2 text-lg text-[#F5E6B8] relative z-10">
                                                        <span className="line-through opacity-60">+€10</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Promotional Message */}
                            <div className="mt-6">
                                <div className="bg-gradient-to-r from-[#87CEEB]/20 to-[#87CEEB]/10 border-2 border-[#87CEEB]/40 rounded-xl p-3 md:p-4 flex items-center justify-center gap-3 md:gap-4 backdrop-blur-sm">
                                    <Gift className="w-6 h-6 md:w-7 md:h-7 text-[#87CEEB] flex-shrink-0" />
                                    <div className="text-center">
                                        <p className={`text-white text-sm md:text-base ${lora.className}`}>
                                            <span className="text-[#F5E6B8] font-semibold">* Our Gift to You:</span> We're gifting <span className="text-[#87CEEB] font-semibold">Free Express Delivery</span> to all orders before Christmas 🎄
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status Messages */}
                    {status && (
                        <div className="relative overflow-hidden bg-white/5 backdrop-blur-md rounded-2xl border-2 border-[#87CEEB]/40 p-6 shadow-[0_8px_30px_rgba(135,206,235,0.3)] animate-pulse">
                            {/* Animated gradient background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[#87CEEB]/10 via-[#F5E6B8]/10 to-[#87CEEB]/10 animate-shimmer"></div>

                            {/* Content */}
                            <div className="relative z-10 flex items-center gap-4">
                                {/* Loading spinner */}
                                <div className="flex-shrink-0">
                                    <svg className="animate-spin h-6 w-6 text-[#87CEEB]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </div>

                                {/* Status text */}
                                <p className={`text-[#F5E6B8] text-lg font-medium ${lora.className}`}>
                                    {status}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex justify-center pt-4">
                        <button
                            data-slot="button"
                            type="submit"
                            disabled={loading}
                            className={`inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-primary/90 h-10 has-[>svg]:px-4 w-full max-w-md bg-gradient-to-br from-[#F5E6B8] to-[#E8D89F] hover:from-[#F8F0DC] hover:to-[#E8DCC0] text-[#1a3d5f] shadow-[0_8px_30px_rgba(245,230,184,0.4)] hover:shadow-[0_12px_40px_rgba(245,230,184,0.6)] active:shadow-[0_0_40px_rgba(135,206,235,0.8),0_0_20px_rgba(135,206,235,0.6),0_8px_30px_rgba(135,206,235,0.5)] px-8 py-6 border-3 border-[#D4C5A0] rounded-xl transform hover:scale-105 active:scale-105 transition-all duration-200 text-xl ${lora.className}`}
                        >
                            {loading ? (
                                <>
                                    <LoadingSpinner size="md" variant="dots" color="primary" />
                                    Processing...
                                </>
                            ) : (
                                "I'm Ready! Compose My Song" + (isBundle ? "s" : "")
                            )}
                        </button>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-200 text-center animate-in fade-in slide-in-from-bottom-2">
                            {error}
                        </div>
                    )}
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
        </div>
    );
}
