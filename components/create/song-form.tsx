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
    Zap,
    Coffee,
    Music,
    User,
    HeartHandshake,
    Laugh,
    Sunrise,
    Clock,
    Shield,
    Award,
    Gift
} from "lucide-react";

const lora = Lora({ subsets: ["latin"] });

const themes = [
    { value: "merry-christmas", label: "Merry Christmas", description: "Traditional, Festive and Joyful", icon: TreePine },
    { value: "happy-holidays", label: "Happy Holidays", description: "Fun, Happy, Playful", icon: Snowflake },
    { value: "mistletoe-kisses", label: "Mistletoe Kisses", description: "Flirty, Fun, Playful", icon: Heart },
    { value: "christmas-love", label: "Christmas Love", description: "Romantic, Devoted, Sincere", icon: Gift },
    { value: "missing-you", label: "Missing You This Christmas", description: "Emotional, Heartfelt, Longing", icon: HeartHandshake },
    { value: "christmas-wish", label: "A Christmas Wish", description: "Loving, Emotional, but Hopeful", icon: Star },
    { value: "happy-new-year", label: "Happy New Year", description: "Celebratory, Uplifting, Fun", icon: PartyPopper },
    { value: "new-years-wish", label: "New Year's Wish", description: "Emotional, Sentimental, Heartfelt", icon: Sparkles },
    { value: "thinking-of-you", label: "Thinking of You", description: "Versatile, Heartfelt, Year-round", icon: Sunrise },
];

const emotions = [
    { value: "love", label: "Love", description: "Platonic, Familial", icon: HeartHandshake },
    { value: "romantic-love", label: "Romantic Love", description: "Partner, Soulmate", icon: Heart },
    { value: "gratitude", label: "Gratitude", description: "Appreciation, Thankfulness", icon: Sparkles },
    { value: "joy", label: "Joy", description: "Celebration, Happiness", icon: Laugh },
    { value: "hope", label: "Hope", description: "Optimism, Future looking", icon: Sunrise },
    { value: "nostalgia", label: "Nostalgia", description: "Warm, Sentimental", icon: Clock },
    { value: "comfort", label: "Comfort", description: "Support, Warmth during tough times", icon: Shield },
    { value: "pride", label: "Pride", description: "Admiration, Respect", icon: Award },
];

const festiveLyricsLevels = [
    { value: "christmas-magic", label: "Christmas Magic", description: "Santa, Reindeer, Christmas Trees", icon: TreePine },
    { value: "lightly-festive", label: "Lightly Festive", description: "Snow, Sleighrides, Twinkling Lights", icon: Snowflake },
    { value: "winter-wonderland", label: "Winter Wonderland", description: "Winter, Snowfall, Cosy Fires", icon: Sparkles },
];

const festiveSoundLevels = [
    { value: "festive", label: "Festive", description: "Sleighbells, choir, orchestra", icon: TreePine },
    { value: "lightly-festive", label: "Lightly Festive", description: "Light bells, strings, acoustic piano", icon: Snowflake },
    { value: "non-festive", label: "Non Festive", description: "No Sleighbells, No Choir, No Orchestra", icon: Music },
];

const styles = [
    { value: "classic-timeless", label: "Classic & Timeless", description: "Traditional, rich, classic", icon: Music },
    { value: "soft-heartfelt", label: "Soft & Heartfelt", description: "Slow, intimate, gentle", icon: Heart },
    { value: "bright-uplifting", label: "Bright & Uplifting", description: "Fun, energetic, celebratory", icon: Zap },
    { value: "romantic-heartfelt", label: "Romantic & Heartfelt", description: "Deeply emotional, romantic, tender", icon: Heart },
    { value: "warm-cosy", label: "Warm & Cosy", description: "Comforting, homely, gentle", icon: Coffee },
    { value: "orchestral-festive", label: "Orchestral & Festive", description: "Majestic, elegant, celebratory", icon: Sparkles },
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
    namePrefix?: string;
}

