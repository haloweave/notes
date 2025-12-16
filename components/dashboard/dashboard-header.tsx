'use client';

import { useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { Coins01Icon } from 'hugeicons-react';
import { PricingDialog } from './pricing-dialog';

interface DashboardHeaderProps {
    title: string;
    description?: string;
    children?: React.ReactNode;
}

export function DashboardHeader({ title, description, children }: DashboardHeaderProps) {
    const { data: session } = useSession();
    const credits = (session?.user as any)?.credits ?? 0;
    const [isPricingOpen, setIsPricingOpen] = useState(false);

    return (
        <>
            <header className="flex flex-col gap-3 md:gap-4 pb-4 md:pb-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4">
                    <div className="flex-1">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h1>
                        {description && <p className="text-sm sm:text-base text-gray-500 mt-1">{description}</p>}
                    </div>
                    <button
                        onClick={() => setIsPricingOpen(true)}
                        className="flex items-center gap-2 md:gap-3 bg-white border border-gray-200 px-3 py-1.5 rounded-full text-xs sm:text-sm text-emerald-600 font-medium whitespace-nowrap shadow-sm hover:shadow-md hover:border-emerald-300 hover:bg-emerald-50 transition-all cursor-pointer"
                    >
                        <Coins01Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span>
                            {credits === 0 ? 'No songs available' : credits === 1 ? '1 song available' : `${credits} songs available`}
                        </span>
                    </button>
                </div>
                {children && (
                    <div className="flex items-center gap-2 md:gap-4 w-full sm:w-auto">
                        {children}
                    </div>
                )}
            </header>

            <PricingDialog open={isPricingOpen} onOpenChange={setIsPricingOpen} />
        </>
    );
}
