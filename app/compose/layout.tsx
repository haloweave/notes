'use client';

import { Lora } from 'next/font/google';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, Menu } from 'lucide-react';
import { HistoryMenu } from '@/components/compose/history-menu';
import { LoginDialogProvider, useLoginDialog } from '@/contexts/login-dialog-context';
import { LoginDialog } from '@/components/auth/login-dialog';
import { AuthGuard } from '@/components/auth/auth-guard';


const lora = Lora({ subsets: ['latin'] });

function LayoutContent({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { isOpen: showLoginDialog, openDialog, closeDialog } = useLoginDialog();

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

    // Determine back button label
    const backLabel = pathname.includes('/compose/select-package') ? 'Back to Home' : 'Back';

    // Hide back button on Success page
    const showBackButton = !pathname.includes('/compose/success');

    return (
        <>
            <div className="min-h-screen relative font-sans">
                {/* Background Image & Gradient - Fixed Position */}
                <div className="fixed inset-0 w-full h-full -z-50">
                    <Image
                        src="/web background image.png"
                        alt="Background"
                        fill
                        className="object-cover"
                        priority
                        quality={90}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1a2a3f]/45 via-[#0f1e30]/40 to-[#1a2a3f]/45"></div>
                </div>

                {/* Snowfall Effect */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(30)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute animate-fall"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: '-10px',
                                animationDuration: `${8 + Math.random() * 7}s`,
                                animationDelay: `${Math.random() * 5}s`,
                                opacity: Math.random() * 0.5 + 0.2,
                                width: `${2 + Math.random() * 4}px`,
                                height: `${2 + Math.random() * 4}px`,
                                backgroundColor: 'white',
                                borderRadius: '50%',
                                boxShadow: '0 0 3px rgba(255, 255, 255, 0.8)'
                            }}
                        />
                    ))}
                </div>

                <style jsx global>{`
                    @keyframes fall {
                        0% { transform: translateY(0) rotate(0deg); opacity: 0.8; }
                        100% { transform: translateY(110vh) rotate(360deg); opacity: 0.3; }
                    }
                    .animate-fall { animation: fall linear infinite; }
                `}</style>

                <div className="relative z-10 container mx-auto max-w-7xl px-4 py-4 md:py-6">
                    {/* Header Section */}
                    {/* Mobile Header: Back (Left) & Menu (Right) */}
                    <div className="flex md:hidden justify-between items-start mb-8">
                        {showBackButton ? (
                            <button
                                onClick={handleBack}
                                className="p-3 rounded-lg bg-[#1a3d5f]/80 backdrop-blur-sm hover:bg-[#1a3d5f]/90 transition-all duration-200 shadow-lg"
                                aria-label="Back"
                            >
                                <ArrowLeft className="w-6 h-6 text-[#E0F4FF]" />
                            </button>
                        ) : <div />}

                        <div className="text-white">
                            <HistoryMenu />
                        </div>
                    </div>

                    {/* Desktop Header: Back (Absolute Left), Logo (Center), Menu (Absolute Right) */}
                    <div className="hidden md:flex justify-center items-start mb-1 relative">
                        {showBackButton && (
                            <button
                                onClick={handleBack}
                                className="absolute left-8 p-3 rounded-lg bg-[#1a3d5f]/80 backdrop-blur-sm hover:bg-[#1a3d5f]/90 transition-all duration-200 shadow-lg"
                                aria-label="Back"
                            >
                                <ArrowLeft className="w-7 h-7 text-[#E0F4FF]" />
                            </button>
                        )}

                        <img
                            src="/huggnote bespoke logo.png"
                            alt="Huggnote Bespoke Songs"
                            className="md:h-16 lg:h-20 w-auto"
                        />

                        <div className="absolute right-0 text-white">
                            <HistoryMenu />
                        </div>
                    </div>

                    {/* Mobile Logo (Below Header) */}
                    <div className="flex md:hidden justify-center mb-3">
                        <img
                            src="/huggnote bespoke logo.png"
                            alt="Huggnote Bespoke Songs"
                            className="h-20 w-auto"
                        />
                    </div>

                    {/* Page Content */}
                    <AuthGuard>
                        {children}
                    </AuthGuard>
                </div>
            </div>

            {/* Global Login Dialog */}
            <LoginDialog
                open={showLoginDialog}
                onOpenChange={(open) => open ? openDialog() : closeDialog()}
                onSuccess={() => {
                    console.log('[LAYOUT] User logged in successfully');
                }}
                title="Sign In"
                description="Sign in to save your songs and access them anytime from your dashboard."
            />
        </>
    );
}

export default function ComposeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <LoginDialogProvider>
            <LayoutContent>{children}</LayoutContent>
        </LoginDialogProvider>
    );
}