export function SongForm({ index, title, onRemove, canRemove = false, namePrefix = "" }: SongFormProps) {
    const { control } = useFormContext();

    const getFieldName = (name: string) => namePrefix ? `${namePrefix}.${name}` : name;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Recipient Information Card */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border-2 border-[#87CEEB]/40 p-6 md:p-8 shadow-[0_8px_30px_rgba(135,206,235,0.3)]">
                <div className="flex items-center justify-between mb-6">
                    <FormLabel className={`block text-[#E8DCC0] text-xl md:text-2xl ${lora.className}`}>Who is Your Song For?</FormLabel>
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
                                <FormLabel className="block text-[#87CEEB] mb-2">Recipient's Name <span className="text-[#87CEEB]/60 text-sm">(First name will suffice)</span> <span className="text-[#87CEEB]">*</span></FormLabel>
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
                                <FormLabel className="block text-[#87CEEB] mb-2">Pronunciation <span className="text-[#87CEEB]/60 text-sm">(How is their name pronounced?)</span> <span className="text-[#87CEEB]">*</span></FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Peeter for Peter" className="w-full px-4 py-3 bg-[#0f1e30]/60 border-2 border-[#87CEEB]/40 text-white placeholder-white/50 italic rounded-lg focus:outline-none focus:border-[#F5E6B8] transition-all duration-200 backdrop-blur-sm" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="mt-4 md:mt-6">
                    <FormLabel className="block text-[#87CEEB] mb-2">What do you call them? Suggest a second option also where appropriate</FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <FormField
                            control={control}
                            name={getFieldName("recipientNickname")}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="block text-[#87CEEB]/70 text-sm mb-2">Name 1 <span className="text-[#87CEEB]">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Dad, Elizabeth, Pierre" className="w-full px-4 py-3 bg-[#0f1e30]/60 border-2 border-[#87CEEB]/40 text-white placeholder-white/50 italic rounded-lg focus:outline-none focus:border-[#F5E6B8] transition-all duration-200 backdrop-blur-sm" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name={getFieldName("recipientNickname2")}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="block text-[#87CEEB]/70 text-sm mb-2">Name 2</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Liz, Pierre Bear :-)" className="w-full px-4 py-3 bg-[#0f1e30]/60 border-2 border-[#87CEEB]/40 text-white placeholder-white/50 italic rounded-lg focus:outline-none focus:border-[#F5E6B8] transition-all duration-200 backdrop-blur-sm" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="mt-4 md:mt-6">
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
                            <FormLabel className={`text-xl md:text-2xl mb-2 block text-[#F5E6B8] ${lora.className}`}>Choose an Overall Theme for your Song? <span className="text-[#F5E6B8]">*</span></FormLabel>
                            <p className="text-[#87CEEB]/80 text-sm mb-4">If it was a Christmas card what would be written on the front?</p>
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

            {/* Style Modifiers Card */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border-2 border-[#87CEEB]/40 p-6 md:p-8 shadow-[0_8px_30px_rgba(135,206,235,0.3)]">
                <FormLabel className={`block text-[#F5E6B8] mb-2 text-xl md:text-2xl ${lora.className}`}>Style Modifiers (Important but Optional)</FormLabel>
                <p className="text-[#87CEEB]/80 text-sm mb-6">Customise your chosen theme above:</p>

                <div className="space-y-4">
                    <FormField
                        control={control}
                        name={getFieldName("childFriendly")}
                        render={({ field }) => (
                            <FormItem>
                                <div
                                    onClick={() => field.onChange(!field.value)}
                                    className="p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer flex items-center justify-between border-[#87CEEB]/30 bg-white/5 hover:border-[#87CEEB] hover:bg-white/10"
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <span className="text-2xl w-7 h-7 flex items-center justify-center flex-shrink-0">☃️</span>
                                        <span className="text-[#F5E6B8]">Child-Friendly:</span>
                                        <span className="text-sm text-[#87CEEB]/80">Include playful, age-appropriate elements (Santa, magic, wonder)</span>
                                    </div>
                                    <FormControl>
                                        <input
                                            type="checkbox"
                                            checked={field.value || false}
                                            onChange={(e) => field.onChange(e.target.checked)}
                                            className="w-3.5 h-3.5 rounded border-2 border-[#87CEEB] focus:ring-2 focus:ring-[#87CEEB]/50 cursor-pointer flex-shrink-0 ml-2 accent-[#87CEEB]"
                                        />
                                    </FormControl>
                                </div>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name={getFieldName("faithBased")}
                        render={({ field }) => (
                            <FormItem>
                                <div
                                    onClick={() => field.onChange(!field.value)}
                                    className="p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer flex items-center justify-between border-[#87CEEB]/30 bg-white/5 hover:border-[#87CEEB] hover:bg-white/10"
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#F5E6B8]">
                                                <path d="M12 2l1 2 2 .3-1.5 1.5.3 2-1.8-1-1.8 1 .3-2L9 4.3l2-.3z" fill="currentColor"></path>
                                                <rect x="6" y="15" width="12" height="7"></rect>
                                                <path d="M5 15l7-4 7 4"></path>
                                            </svg>
                                        </div>
                                        <span className="text-[#F5E6B8]">Faith-Based:</span>
                                        <span className="text-sm text-[#87CEEB]/80">Centre the song around Christian faith and the sacred story of Christmas</span>
                                    </div>
                                    <FormControl>
                                        <input
                                            type="checkbox"
                                            checked={field.value || false}
                                            onChange={(e) => field.onChange(e.target.checked)}
                                            className="w-3.5 h-3.5 rounded border-2 border-[#87CEEB] focus:ring-2 focus:ring-[#87CEEB]/50 cursor-pointer flex-shrink-0 ml-2 accent-[#87CEEB]"
                                        />
                                    </FormControl>
                                </div>
                            </FormItem>
                        )}
                    />
                </div>
            </div>

            {/* Short Phrase Card */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border-2 border-[#87CEEB]/40 p-6 md:p-8 shadow-[0_8px_30px_rgba(135,206,235,0.3)]
                ">
                <FormField
                    control={control}
                    name={getFieldName("shortPhrase")}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="block text-[#87CEEB] mb-2">Add a short phrase to convey your overall message?</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="e.g. Missing you this Christmas, You're so special, Distance can't diminish our love"
                                    className="w-full px-4 py-3 bg-[#0f1e30]/60 border-2 border-[#87CEEB]/40 text-white placeholder-white/50 italic rounded-lg focus:outline-none focus:border-[#F5E6B8] transition-all duration-200 backdrop-blur-sm"
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
            </div>

            {/* About Them Card with Emotions */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border-2 border-[#87CEEB]/40 p-6 md:p-8 shadow-[0_8px_30px_rgba(135,206,235,0.3)] space-y-6">
                <div>
                    <h2 className={`block text-[#F5E6B8] mb-2 text-lg md:text-2xl ${lora.className}`}>About Them</h2>
                    <p className="text-[#87CEEB]/80 text-sm mb-6">Fill in any fields below you feel will make this song more meaningful?</p>
                </div>

                {/* Emotions Selector */}
                <FormField
                    control={control}
                    name={getFieldName("emotions")}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="block text-[#87CEEB] mb-4">What overall emotions do you want the lyrics to convey? <span className="text-[#87CEEB]">*</span></FormLabel>
                            <FormControl>
                                <div className="space-y-3">
                                    {/* First row: Love and Romantic Love (larger buttons) */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {emotions.slice(0, 2).map((emotion) => {
                                            const IconComponent = emotion.icon;
                                            return (
                                                <div
                                                    key={emotion.value}
                                                    onClick={() => field.onChange(emotion.value)}
                                                    className={`flex flex-col items-start p-4 rounded-lg border-2 transition-all duration-200 transform text-left cursor-pointer ${field.value === emotion.value
                                                        ? 'border-[#87CEEB] bg-[#87CEEB]/20 scale-102'
                                                        : 'border-[#87CEEB]/30 bg-white/5 hover:border-[#87CEEB]/50 hover:bg-white/10 hover:scale-102'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <IconComponent className="w-5 h-5 text-[#F5E6B8]" />
                                                        <div className="text-[#F5E6B8]">{emotion.label}</div>
                                                    </div>
                                                    <div className="text-xs text-[#87CEEB]/70">{emotion.description}</div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Second section: Other emotions (smaller grid) */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {emotions.slice(2).map((emotion) => {
                                            const IconComponent = emotion.icon;
                                            return (
                                                <div
                                                    key={emotion.value}
                                                    onClick={() => field.onChange(emotion.value)}
                                                    className={`flex flex-col items-start p-4 rounded-lg border-2 transition-all duration-200 transform text-left cursor-pointer ${field.value === emotion.value
                                                        ? 'border-[#87CEEB] bg-[#87CEEB]/20 scale-102'
                                                        : 'border-[#87CEEB]/30 bg-white/5 hover:border-[#87CEEB]/50 hover:bg-white/10 hover:scale-102'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <IconComponent className="w-5 h-5 text-[#F5E6B8]" />
                                                        <div className="text-[#F5E6B8]">{emotion.label}</div>
                                                    </div>
                                                    <div className="text-xs text-[#87CEEB]/70">{emotion.description}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name={getFieldName("overallMessage")}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="block text-[#87CEEB] mb-2">Who are they to you? <span className="text-[#87CEEB]">*</span></FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="e.g. My BFF, Love of my life, Favourite sister"
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
                            <FormLabel className="block text-[#87CEEB] mb-2">Your Story - briefly summarise: <span className="text-[#87CEEB]">*</span></FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="e.g. Besties since pre-school, Husband of 9 years"
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
                            <FormLabel className="block text-[#87CEEB] mb-2">List 1-3 qualities you admire in them? <span className="text-[#87CEEB]">*</span></FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="e.g. Gorgeous, Loyal, Funny"
                                    className="w-full px-4 py-3 bg-[#0f1e30]/60 border-2 border-[#87CEEB]/40 text-white placeholder-white/50 italic rounded-lg focus:outline-none focus:border-[#F5E6B8] transition-all duration-200 backdrop-blur-sm"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name={getFieldName("characteristics")}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="block text-[#87CEEB] mb-2">List some defining yet loveable characteristics:</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="e.g. Always late, Loves singing, Crazy curly hair"
                                    className="w-full px-4 py-3 bg-[#0f1e30]/60 border-2 border-[#87CEEB]/40 text-white placeholder-white/50 italic rounded-lg focus:outline-none focus:border-[#F5E6B8] transition-all duration-200 backdrop-blur-sm"
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name={getFieldName("gratefulFor")}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="block text-[#87CEEB] mb-2">What are 1-2 things you're grateful to them for?</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="e.g. Driving me everywhere, Always calling to check I got home"
                                    className="w-full px-4 py-3 bg-[#0f1e30]/60 border-2 border-[#87CEEB]/40 text-white placeholder-white/50 italic rounded-lg focus:outline-none focus:border-[#F5E6B8] transition-all duration-200 backdrop-blur-sm"
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name={getFieldName("activitiesTogether")}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="block text-[#87CEEB] mb-2">What are moments you share regularly?</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="e.g. Movie nights by the fire, Coffee chats on Saturdays"
                                    className="w-full px-4 py-3 bg-[#0f1e30]/60 border-2 border-[#87CEEB]/40 text-white placeholder-white/50 italic rounded-lg focus:outline-none focus:border-[#F5E6B8] transition-all duration-200 backdrop-blur-sm"
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name={getFieldName("favoriteMemory")}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="block text-[#87CEEB] mb-2">What is one shared memory that makes you smile?</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="e.g. The time we got lost in Paris, When you lost your shoe at Coldplay"
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
                            <FormLabel className="block text-[#87CEEB] mb-2">Details - location names or other keywords you'd like mentioned:</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="e.g. Paris, Fav coffee shop etc."
                                    className="w-full px-4 py-3 bg-[#0f1e30]/60 border-2 border-[#87CEEB]/40 text-white placeholder-white/50 italic rounded-lg focus:outline-none focus:border-[#F5E6B8] transition-all duration-200 backdrop-blur-sm"
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
            </div>

            {/* Festive Lyrics Level Card */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border-2 border-[#87CEEB]/40 p-6 md:p-8 shadow-[0_8px_30px_rgba(135,206,235,0.3)] space-y-6">
                <FormField
                    control={control}
                    name={getFieldName("festiveLyricsLevel")}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="block text-[#87CEEB] mb-2">How Festive do You Want the <span className="italic">Lyrics</span> to be? <span className="text-[#87CEEB]">*</span></FormLabel>
                            <FormControl>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {festiveLyricsLevels.map((level) => {
                                        const IconComponent = level.icon;
                                        return (
                                            <div
                                                key={level.value}
                                                onClick={() => field.onChange(level.value)}
                                                className={`flex flex-col items-start p-4 rounded-lg border-2 transition-all duration-200 transform text-left cursor-pointer ${field.value === level.value
                                                    ? 'border-[#87CEEB] bg-[#87CEEB]/20 scale-102'
                                                    : 'border-[#87CEEB]/30 bg-white/5 hover:border-[#87CEEB]/50 hover:bg-white/10 hover:scale-102'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <IconComponent className="w-5 h-5 text-[#F5E6B8]" />
                                                    <div className="text-[#F5E6B8]">{level.label}</div>
                                                </div>
                                                <div className="text-xs text-[#87CEEB]/70 ml-7">{level.description}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </FormControl>
                            <FormMessage />
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

                <div>
                    <FormField
                        control={control}
                        name={getFieldName("festiveSoundLevel")}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="block text-[#87CEEB] mb-2">How festive do you want this song to <em>sound</em>? <span className="text-[#87CEEB]">*</span></FormLabel>
                                <FormControl>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {festiveSoundLevels.map((level) => {
                                            const IconComponent = level.icon;
                                            return (
                                                <div
                                                    key={level.value}
                                                    onClick={() => field.onChange(level.value)}
                                                    className={`flex flex-col items-start p-4 rounded-lg border-2 transition-all duration-200 transform text-left cursor-pointer ${field.value === level.value
                                                        ? 'border-[#87CEEB] bg-[#87CEEB]/20 scale-102'
                                                        : 'border-[#87CEEB]/30 bg-white/5 hover:border-[#87CEEB]/50 hover:bg-white/10 hover:scale-102'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <IconComponent className="w-5 h-5 text-[#F5E6B8]" />
                                                        <div className="text-[#F5E6B8]">{level.label}</div>
                                                    </div>
                                                    <div className="text-xs text-[#87CEEB]/70 ml-7">{level.description}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </FormControl>
                                <FormMessage />
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
