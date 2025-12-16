'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MusicNote01Icon, CheckmarkCircle01Icon as CheckCircleIcon, Loading01Icon } from 'hugeicons-react';
import { useRouter } from 'next/navigation';
import { Playfair_Display } from 'next/font/google';

const playfair = Playfair_Display({ subsets: ['latin'] });

export function PricingTable() {
    const router = useRouter();
    const [isPurchasing, setIsPurchasing] = useState<string | null>(null);

    const handlePurchase = async (amount: number, packageId: string) => {
        setIsPurchasing(packageId);
        try {
            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ packageId })
            });
            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error("Purchase failed:", data.error);
            }
        } catch (error) {
            console.error("Error initiating checkout:", error);
        } finally {
            setIsPurchasing(null);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            {/* Solo Serenade */}
            <Card className="border-0 shadow-xl transition-all cursor-pointer relative overflow-visible text-left bg-white flex flex-col">
                {/* Decorative circles */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-2">
                    <div className="w-12 h-12 rounded-full" style={{ background: 'linear-gradient(to bottom right, #fae8b4, #f5d98f)' }}></div>
                    <div className="w-8 h-8 rounded-full" style={{ background: 'linear-gradient(to bottom right, #fff5d6, #fae8b4)' }}></div>
                    <div className="w-12 h-12 rounded-full" style={{ background: 'linear-gradient(to bottom right, #fae8b4, #f5d98f)' }}></div>
                </div>

                <CardHeader className="text-center pt-12">
                    {/* Music Icon */}
                    <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'linear-gradient(to bottom right, #2F5A8E, #86CCEA)' }}>
                        <MusicNote01Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-700">
                        Solo Serenade
                    </CardTitle>
                    <CardDescription className="italic text-slate-600">Perfect for one special person</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                    <div className="text-5xl font-bold text-slate-700 text-center">€37</div>
                    <ul className="space-y-2.5 text-sm text-slate-600 flex-1">
                        <li className="flex items-start gap-2">
                            <CheckCircleIcon className="h-5 w-5 shrink-0 mt-0.5" style={{ color: '#2F5A8E' }} />
                            <span>1 custom personalised song</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircleIcon className="h-5 w-5 shrink-0 mt-0.5" style={{ color: '#2F5A8E' }} />
                            <span>3 versions to choose from</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircleIcon className="h-5 w-5 shrink-0 mt-0.5" style={{ color: '#2F5A8E' }} />
                            <span>Beautifully presented as a snowy Christmas scene</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircleIcon className="h-5 w-5 shrink-0 mt-0.5" style={{ color: '#2F5A8E' }} />
                            <span>Email or WhatsApp delivery</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircleIcon className="h-5 w-5 shrink-0 mt-0.5" style={{ color: '#2F5A8E' }} />
                            <span>Yours to keep forever - downloadable MP3 file</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircleIcon className="h-5 w-5 shrink-0 mt-0.5" style={{ color: '#2F5A8E' }} />
                            <span>Add a gift card: 30,000 brands</span>
                        </li>
                    </ul>
                </CardContent>
                <CardFooter className="pb-6">
                    <button
                        className={`w-full font-bold py-6 rounded-xl shadow-lg hover:scale-105 transition-all border-2 text-white md:text-[#E8DCC0] lg:text-[#E8DCC0] text-3xl md:text-3xl lg:text-4xl ${playfair.className}`}
                        style={{
                            background: '#fae8b4',
                            borderColor: '#fae8b4'
                        }}
                        onClick={() => handlePurchase(1, 'solo-serenade')}
                        disabled={!!isPurchasing}
                    >
                        {isPurchasing === 'solo-serenade' ? (
                            <Loading01Icon className="h-5 w-5 animate-spin inline" />
                        ) : 'Select Solo Serenade'}
                    </button>
                </CardFooter>
            </Card>

            {/* Holiday Hamper */}
            <Card className="border-0 shadow-xl transition-all cursor-pointer relative overflow-visible text-left bg-white flex flex-col">
                {/* Decorative circles */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-2">
                    <div className="w-12 h-12 rounded-full" style={{ background: 'linear-gradient(to bottom right, #fae8b4, #f5d98f)' }}></div>
                    <div className="w-8 h-8 rounded-full" style={{ background: 'linear-gradient(to bottom right, #fff5d6, #fae8b4)' }}></div>
                    <div className="w-12 h-12 rounded-full" style={{ background: 'linear-gradient(to bottom right, #fae8b4, #f5d98f)' }}></div>
                </div>

                {/* Best Value Badge */}
                <div className="absolute top-4 right-4 px-4 py-1.5 text-xs font-bold rounded-full flex items-center gap-1.5 shadow-md border-2" style={{
                    background: '#fae8b4',
                    color: '#2A374F',
                    borderColor: '#f5d98f'
                }}>
                    <span style={{ color: '#d4a574' }}>✨</span>
                    Best Value
                </div>

                <CardHeader className="text-center pt-12">
                    {/* Music Icon */}
                    <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'linear-gradient(to bottom right, #fae8b4, #f5d98f)' }}>
                        <MusicNote01Icon className="h-8 w-8" style={{ color: '#2A374F' }} />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-700">
                        Holiday Hamper
                    </CardTitle>
                    <CardDescription className="italic text-slate-600">Save with family/friends bundle</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                    <div className="text-5xl font-bold text-slate-700 text-center">€87</div>
                    <div className="text-center">
                        <span className="text-sm font-semibold" style={{ color: '#2F5A8E' }}>
                            Save €98 (53% off!)
                        </span>
                    </div>
                    <ul className="space-y-2.5 text-sm text-slate-600 flex-1">
                        <li className="flex items-start gap-2">
                            <CheckCircleIcon className="h-5 w-5 shrink-0 mt-0.5" style={{ color: '#d4a574' }} />
                            <span>Up to 5 custom personalised songs</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircleIcon className="h-5 w-5 shrink-0 mt-0.5" style={{ color: '#d4a574' }} />
                            <span>3 versions per song to choose from</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircleIcon className="h-5 w-5 shrink-0 mt-0.5" style={{ color: '#d4a574' }} />
                            <span>Email or WhatsApp delivery</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircleIcon className="h-5 w-5 shrink-0 mt-0.5" style={{ color: '#d4a574' }} />
                            <span>Yours to keep forever - downloadable MP3 files</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircleIcon className="h-5 w-5 shrink-0 mt-0.5" style={{ color: '#d4a574' }} />
                            <span>Add a gift card: 30,000 brands</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircleIcon className="h-5 w-5 shrink-0 mt-0.5" style={{ color: '#d4a574' }} />
                            <span>Big saving due to bulk buy discount</span>
                        </li>
                    </ul>
                </CardContent>
                <CardFooter className="pb-6">
                    <button
                        className={`w-full font-bold py-6 rounded-xl shadow-lg hover:opacity-90 transition-all text-white md:text-[#E8DCC0] lg:text-[#E8DCC0] text-3xl md:text-3xl lg:text-4xl ${playfair.className}`}
                        style={{ background: 'linear-gradient(to right, #2F5A8E, #86CCEA)' }}
                        onClick={() => handlePurchase(5, 'holiday-hamper')}
                        disabled={!!isPurchasing}
                    >
                        {isPurchasing === 'holiday-hamper' ? (
                            <Loading01Icon className="h-5 w-5 animate-spin inline" />
                        ) : 'Select Holiday Hamper'}
                    </button>
                </CardFooter>
            </Card>
        </div>
    );
}
