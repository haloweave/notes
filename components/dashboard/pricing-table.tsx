'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins01Icon, CheckmarkCircle01Icon as CheckCircleIcon, Loading01Icon } from 'hugeicons-react';
import { useRouter } from 'next/navigation';

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2 hover:border-emerald-500 transition-all cursor-pointer relative overflow-hidden text-left">
                <div className="absolute top-0 right-0 bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-bold rounded-bl-lg">
                    POPULAR
                </div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <Coins01Icon className="h-6 w-6 text-emerald-600" />
                        1 Song Credit
                    </CardTitle>
                    <CardDescription>Perfect for a single special gift</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-3xl font-bold text-gray-900">$3.99</div>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                            <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                            1 Custom AI Song
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                            High Quality Audio Download
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                            Shareable Link
                        </li>
                    </ul>
                </CardContent>
                <CardFooter>
                    <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handlePurchase(1, 'single')}
                        disabled={!!isPurchasing}
                    >
                        {isPurchasing === 'single' ? (
                            <Loading01Icon className="h-4 w-4 animate-spin" />
                        ) : 'Purchase Now'}
                    </Button>
                </CardFooter>
            </Card>

            <Card className="border-2 hover:border-blue-500 transition-all cursor-pointer bg-blue-50 text-left">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <Coins01Icon className="h-6 w-6 text-blue-600" />
                        3 Song Bundle
                    </CardTitle>
                    <CardDescription>Best value for the holiday season</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-end gap-2">
                        <div className="text-3xl font-bold text-gray-900">$9.99</div>
                        <div className="text-sm text-gray-500 line-through mb-1">$11.97</div>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                            <CheckCircleIcon className="h-4 w-4 text-blue-500" />
                            3 Custom AI Songs
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircleIcon className="h-4 w-4 text-blue-500" />
                            Save 20%
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircleIcon className="h-4 w-4 text-blue-500" />
                            Priority Generation
                        </li>
                    </ul>
                </CardContent>
                <CardFooter>
                    <Button
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={() => handlePurchase(3, 'bundle')}
                        disabled={!!isPurchasing}
                    >
                        {isPurchasing === 'bundle' ? (
                            <Loading01Icon className="h-4 w-4 animate-spin" />
                        ) : 'Purchase Bundle'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
