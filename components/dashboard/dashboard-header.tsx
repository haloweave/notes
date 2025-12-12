'use client';

import { useSession } from '@/lib/auth-client';
import { Coins01Icon } from 'hugeicons-react';

interface DashboardHeaderProps {
    title: string;
    description?: string;
    children?: React.ReactNode;
}

export function DashboardHeader({ title, description, children }: DashboardHeaderProps) {
    const { data: session } = useSession();
    const credits = (session?.user as any)?.credits ?? 0;

    return (
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-gray-200 gap-4 md:gap-0">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                {description && <p className="text-gray-500 mt-1">{description}</p>}
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-full text-sm text-emerald-600 font-medium whitespace-nowrap shadow-sm">
                    <Coins01Icon className="h-4 w-4" />
                    <span>{credits} Credits</span>
                </div>
                {children}
            </div>
        </header>
    );
}
