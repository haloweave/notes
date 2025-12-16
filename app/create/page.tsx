'use client';

import { useState, useEffect } from 'react';
import { Lora } from 'next/font/google';

const lora = Lora({ subsets: ['latin'] });
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PremiumButton } from '@/components/ui/premium-button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Loading01Icon, SparklesIcon, GiftIcon, KissingIcon, StarIcon, HeartCheckIcon, Tree07Icon } from 'hugeicons-react';
import { PricingTable } from '@/components/dashboard/pricing-table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Image from 'next/image';

const formSchema = z.object({
    // Sender Info
    senderName: z.string().min(1, "Please enter your name"),
    senderEmail: z.string().email("Please enter a valid email"),
    senderPhone: z.string().min(1, "Please enter your phone number"),
    senderMessage: z.string().min(1, "Please add a short message"),

    // Recipient Info
    recipientName: z.string().min(1, "Please enter the recipient's name"),
    recipientNickname: z.string().optional(),
    relationship: z.string().min(1, "Please specify the relationship"),
    pronunciation: z.string().optional(),

    // Song Details
    theme: z.string().min(1, "Please select a theme"),
    aboutThem: z.string().min(10, "Please tell us more about them (at least 10 characters)"),
    moreInfo: z.string().optional(),

    // Musical Preferences
    voiceType: z.string().optional(),
    genreStyle: z.string().optional(),
    instrumentPreferences: z.string().optional(),

    // Overall Vibe
    vibe: z.string().min(1, "Please select an overall vibe"),
});

const themes = [
    { value: "merry-christmas", label: "Merry Christmas", description: "Traditional, Festive and Joyful", icon: Tree07Icon },
    { value: "happy-holidays", label: "Happy Holidays", description: "Fun, Happy, Playful", icon: GiftIcon },
    { value: "mistletoe-kisses", label: "Mistletoe Kisses", description: "Romantic or Flirty", icon: HeartCheckIcon },
    { value: "christmas-wish", label: "A Christmas Wish", description: "Loving, Emotional, but Hopeful", icon: StarIcon },
    { value: "happy-new-year", label: "Happy New Year", description: "Celebratory, Hopeful, Fun", icon: SparklesIcon },
    { value: "new-years-wish", label: "New Year's Wish", description: "Emotional, Sentimental, Heartfelt", icon: StarIcon },
];

const vibes = [
    { value: "loving", label: "Loving", description: "All the Feels" },
    { value: "friendly-fun", label: "Friendly/Fun", description: "Lighthearted & Upbeat" },
    { value: "formal", label: "Formal", description: "Best for Acquaintances/Colleagues" },
];

