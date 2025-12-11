'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AddCircleIcon, FolderMusicIcon, Invoice01Icon, Settings01Icon, UserIcon, Logout01Icon } from 'hugeicons-react';
import { useSession, signOut } from '@/lib/auth-client';
import Link from 'next/link';

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = useSession();

    // Helper to determine if a link is active
    const isActive = (path: string) => {
        if (path === '/dashboard' && pathname === '/dashboard') return true;
        if (path.length > 10 && pathname?.startsWith(path)) return true;
        return false;
    };

    const getLinkClass = (path: string) => {
        return `w-full justify-start h-12 pl-14 text-base rounded-xl transition-all duration-200 ${isActive(path) ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`;
    };

    return (
        <aside className="w-64 h-screen bg-white border-r shadow-sm flex flex-col shrink-0 sticky top-0">
            {/* Logo */}
            <div className="p-6 flex items-center justify-center border-b border-gray-100">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <img src="/logo.png" alt="Huggnote Logo" className="w-10 h-10 object-contain" />
                    <span className="font-bold text-xl text-gray-900 tracking-tight">Huggnote</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                <Button
                    variant={isActive('/dashboard/create') ? 'secondary' : 'default'}
                    className={`w-full justify-start h-14 pl-14 text-base rounded-xl transition-all duration-200 ${isActive('/dashboard/create') ? 'bg-primary/10 text-primary hover:bg-primary/20 font-semibold' : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/30'}`}
                    asChild
                >
                    <Link href="/dashboard/create">
                        <AddCircleIcon className={`mr-2 h-6 w-6 shrink-0 ${isActive('/dashboard/create') ? 'text-primary' : 'text-primary-foreground'}`} />
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
                    <Link href="/dashboard">
                        <FolderMusicIcon className="mr-2 h-6 w-6 shrink-0" />
                        My Songs
                    </Link>
                </Button>

                <Button
                    variant="ghost"
                    className={getLinkClass('/dashboard/orders')}
                    asChild
                >
                    <Link href="/dashboard/orders">
                        <Invoice01Icon className="mr-2 h-6 w-6 shrink-0" />
                        Orders
                    </Link>
                </Button>
                <Button
                    variant="ghost"
                    className={getLinkClass('/dashboard/settings')}
                    asChild
                >
                    <Link href="/dashboard/settings">
                        <Settings01Icon className="mr-2 h-6 w-6 shrink-0" />
                        Settings
                    </Link>
                </Button>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50">
                <div className="user-info flex items-center gap-3 mb-4 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                    <div className="user-avatar bg-primary/10 p-2.5 rounded-full flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{session?.user?.name || session?.user?.email?.split('@')[0] || 'User'}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                            {(session?.user as any)?.credits || 0} Credits
                        </p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="default"
                    className="w-full justify-start pl-14 rounded-xl text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-colors"
                >
                    <Logout01Icon className="mr-3 h-5 w-5" />
                    Log Out
                </Button>
            </div>
        </aside>
    );
}
