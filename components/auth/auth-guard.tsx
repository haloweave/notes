'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useLoginDialog } from '@/contexts/login-dialog-context';

interface AuthGuardProps {
    children: React.ReactNode;
}

// Routes that don't require authentication
const PUBLIC_ROUTES = [
    '/compose/variations', // Allow users to preview songs without login
    '/compose/select-package',
    '/compose/create',
];

export function AuthGuard({ children }: AuthGuardProps) {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const { openDialog } = useLoginDialog();
    const [isChecking, setIsChecking] = useState(true);

    // Check if current route is public
    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

    useEffect(() => {
        if (!isPending) {
            // If it's a public route, allow access without authentication
            if (isPublicRoute) {
                setIsChecking(false);
                return;
            }

            // For protected routes, check authentication
            if (!session) {
                // User is not authenticated, show the login dialog
                openDialog();
                setIsChecking(false);
            } else {
                // User is authenticated, allow access
                setIsChecking(false);
            }
        }
    }, [session, isPending, openDialog, isPublicRoute]);

    // Show loading state while checking authentication
    if (isPending || isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#87CEEB] mx-auto"></div>
                    <p className="text-[#E8DCC0] text-lg">Checking authentication...</p>
                </div>
            </div>
        );
    }

    // If it's a public route, render children regardless of auth status
    if (isPublicRoute) {
        return <>{children}</>;
    }

    // If user is not authenticated on a protected route, show placeholder
    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4 max-w-md mx-auto px-4">
                    <h2 className="text-[#E8DCC0] text-2xl font-semibold">
                        Sign in required
                    </h2>
                    <p className="text-white/80 text-lg">
                        Please sign in to access the Bespoke Songs composer
                    </p>
                </div>
            </div>
        );
    }

    // User is authenticated, render children
    return <>{children}</>;
}