export default function CreatePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');
    const [credits, setCredits] = useState<number | null>(null);
    const [showCreditsDialog, setShowCreditsDialog] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            senderName: "",
            senderEmail: "",
            senderPhone: "",
            senderMessage: "",
            recipientName: "",
            recipientNickname: "",
            relationship: "",
            pronunciation: "",
            theme: "",
            aboutThem: "",
            moreInfo: "",
            voiceType: "",
            genreStyle: "",
            instrumentPreferences: "",
            vibe: "",
        },
    });

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
                    form.reset(parsed.formData);
                } catch (e) {
                    console.error('[FRONTEND] Error parsing saved form data:', e);
                }
            }
        } else {
            // Fallback to sessionStorage
            const sessionFormData = sessionStorage.getItem('songFormData');
            if (sessionFormData) {
                try {
                    const parsed = JSON.parse(sessionFormData);
                    console.log('[FRONTEND] Restoring form data from sessionStorage:', parsed);
                    form.reset(parsed);
                } catch (e) {
                    console.error('[FRONTEND] Error parsing session form data:', e);
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
        setStatus('Creating your personalized song prompt...');
        setError('');

        try {
            // Generate unique form ID
            const formId = `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            console.log('[FRONTEND] Generated form ID:', formId);

            // Generate prompt using Groq API
            console.log('[FRONTEND] Generating prompt with form data:', values);
            const response = await fetch('/api/create-song-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values)
            });

            const data = await response.json();
            console.log('[FRONTEND] Prompt generation response:', data);

            if (data.success && data.prompt) {
                console.log('[FRONTEND] Generated prompt:', data.prompt);

                // Create complete form data object with metadata
                const formDataWithMetadata = {
                    formId,
                    timestamp: new Date().toISOString(),
                    formData: values,
                    generatedPrompt: data.prompt,
                    status: 'prompt_generated'
                };

                // Save to localStorage with unique form ID
                localStorage.setItem(`songForm_${formId}`, JSON.stringify(formDataWithMetadata));

                // Also save to a list of all form IDs for easy retrieval
                const existingFormIds = JSON.parse(localStorage.getItem('songFormIds') || '[]');
                existingFormIds.push(formId);
                localStorage.setItem('songFormIds', JSON.stringify(existingFormIds));

                // Store in sessionStorage for immediate use
                sessionStorage.setItem('songFormData', JSON.stringify(values));
                sessionStorage.setItem('generatedPrompt', data.prompt);
                sessionStorage.setItem('currentFormId', formId);

                console.log('[FRONTEND] Form data saved to localStorage with ID:', formId);

                setStatus('Preparing your variations...');

                // Redirect to variations page with key data in URL
                setTimeout(() => {
                    const params = new URLSearchParams({
                        recipient: values.recipientName,
                        relationship: values.relationship,
                        theme: values.theme,
                        formId: formId, // Include form ID in URL
                    });
                    router.push(`/variations?${params.toString()}`);
                }, 1000);
            } else {
                console.error('[FRONTEND] Failed to generate prompt:', data.message);
                setError(data.message || 'Failed to generate song prompt. Please try again.');
                setLoading(false);
            }
        } catch (err: any) {
            console.error('[FRONTEND] Error generating prompt:', err);
            setError('Error generating song prompt. Please try again.');
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
                    <div className="snowflake">❅</div>
                    <div className="snowflake">❅</div>
                    <div className="snowflake">❆</div>
                    <div className="snowflake">❄</div>
                    <div className="snowflake">❅</div>
                    <div className="snowflake">❆</div>
                    <div className="snowflake">❄</div>
                    <div className="snowflake">❅</div>
                    <div className="snowflake">❆</div>
                    <div className="snowflake">❄</div>
                    <div className="snowflake">❅</div>
                    <div className="snowflake">❆</div>
                </div>
            </div>

            {/* Header */}
            <div className="relative z-10 max-w-4xl mx-auto mb-8 text-center pt-8 px-4">
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
                <h1 className={`text-white md:text-[#E8DCC0] lg:text-[#E8DCC0] text-2xl md:text-3xl lg:text-3xl font-normal mb-2 drop-shadow-xl ${lora.className}`} style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                    Compose Your Masterpiece
                </h1>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-4xl mx-auto px-4 pb-8 relative z-10">

                    {/* Card 1: Sender Information */}
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

                            <FormField
                                control={form.control}
                                name="senderMessage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="block text-[#87CEEB] mb-2">Add a short message <span className="text-[#87CEEB]">*</span></FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="A personal message to accompany your song..."
                                                rows={3}
                                                className="w-full px-4 py-3 bg-[#0f1e30]/60 border-2 border-[#87CEEB]/40 text-white placeholder-white/50 italic rounded-lg focus:outline-none focus:border-[#F5E6B8] transition-all duration-200 backdrop-blur-sm resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Card 2: Recipient Information */}
                    <Card>
                        <CardContent>
                            <h2 className={`text-xl md:text-2xl text-[#E8DCC0] ${lora.className}`}>Who is this song for?</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                <FormField
                                    control={form.control}
                                    name="recipientName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="block text-[#87CEEB] mb-2">Name <span className="text-[#87CEEB]">*</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder="Name" className="w-full px-4 py-3 bg-[#0f1e30]/60 border-2 border-[#87CEEB]/40 text-white placeholder-white/50 italic rounded-lg focus:outline-none focus:border-[#F5E6B8] transition-all duration-200 backdrop-blur-sm" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="recipientNickname"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="block text-[#87CEEB] mb-2">What do you call them?</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Petnames / nicknames etc." className="w-full px-4 py-3 bg-[#0f1e30]/60 border-2 border-[#87CEEB]/40 text-white placeholder-white/50 italic rounded-lg focus:outline-none focus:border-[#F5E6B8] transition-all duration-200 backdrop-blur-sm" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="relationship"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="block text-[#87CEEB] mb-2">Relationship <span className="text-[#87CEEB]">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="Mum, Dad, Son, Daughter, Girlfriend, Boyfriend, Wife, Husband, Friend, Sister, Brother..." className="w-full px-4 py-3 bg-[#0f1e30]/60 border-2 border-[#87CEEB]/40 text-white placeholder-white/50 italic rounded-lg focus:outline-none focus:border-[#F5E6B8] transition-all duration-200 backdrop-blur-sm" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="pronunciation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="block text-[#87CEEB] mb-2">Pronunciation</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Write phonetically if complicated spelling" className="w-full px-4 py-3 bg-[#0f1e30]/60 border-2 border-[#87CEEB]/40 text-white placeholder-white/50 italic rounded-lg focus:outline-none focus:border-[#F5E6B8] transition-all duration-200 backdrop-blur-sm" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Card 3: Theme Selection */}
                    <Card>
                        <CardContent>
                            <FormField
                                control={form.control}
                                name="theme"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={`text-lg ${lora.className}`} style={{ color: '#E7DBBF' }}>Choose a theme *</FormLabel>
                                        <FormControl>
                                            <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {themes.map((theme) => {
                                                    const IconComponent = theme.icon;
                                                    return (
                                                        <div key={theme.value} className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all duration-150 text-center cursor-pointer will-change-transform ${field.value === theme.value
                                                            ? 'border-[#87CEEB] bg-[#87CEEB]/20 shadow-[0_0_30px_rgba(135,206,235,0.8)] scale-105 z-0'
                                                            : 'bg-white/5 backdrop-blur-md border-[#87CEEB]/40 shadow-[0_8px_30px_rgba(135,206,235,0.3)] hover:border-[#87CEEB]/80 hover:shadow-[0_8px_30px_rgba(135,206,235,0.5)] hover:z-10'
                                                            }`}>
                                                            <RadioGroupItem value={theme.value} id={theme.value} className="sr-only" />
                                                            <Label htmlFor={theme.value} className="flex flex-col items-center text-center cursor-pointer w-full gap-3">
                                                                <IconComponent className="w-16 h-16 text-[#87CEEB] flex-shrink-0" />
                                                                <div className="flex-1">
                                                                    <div className="mb-1 text-[#F5E6B8] font-semibold text-base">{theme.label}</div>
                                                                    <div className="text-xs text-[#87CEEB]/80">{theme.description}</div>
                                                                </div>
                                                            </Label>
                                                        </div>
                                                    );
                                                })}
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Card 4: About Them */}
                    <Card>
                        <CardContent>
                            <FormField
                                control={form.control}
                                name="aboutThem"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="block text-[#87CEEB] mb-2">About Them <span className="text-[#87CEEB]">*</span></FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="What do you admire most about them?"
                                                rows={4}
                                                className="w-full px-4 py-3 bg-[#0f1e30]/60 border-2 border-[#87CEEB]/40 text-white placeholder-white/50 italic rounded-lg focus:outline-none focus:border-[#F5E6B8] transition-all duration-200 backdrop-blur-sm resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="moreInfo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="block text-[#87CEEB] mb-2">More Info</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Story, phrase or keywords you want to include"
                                                rows={3}
                                                className="w-full px-4 py-3 bg-[#0f1e30]/60 border-2 border-[#87CEEB]/40 text-white placeholder-white/50 italic rounded-lg focus:outline-none focus:border-[#F5E6B8] transition-all duration-200 backdrop-blur-sm resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Card 5: Musical Preferences */}
                    <Card>
                        <CardContent>
                            <h2 className={`text-xl md:text-2xl text-[#E8DCC0] ${lora.className}`}>Musical Preferences (Optional)</h2>

                            <FormField
                                control={form.control}
                                name="voiceType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="block text-[#87CEEB] mb-2">Voice Type</FormLabel>
                                        <FormControl>
                                            <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div
                                                    onClick={() => field.onChange('male')}
                                                    className={`flex flex-col items-center justify-center gap-3 p-5 rounded-xl border-2 transition-all duration-150 text-center cursor-pointer will-change-transform ${field.value === 'male'
                                                        ? 'border-[#87CEEB] bg-[#87CEEB]/20 shadow-[0_0_30px_rgba(135,206,235,0.8)] scale-105'
                                                        : 'bg-white/5 backdrop-blur-md border-[#87CEEB]/40 shadow-[0_8px_30px_rgba(135,206,235,0.3)] hover:border-[#87CEEB]/80 hover:shadow-[0_8px_30px_rgba(135,206,235,0.5)]'
                                                        }`}>
                                                    <div className="font-semibold text-[#F5E6B8]">Male Voice</div>
                                                </div>
                                                <div
                                                    onClick={() => field.onChange('female')}
                                                    className={`flex flex-col items-center justify-center gap-3 p-5 rounded-xl border-2 transition-all duration-150 text-center cursor-pointer will-change-transform ${field.value === 'female'
                                                        ? 'border-[#87CEEB] bg-[#87CEEB]/20 shadow-[0_0_30px_rgba(135,206,235,0.8)] scale-105'
                                                        : 'bg-white/5 backdrop-blur-md border-[#87CEEB]/40 shadow-[0_8px_30px_rgba(135,206,235,0.3)] hover:border-[#87CEEB]/80 hover:shadow-[0_8px_30px_rgba(135,206,235,0.5)]'
                                                        }`}>
                                                    <div className="font-semibold text-[#F5E6B8]">Female Voice</div>
                                                </div>
                                                <div
                                                    onClick={() => field.onChange('no-preference')}
                                                    className={`flex flex-col items-center justify-center gap-3 p-5 rounded-xl border-2 transition-all duration-150 text-center cursor-pointer will-change-transform ${field.value === 'no-preference'
                                                        ? 'border-[#87CEEB] bg-[#87CEEB]/20 shadow-[0_0_30px_rgba(135,206,235,0.8)] scale-105'
                                                        : 'bg-white/5 backdrop-blur-md border-[#87CEEB]/40 shadow-[0_8px_30px_rgba(135,206,235,0.3)] hover:border-[#87CEEB]/80 hover:shadow-[0_8px_30px_rgba(135,206,235,0.5)]'
                                                        }`}>
                                                    <div className="font-semibold text-[#F5E6B8]">No Preference</div>
                                                </div>
                                            </RadioGroup>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="genreStyle"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="block text-[#87CEEB] mb-2">Genre Style</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Pop, Country, R&B, Acoustic, Jazz, Rock..." className="w-full px-4 py-3 bg-[#0f1e30]/60 border-2 border-[#87CEEB]/40 text-white placeholder-white/50 italic rounded-lg focus:outline-none focus:border-[#F5E6B8] transition-all duration-200 backdrop-blur-sm" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="instrumentPreferences"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="block text-[#87CEEB] mb-2">Instrument Preferences</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Piano, Guitar, Strings, Upbeat drums..." className="w-full px-4 py-3 bg-[#0f1e30]/60 border-2 border-[#87CEEB]/40 text-white placeholder-white/50 italic rounded-lg focus:outline-none focus:border-[#F5E6B8] transition-all duration-200 backdrop-blur-sm" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Card 6: Overall Vibe */}
                    <Card>
                        <CardContent>
                            <FormField
                                control={form.control}
                                name="vibe"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={`text-xl md:text-2xl text-[#E8DCC0] ${lora.className}`}>One last thing...select overall vibe? <span className="text-[#87CEEB]">*</span></FormLabel>
                                        <FormControl>
                                            <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {vibes.map((vibe) => (
                                                    <div
                                                        key={vibe.value}
                                                        onClick={() => field.onChange(vibe.value)}
                                                        className={`flex flex-col items-center justify-center gap-3 p-5 rounded-xl border-2 transition-all duration-150 text-center cursor-pointer will-change-transform ${field.value === vibe.value
                                                            ? 'border-[#87CEEB] bg-[#87CEEB]/20 shadow-[0_0_30px_rgba(135,206,235,0.8)] scale-105'
                                                            : 'bg-white/5 backdrop-blur-md border-[#87CEEB]/40 shadow-[0_8px_30px_rgba(135,206,235,0.3)] hover:border-[#87CEEB]/80 hover:shadow-[0_8px_30px_rgba(135,206,235,0.5)]'
                                                            }`}>
                                                        <div className="font-semibold text-[#F5E6B8]">{vibe.label}</div>
                                                        <div className="text-xs text-[#87CEEB]/80">{vibe.description}</div>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

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
                                "I'm Ready! Compose My Song"
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
