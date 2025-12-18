"use client";

import { useState } from "react";
import { Lora } from "next/font/google";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loading01Icon, GiftIcon, SparklesIcon, HeartCheckIcon, StarIcon, Tree07Icon } from "hugeicons-react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Trash2Icon } from "lucide-react";

const lora = Lora({ subsets: ["latin"] });

const themes = [
    { value: "merry-christmas", label: "Merry Christmas", description: "Traditional, Festive and Joyful", icon: Tree07Icon },
    { value: "happy-holidays", label: "Happy Holidays", description: "Fun, Happy, Playful", icon: GiftIcon },
    { value: "mistletoe-kisses", label: "Mistletoe Kisses", description: "Romantic or Flirty", icon: HeartCheckIcon },
    { value: "christmas-wish", label: "A Christmas Wish", description: "Loving, Emotional, but Hopeful", icon: StarIcon },
    { value: "happy-new-year", label: "Happy New Year", description: "Celebratory, Hopeful, Fun", icon: SparklesIcon },
    { value: "new-years-wish", label: "New Year's Wish", description: "Emotional, Sentimental, Heartfelt", icon: StarIcon },
];

const styles = [
    { value: "vintage-ballad", label: "Vintage / Smooth Ballad", description: "Cozy, warm, nostalgic" },
    { value: "gentle-ballad", label: "Gentle / Emotional Ballad", description: "Soft, heartfelt, reflective" },
    { value: "uptempo-retro", label: "Up-Tempo Retro", description: "Fun, lively, upbeat" },
    { value: "warm-jazz", label: "Warm / Intimate Jazz", description: "Smooth, cozy, intimate" },
    { value: "contemporary-pop", label: "Contemporary Pop", description: "Modern, catchy, polished" },
    { value: "swing-influenced", label: "Swing-Influenced", description: "Playful, festive, swinging" },
];

const vibes = [
    { value: "loving", label: "Loving", description: "All the Feels" },
    { value: "friendly-fun", label: "Friendly/Fun", description: "Lighthearted & Upbeat" },
    { value: "formal", label: "Formal", description: "Best for Acquaintances/Colleagues" },
];

interface SongFormProps {
    index: number;
    title: string;
    onRemove?: () => void;
    canRemove?: boolean;
    namePrefix?: string; // e.g. "songs.0" for nested forms
}

