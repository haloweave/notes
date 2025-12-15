'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Coins01Icon, CheckmarkCircle01Icon as CheckCircleIcon, Loading01Icon } from 'hugeicons-react';

interface PricingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PricingDialog({ open, onOpenChange }: PricingDialogProps) {
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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Get More Songs</DialogTitle>
                    <DialogDescription>
                        Choose a package to create more personalized songs
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    {/* Solo Serenade */}
                    <Card className="border-2 hover:border-purple-500 transition-all cursor-pointer relative overflow-hidden text-left">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">
                                Solo Serenade
                            </CardTitle>
                            <CardDescription>Perfect for one special person</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-4xl font-bold text-gray-900">€37</div>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-center gap-2">
                                    <CheckCircleIcon className="h-4 w-4 text-purple-500" />
                                    1 custom personalised song
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircleIcon className="h-4 w-4 text-purple-500" />
                                    3 versions to choose from
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircleIcon className="h-4 w-4 text-purple-500" />
                                    Beautifully presented as a snowy Christmas scene
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircleIcon className="h-4 w-4 text-purple-500" />
                                    Email or WhatsApp delivery
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircleIcon className="h-4 w-4 text-purple-500" />
                                    Yours to keep forever - downloadable MP3 file
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircleIcon className="h-4 w-4 text-purple-500" />
                                    Add a gift card: 30,000 brands
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full bg-purple-600 hover:bg-purple-700"
                                onClick={() => handlePurchase(1, 'solo-serenade')}
                                disabled={!!isPurchasing}
                            >
                                {isPurchasing === 'solo-serenade' ? (
                                    <Loading01Icon className="h-4 w-4 animate-spin" />
                                ) : 'Select Solo Serenade'}
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Holiday Hamper */}
                    <Card className="border-2 hover:border-emerald-500 transition-all cursor-pointer relative overflow-hidden text-left bg-emerald-50">
                        <div className="absolute top-0 right-0 bg-emerald-600 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                            BEST VALUE
                        </div>
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">
                                Holiday Hamper
                            </CardTitle>
                            <CardDescription>Save with family/friends bundle</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-end gap-2">
                                <div className="text-4xl font-bold text-gray-900">€87</div>
                            </div>
                            <div className="text-sm font-semibold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-md inline-block">
                                Save €98 (53% off!)
                            </div>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-center gap-2">
                                    <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                                    Up to 5 custom personalised songs
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                                    3 versions per song to choose from
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                                    Email or WhatsApp delivery
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                                    Yours to keep forever - downloadable MP3 files
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                                    Add a gift card: 30,000 brands
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                                    Big saving due to bulk buy discount
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => handlePurchase(5, 'holiday-hamper')}
                                disabled={!!isPurchasing}
                            >
                                {isPurchasing === 'holiday-hamper' ? (
                                    <Loading01Icon className="h-4 w-4 animate-spin" />
                                ) : 'Select Holiday Hamper'}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
}
