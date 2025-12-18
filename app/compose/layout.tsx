'use client';

import { Lora } from 'next/font/google';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft01Icon } from 'hugeicons-react';
import { HistoryMenu } from '@/components/compose/history-menu';
import { LoginDialogProvider } from '@/contexts/login-dialog-context';

const lora = Lora({ subsets: ['latin'] });

export default function ComposeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();

    // Smart back navigation based on current page
    const handleBack = () => {
        if (pathname.includes('/compose/variations')) {
            router.push('/compose/create');
        } else if (pathname.includes('/compose/create')) {
            router.push('/compose/select-package');
        } else if (pathname.includes('/compose/select-package')) {
            router.push('/');
        } else {
            router.back();
        }
    };

    // Hide back button on Success page
    const showBackButton = !pathname.includes('/compose/success');

    return (
        <LoginDialogProvider>
            <div className="relative min-h-screen w-full flex flex-col font-sans" style={{ backgroundColor: '#1a3d5f' }}>
                {/* Background Image Layer - Fixed */}
                <Image
                    src="/web background image.png"
                    alt="Background"
                    fill
                    className="object-cover opacity-40 z-0"
                    priority
                    quality={100}
                />

                {/* Dark Overlay */}
                <div className="fixed inset-0 z-[1] bg-black/30 pointer-events-none" />

                <div className="relative z-10 w-full flex-grow flex flex-col">
                    {/* Global Header */}
                    <div className="container mx-auto max-w-7xl p-4 md:p-8 flex flex-col items-center">

                        {/* Header Controls */}
                        <div className="w-full flex justify-between items-start relative mb-4 md:mb-8">
                            {showBackButton && (
                                <button
                                    onClick={handleBack}
                                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all hover:bg-white/20 h-9 px-4 py-2 text-white z-20"
                                >
                                    <ArrowLeft01Icon className="w-4 h-4 mr-2" />
                                    Back
                                </button>
                            )}

                            {/* Centered Logo */}
                            <div className="absolute left-1/2 top-0 transform -translate-x-1/2 w-full flex justify-center pointer-events-none">
                                <Image
                                    src="/huggnote bespoke logo.png"
                                    alt="Huggnote Bespoke Songs"
                                    width={200}
                                    height={80}
                                    className="h-16 md:h-24 w-auto drop-shadow-lg"
                                    priority
                                />
                            </div>

                            {/* History Menu - Top Right */}
                            <div className="z-20">
                                <HistoryMenu />
                            </div>
                        </div>

                        {/* Page Content */}
                        <div className="w-full">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </LoginDialogProvider>
    );
}