export function SongForm({ index, title, onRemove, canRemove = false, namePrefix = "" }: SongFormProps) {
    const { control } = useFormContext();

    // Helper to get field name: if namePrefix is provided, use it (e.g., songs.0.recipientName), otherwise use flat name
    const getFieldName = (name: string) => namePrefix ? `${namePrefix}.${name}` : name;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Recipient Information Card */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border-2 border-[#87CEEB]/40 p-6 md:p-8 shadow-[0_8px_30px_rgba(135,206,235,0.3)]">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        {/* Optional Subtitle for Bundle Mode */}
                        {namePrefix && (
                            <span className="block text-[#87CEEB] text-lg mb-2">Song {index + 1}</span>
                        )}
                        <h2 className={`text-xl md:text-2xl text-[#E8DCC0] ${lora.className}`}>{title || "Who is this song for?"}</h2>
                    </div>
                    {canRemove && onRemove && (
                        <Button
                            type="button"
                            onClick={onRemove}
                            className="bg-red-500/80 hover:bg-red-600 text-white gap-2"
                        >
                            <Trash2Icon className="w-4 h-4" />
                            <span className="hidden md:inline">Remove</span>
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <FormField
                        control={control}
                        name={getFieldName("recipientName")}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="block text-[#87CEEB] mb-2">Recipient's Name <span className="text-[#87CEEB]/60 text-sm">(first name will suffice)</span> <span className="text-[#87CEEB]">*</span></FormLabel>
                                <FormControl>
                                    <Input placeholder="Recipient's name" className="w-full px-4 py-3 bg-[#0f1e30]/60 border-2 border-[#87CEEB]/40 text-white placeholder-white/50 italic rounded-lg focus:outline-none focus:border-[#F5E6B8] transition-all duration-200 backdrop-blur-sm" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name={getFieldName("pronunciation")}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="block text-[#87CEEB] mb-2">Pronunciation</FormLabel>
                                <FormControl>
                                    <Input placeholder="Write phonetically if complicated spelling" className="w-full px-4 py-3 bg-[#0f1e30]/60 border-2 border-[#87CEEB]/40 text-white placeholder-white/50 italic rounded-lg focus:outline-none focus:border-[#F5E6B8] transition-all duration-200 backdrop-blur-sm" {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="mt-4 md:mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <FormField
                        control={control}
                        name={getFieldName("recipientNickname")}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="block text-[#87CEEB] mb-2">What do you call them?</FormLabel>
                                <FormControl>
                                    <Input placeholder="Petnames / nicknames etc." className="w-full px-4 py-3 bg-[#0f1e30]/60 border-2 border-[#87CEEB]/40 text-white placeholder-white/50 italic rounded-lg focus:outline-none focus:border-[#F5E6B8] transition-all duration-200 backdrop-blur-sm" {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name={getFieldName("relationship")}
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
                </div>
            </div>

            {/* Theme Selection Card */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border-2 border-[#87CEEB]/40 p-6 md:p-8 shadow-[0_8px_30px_rgba(135,206,235,0.3)]">
                <FormField
                    control={control}
                    name={getFieldName("theme")}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className={`text-xl md:text-2xl mb-6 block text-[#F5E6B8] ${lora.className}`}>Choose a theme <span className="text-[#F5E6B8]">*</span></FormLabel>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {themes.map((theme) => {
                                        const IconComponent = theme.icon;
                                        return (
                                            <div key={theme.value}
                                                onClick={() => field.onChange(theme.value)}
                                                className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all duration-200 text-center transform cursor-pointer will-change-transform ${field.value === theme.value
                                                    ? 'border-[#87CEEB] bg-[#87CEEB]/20 shadow-[0_0_30px_rgba(135,206,235,0.8)] scale-105 z-0'
                                                    : 'bg-white/5 backdrop-blur-md border-[#87CEEB]/30 hover:border-[#87CEEB] hover:bg-white/10 hover:scale-[1.02] hover:shadow-lg'
                                                    }`}>
                                                <RadioGroupItem value={theme.value} id={`${getFieldName("theme")}-${theme.value}`} className="sr-only" />
                                                <IconComponent className="w-8 h-8 flex-shrink-0 text-[#87CEEB]" />
                                                <div className="flex-1">
                                                    <div className="mb-1 text-[#F5E6B8] font-medium">{theme.label}</div>
                                                    <div className="text-xs text-[#87CEEB]/80">{theme.description}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </RadioGroup>
                            </FormControl>
                            <div className="mt-4">
                                <FormMessage className="text-red-400 text-sm font-medium" />
                            </div>
                        </FormItem>
                    )}
                />
            </div>

            {/* About Them Card */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border-2 border-[#87CEEB]/40 p-6 md:p-8 shadow-[0_8px_30px_rgba(135,206,235,0.3)] space-y-6">
                <div>
                    <h2 className={`block text-[#F5E6B8] mb-2 text-lg md:text-2xl ${lora.className}`}>About Them</h2>
                    <p className="text-[#87CEEB]/80 text-sm mb-6">Fill in any fields below you feel will make this song more meaningful?</p>
                </div>

                <FormField
                    control={control}
                    name={getFieldName("overallMessage")}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="block text-[#87CEEB] mb-2">Overall Message - What are you trying to say with this song? <span className="text-[#87CEEB]">*</span></FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="e.g. Let her know she's loved, celebrate our friendship"
                                    className="w-full px-4 py-3 bg-[#0f1e30]/60 border-2 border-[#87CEEB]/40 text-white placeholder-white/50 italic rounded-lg focus:outline-none focus:border-[#F5E6B8] transition-all duration-200 backdrop-blur-sm"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name={getFieldName("storySummary")}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="block text-[#87CEEB] mb-2">Your Story - Short Summary: <span className="text-[#87CEEB]">*</span></FormLabel>
                            <FormControl>
                                <Textarea
                                    {...field}
                                    placeholder="e.g. met in pre-school and best friends since"
                                    rows={3}
                                    className="w-full px-4 py-3 bg-[#0f1e30]/60 border-2 border-[#87CEEB]/40 text-white placeholder-white/50 italic rounded-lg focus:outline-none focus:border-[#F5E6B8] transition-all duration-200 backdrop-blur-sm resize-none"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name={getFieldName("favoriteMemory")}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="block text-[#87CEEB] mb-2">Favourite memory: <span className="text-[#87CEEB]">*</span></FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="e.g. our skiing trip to Aspen"
                                    className="w-full px-4 py-3 bg-[#0f1e30]/60 border-2 border-[#87CEEB]/40 text-white placeholder-white/50 italic rounded-lg focus:outline-none focus:border-[#F5E6B8] transition-all duration-200 backdrop-blur-sm"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name={getFieldName("qualities")}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="block text-[#87CEEB] mb-2">List some qualities you admire about them? <span className="text-[#87CEEB]">*</span></FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="e.g. patience, loyal friend, the best Auntie"
                                    className="w-full px-4 py-3 bg-[#0f1e30]/60 border-2 border-[#87CEEB]/40 text-white placeholder-white/50 italic rounded-lg focus:outline-none focus:border-[#F5E6B8] transition-all duration-200 backdrop-blur-sm"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name={getFieldName("activitiesTogether")}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="block text-[#87CEEB] mb-2">List some things you like to do together:</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="e.g. movie nights, dance class"
                                    className="w-full px-4 py-3 bg-[#0f1e30]/60 border-2 border-[#87CEEB]/40 text-white placeholder-white/50 italic rounded-lg focus:outline-none focus:border-[#F5E6B8] transition-all duration-200 backdrop-blur-sm"
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name={getFieldName("characteristics")}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="block text-[#87CEEB] mb-2">Any defining but loveable characteristics you'd like to include:</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="e.g. always late, loves wine"
                                    className="w-full px-4 py-3 bg-[#0f1e30]/60 border-2 border-[#87CEEB]/40 text-white placeholder-white/50 italic rounded-lg focus:outline-none focus:border-[#F5E6B8] transition-all duration-200 backdrop-blur-sm"
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name={getFieldName("locationDetails")}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="block text-[#87CEEB] mb-2">Details - Location names or other specifics/keywords you'd like mentioned:</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="e.g. Paris, our favourite coffee shop"
                                    className="w-full px-4 py-3 bg-[#0f1e30]/60 border-2 border-[#87CEEB]/40 text-white placeholder-white/50 italic rounded-lg focus:outline-none focus:border-[#F5E6B8] transition-all duration-200 backdrop-blur-sm"
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
            </div>

            {/* Musical Preferences Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border-2 border-[#87CEEB]/40 p-6 md:p-8 shadow-[0_8px_30px_rgba(135,206,235,0.3)]">
                <h2 className={`text-[#E8DCC0] mb-6 text-xl md:text-2xl ${lora.className}`}>Musical Preferences <span className="text-[#87CEEB]/70 text-base">(Optional)</span></h2>

                <div className="mb-6">
                    <FormField
                        control={control}
                        name={getFieldName("voiceType")}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="block text-[#87CEEB] mb-3">Voice Type</FormLabel>
                                <FormControl>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {['male', 'female', 'no-preference'].map((type) => (
                                            <div
                                                key={type}
                                                onClick={() => field.onChange(type)}
                                                className={`p-4 rounded-lg border-2 transition-all duration-200 transform cursor-pointer text-center ${field.value === type
                                                    ? 'border-[#87CEEB] bg-[#87CEEB]/20 text-[#F5E6B8]'
                                                    : 'border-[#87CEEB]/30 bg-white/5 hover:border-[#87CEEB]/50 hover:bg-white/10 text-[#F5E6B8]'
                                                    }`}
                                            >
                                                {type === 'no-preference' ? 'No Preference' : `${type.charAt(0).toUpperCase() + type.slice(1)} Voice`}
                                            </div>
                                        ))}
                                    </div>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="mb-6">
                    <FormField
                        control={control}
                        name={getFieldName("genreStyle")}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="block text-[#87CEEB] mb-2">Genre</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="e.g., Pop, Country, R&B, Acoustic, Jazz, Rock..." className="w-full px-4 py-3 bg-[#0f1e30]/60 border-2 border-[#87CEEB]/40 text-white placeholder-white/50 rounded-lg focus:outline-none focus:border-[#87CEEB] transition-all duration-200 backdrop-blur-sm" />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <div>
                    <FormField
                        control={control}
                        name={getFieldName("style")}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="block text-[#87CEEB] mb-2">Style</FormLabel>
                                <p className="text-[#87CEEB]/70 text-sm mb-4">Choose the option that best matches the overall feel you want (mood, tempo etc.)</p>
                                <FormControl>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {styles.map((style) => (
                                            <div
                                                key={style.value}
                                                onClick={() => field.onChange(style.value)}
                                                className={`flex flex-col items-start p-4 rounded-lg border-2 transition-all duration-200 transform text-left cursor-pointer ${field.value === style.value
                                                    ? 'border-[#87CEEB] bg-[#87CEEB]/20 scale-102'
                                                    : 'border-[#87CEEB]/30 bg-white/5 hover:border-[#87CEEB]/50 hover:bg-white/10 hover:scale-102'
                                                    }`}
                                            >
                                                <div className="text-[#F5E6B8] mb-1">{style.label}</div>
                                                <div className="text-xs text-[#87CEEB]/70">{style.description}</div>
                                            </div>
                                        ))}
                                    </div>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
            </div>

            {/* Vibe Selection Card */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border-2 border-[#87CEEB]/40 p-6 md:p-8 shadow-[0_8px_30px_rgba(135,206,235,0.3)]">
                <FormField
                    control={control}
                    name={getFieldName("vibe")}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className={`block text-[#F5E6B8] mb-6 text-xl md:text-2xl ${lora.className}`}>One last thing...select overall vibe? <span className="text-[#F5E6B8]">*</span></FormLabel>
                            <FormControl>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {vibes.map((vibe) => (
                                        <button
                                            key={vibe.value}
                                            type="button"
                                            onClick={() => field.onChange(vibe.value)}
                                            className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-200 transform cursor-pointer ${field.value === vibe.value
                                                ? 'border-[#87CEEB] bg-[#87CEEB]/20 shadow-[0_0_30px_rgba(135,206,235,0.8)] scale-105'
                                                : 'border-[#87CEEB]/30 bg-white/5 hover:border-[#87CEEB] hover:bg-white/10 hover:scale-102'
                                                }`}
                                        >
                                            {vibe.value === 'loving' && (
                                                <HeartCheckIcon className="w-8 h-8 mb-3 text-[#87CEEB]/70" />
                                            )}
                                            {vibe.value === 'friendly-fun' && (
                                                <SparklesIcon className="w-8 h-8 mb-3 text-[#87CEEB]/70" />
                                            )}
                                            {vibe.value === 'formal' && (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 mb-3 text-[#87CEEB]/70">
                                                    <path d="M19 21 v-2 a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                                                    <circle cx="12" cy="7" r="4"></circle>
                                                </svg>
                                            )}
                                            <div className="text-center mb-2 text-[#F5E6B8] font-medium">{vibe.label}</div>
                                            <div className="text-xs text-[#87CEEB]/70">{vibe.description}</div>
                                        </button>
                                    ))}
                                </div>
                            </FormControl>
                            <FormMessage className="text-red-400 text-sm font-medium mt-4" />
                        </FormItem>
                    )}
                />
            </div>

            {/* Your Details Card */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border-2 border-[#87CEEB]/40 p-6 md:p-8 shadow-[0_8px_30px_rgba(135,206,235,0.3)]">
                <FormLabel className={`block text-[#E8DCC0] mb-6 text-xl md:text-2xl ${lora.className}`}>Your Details</FormLabel>

                <FormField
                    control={control}
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
                        control={control}
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
                        control={control}
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
                        control={control}
                        name={getFieldName("senderMessage")}
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
                    control={control}
                    name={getFieldName("deliverySpeed")}
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
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-[#87CEEB]/70">
                                                <path d="M12 6v6l4 2"></path>
                                                <circle cx="12" cy="12" r="10"></circle>
                                            </svg>
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
                                        <GiftIcon className="w-6 h-6 text-[#F5E6B8] absolute top-7 right-12 z-10" />

                                        <div className="flex items-center gap-3 mb-3 relative z-10">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-[#F5E6B8]">
                                                <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
                                            </svg>
                                            <div className={`text-xl text-white ${lora.className}`}>Express ⚡</div>
                                        </div>
                                        <div className="text-sm text-white/90 relative z-10">Within 1 hour</div>
                                        <div className="mt-2 text-lg text-[#F5E6B8] relative z-10">
                                            <span className="line-through opacity-60">+€10</span>
                                        </div>
                                    </div>
                                </div>
                            </FormControl>
                        </FormItem>
                    )}
                />

                {/* Promotional Message */}
                <div className="mt-6">
                    <div className="bg-gradient-to-r from-[#87CEEB]/20 to-[#87CEEB]/10 border-2 border-[#87CEEB]/40 rounded-xl p-3 md:p-4 flex items-center justify-center gap-3 md:gap-4 backdrop-blur-sm">
                        <GiftIcon className="w-6 h-6 md:w-7 md:h-7 text-[#87CEEB] flex-shrink-0" />
                        <div className="text-center">
                            <p className={`text-white text-sm md:text-base ${lora.className}`}>
                                <span className="text-[#F5E6B8] font-semibold">* Our Gift to You:</span> We're gifting <span className="text-[#87CEEB] font-semibold">Free Express Delivery</span> to all orders before Christmas 🎄
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Divider line between song forms */}
            <div className="py-8">
                <div className="h-px bg-gradient-to-r from-transparent via-[#87CEEB]/30 to-transparent"></div>
            </div>
        </div >
    );
}
