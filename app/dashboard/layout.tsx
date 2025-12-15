'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { PricingDialog } from '@/components/dashboard/pricing-dialog';
import { SparklesIcon } from 'hugeicons-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [credits, setCredits] = useState<number | null>(null);
    const [showPricingDialog, setShowPricingDialog] = useState(false);

    useEffect(() => {
        const fetchCredits = async () => {
            try {
                const res = await fetch('/api/credits');
                if (res.ok) {
                    const data = await res.json();
                    setCredits(data.credits);

                    // Auto-open pricing dialog only once when credits = 0
                    if (data.credits === 0) {
                        const hasShownPricingDialog = localStorage.getItem('hasShownPricingDialog');
                        if (!hasShownPricingDialog) {
                            setShowPricingDialog(true);
                            localStorage.setItem('hasShownPricingDialog', 'true');
                        }
                    }
                }
            } catch (e) {
                console.error("Failed to fetch credits", e);
            }
        };
        fetchCredits();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />
            <main className="flex-1 overflow-hidden w-full">
                <div className="h-full overflow-y-auto">
                    {/* Purchase Ribbon - Show only when no credits left */}
                    {credits === 0 && (
                        <div className="sticky top-4 z-50 w-full px-4 sm:px-6 md:px-8 lg:px-10">
                            <button
                                onClick={() => setShowPricingDialog(true)}
                                className="w-full py-3 md:py-4 px-4 transition-all hover:scale-[1.02] shadow-lg hover:shadow-xl rounded-2xl"
                                style={{
                                    background: 'linear-gradient(135deg, #fae8b4 0%, #f5d98f 50%, #f0ca6a 100%)',
                                    border: '2px solid #f5d98f',
                                    backdropFilter: 'blur(10px)'
                                }}
                            >
                                <div className="flex items-center justify-center gap-2 md:gap-3">
                                    <SparklesIcon className="h-5 w-5 md:h-6 md:w-6 animate-pulse" style={{ color: '#2A374F' }} />
                                    <span className="font-bold text-sm md:text-base" style={{ color: '#2A374F' }}>
                                        🎄 Get Started! Purchase songs to create your magical Christmas gifts
                                    </span>
                                    <SparklesIcon className="h-5 w-5 md:h-6 md:w-6 animate-pulse" style={{ color: '#2A374F' }} />
                                </div>
                            </button>
                        </div>
                    )}

                    <div className="p-4 sm:p-6 md:p-8 lg:p-10 pt-16 md:pt-6">
                        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
                            {children}
                        </div>
                    </div>
                </div>
            </main>

            {/* Pricing Dialog */}
            <PricingDialog
                open={showPricingDialog}
                onOpenChange={setShowPricingDialog}
            />
        </div>
    );
}
