'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AddCircleIcon, FolderMusicIcon, Invoice01Icon, Settings01Icon, UserIcon, Logout01Icon, Menu01Icon, Cancel01Icon } from 'hugeicons-react';
import { useSession, signOut } from '@/lib/auth-client';
import Link from 'next/link';

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = useSession();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Helper to determine if a link is active
    const isActive = (path: string) => {
        if (path === '/dashboard' && pathname === '/dashboard') return true;
        if (path.length > 10 && pathname?.startsWith(path)) return true;
        return false;
    };

    const getLinkClass = (path: string) => {
        return `w-full justify-start h-12 pl-6 md:pl-14 text-base rounded-xl transition-all duration-200 ${isActive(path) ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`;
    };

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    const SidebarContent = () => (
        <>
            {/* Logo */}
            <div className="p-4 md:p-6 flex items-center justify-between md:justify-center border-b border-gray-100">
                <Link href="/dashboard" className="flex items-center gap-3" onClick={closeMobileMenu}>
                    <img src="/logo.png" alt="Huggnote Logo" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
                    <span className="font-bold text-lg md:text-xl text-gray-900 tracking-tight">Huggnote</span>
                </Link>
                {/* Close button for mobile */}
                <button
                    onClick={closeMobileMenu}
                    className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <Cancel01Icon className="h-6 w-6 text-gray-600" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 md:p-4 space-y-2 overflow-y-auto">
                <Button
                    variant="ghost"
                    className={getLinkClass('/dashboard/create')}
                    asChild
                >
                    <Link href="/dashboard/create" onClick={closeMobileMenu}>
                        <AddCircleIcon className="mr-2 md:mr-3 h-6 w-6 md:h-7 md:w-7 shrink-0 stroke-[2]" />
                        Create New
                    </Link>
                </Button>

                <div className="pt-2 pb-2">
                    <div className="h-px bg-gray-100 mx-2"></div>
                </div>

                <Button
                    variant="ghost"
                    className={getLinkClass('/dashboard')}
                    asChild
                >
                    <Link href="/dashboard" onClick={closeMobileMenu}>
                        <FolderMusicIcon className="mr-2 md:mr-3 h-6 w-6 md:h-7 md:w-7 shrink-0 stroke-[2]" />
                        My Songs
                    </Link>
                </Button>

                <Button
                    variant="ghost"
                    className={getLinkClass('/dashboard/orders')}
                    asChild
                >
                    <Link href="/dashboard/orders" onClick={closeMobileMenu}>
                        <Invoice01Icon className="mr-2 md:mr-3 h-6 w-6 md:h-7 md:w-7 shrink-0 stroke-[2]" />
                        Orders
                    </Link>
                </Button>
                <Button
                    variant="ghost"
                    className={getLinkClass('/dashboard/settings')}
                    asChild
                >
                    <Link href="/dashboard/settings" onClick={closeMobileMenu}>
                        <Settings01Icon className="mr-2 md:mr-3 h-6 w-6 md:h-7 md:w-7 shrink-0 stroke-[2]" />
                        Settings
                    </Link>
                </Button>
            </nav>

            {/* Footer */}
            <div className="p-3 md:p-4 border-t bg-gray-50">
                <div className="user-info flex items-center gap-2 md:gap-3 mb-3 md:mb-4 p-2 md:p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                    <div className="user-avatar bg-gray-100 p-2 md:p-2.5 rounded-full flex items-center justify-center">
                        <UserIcon className="h-5 w-5 md:h-6 md:w-6 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm font-semibold text-gray-900 truncate">{session?.user?.name || session?.user?.email?.split('@')[0] || 'User'}</p>
                        <p className="text-[10px] md:text-xs text-muted-foreground flex items-center gap-1">
                            <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500"></span>
                            {(session?.user as any)?.credits || 0} Credits
                        </p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="default"
                    className="w-full justify-start pl-6 md:pl-14 rounded-xl text-sm md:text-base text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-colors"
                    onClick={() => {
                        signOut();
                        closeMobileMenu();
                    }}
                >
                    <Logout01Icon className="mr-2 md:mr-3 h-5 w-5 md:h-6 md:w-6 stroke-[2]" />
                    Log Out
                </Button>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-gray-200 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
            >
                <Menu01Icon className="h-6 w-6 text-gray-700" />
            </button>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                    onClick={closeMobileMenu}
                />
            )}

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 h-screen bg-white border-r shadow-sm flex-col shrink-0 sticky top-0">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar */}
            <aside className={`
                md:hidden fixed top-0 left-0 z-50 w-72 h-screen bg-white border-r shadow-2xl flex flex-col
                transform transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <SidebarContent />
            </aside>
        </>
    );
}
