"use client";

import { Lora } from "next/font/google";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useFormContext } from "react-hook-form";
import {
    TreePine,
    Snowflake,
    Heart,
    Star,
    PartyPopper,
    Sparkles,
    Trash2,
    Disc,
    Zap,
    Coffee,
    MicVocal,
    Music,
    User
} from "lucide-react";

const lora = Lora({ subsets: ["latin"] });

const themes = [
    { value: "merry-christmas", label: "Merry Christmas", description: "Traditional, Festive and Joyful", icon: TreePine },
    { value: "happy-holidays", label: "Happy Holidays", description: "Fun, Happy, Playful", icon: Snowflake },
    { value: "mistletoe-kisses", label: "Mistletoe Kisses", description: "Romantic or Flirty", icon: Heart },
    { value: "christmas-wish", label: "A Christmas Wish", description: "Loving, Emotional, but Hopeful", icon: Star },
    { value: "happy-new-year", label: "Happy New Year", description: "Celebratory, Hopeful, Fun", icon: PartyPopper },
    { value: "new-years-wish", label: "New Year's Wish", description: "Emotional, Sentimental, Heartfelt", icon: Sparkles },
];

const styles = [
    { value: "vintage-ballad", label: "Vintage / Smooth Ballad", description: "Cozy, warm, nostalgic", icon: Disc },
    { value: "gentle-ballad", label: "Gentle / Emotional Ballad", description: "Soft, heartfelt, reflective", icon: Heart },
    { value: "uptempo-retro", label: "Up-Tempo Retro", description: "Fun, lively, upbeat", icon: Zap },
    { value: "warm-jazz", label: "Warm / Intimate Jazz", description: "Smooth, cozy, intimate", icon: Coffee },
    { value: "contemporary-pop", label: "Contemporary Pop", description: "Modern, catchy, polished", icon: MicVocal },
    { value: "swing-influenced", label: "Swing-Influenced", description: "Playful, festive, swinging", icon: Music },
];

const vibes = [
    { value: "loving", label: "Loving", description: "All the Feels", icon: Heart },
    { value: "friendly-fun", label: "Friendly/Fun", description: "Lighthearted & Upbeat", icon: PartyPopper },
    { value: "formal", label: "Formal", description: "Best for Acquaintances/Colleagues", icon: User },
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
                            <Trash2 className="w-4 h-4" />
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
                                        {styles.map((style) => {
                                            const IconComponent = style.icon;
                                            return (
                                                <div
                                                    key={style.value}
                                                    onClick={() => field.onChange(style.value)}
                                                    className={`flex flex-col items-start p-4 rounded-lg border-2 transition-all duration-200 transform text-left cursor-pointer ${field.value === style.value
                                                        ? 'border-[#87CEEB] bg-[#87CEEB]/20 scale-102'
                                                        : 'border-[#87CEEB]/30 bg-white/5 hover:border-[#87CEEB]/50 hover:bg-white/10 hover:scale-102'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <IconComponent className="w-5 h-5 text-[#F5E6B8]" />
                                                        <div className="text-[#F5E6B8]">{style.label}</div>
                                                    </div>
                                                    <div className="text-xs text-[#87CEEB]/70 ml-7">{style.description}</div>
                                                </div>
                                            );
                                        })}
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
                                    {vibes.map((vibe) => {
                                        const IconComponent = vibe.icon;
                                        return (
                                            <button
                                                key={vibe.value}
                                                type="button"
                                                onClick={() => field.onChange(vibe.value)}
                                                className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-200 transform cursor-pointer ${field.value === vibe.value
                                                    ? 'border-[#87CEEB] bg-[#87CEEB]/20 shadow-[0_0_30px_rgba(135,206,235,0.8)] scale-105'
                                                    : 'border-[#87CEEB]/30 bg-white/5 hover:border-[#87CEEB] hover:bg-white/10 hover:scale-102'
                                                    }`}
                                            >
                                                <IconComponent className="w-8 h-8 mb-3 text-[#87CEEB]/70" />
                                                <div className="text-center mb-2 text-[#F5E6B8] font-medium">{vibe.label}</div>
                                                <div className="text-xs text-[#87CEEB]/70">{vibe.description}</div>
                                            </button>
                                        )
                                    })}
                                </div>
                            </FormControl>
                            <FormMessage className="text-red-400 text-sm font-medium mt-4" />
                        </FormItem>
                    )}
                />
            </div>

            {/* Divider line between song forms */}
            <div className="py-8">
                <div className="h-px bg-gradient-to-r from-transparent via-[#87CEEB]/30 to-transparent"></div>
            </div>
        </div >
    );
}
