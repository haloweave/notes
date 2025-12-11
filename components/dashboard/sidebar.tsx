'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MaterialIcon } from '@/components/ui/material-icon';
import { useSession, signOut } from '@/lib/auth-client';
import Link from 'next/link';

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = useSession();

    // Helper to determine if a link is active
    const isActive = (path: string) => {
        if (path === '/dashboard' && pathname === '/dashboard') return true;
        if (path !== '/dashboard' && pathname?.startsWith(path)) return true;
        return false;
    };

    const getLinkClass = (path: string) => {
        return `w-full justify-start ${isActive(path) ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`;
    };

    return (
        <aside className="w-64 h-screen bg-white border-r shadow-sm flex flex-col shrink-0 sticky top-0">
            {/* Logo */}
            <div className="p-4">
                <Link href="/dashboard" className="logo flex items-center gap-2 font-bold text-lg">
                    <span className="logo-badge bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-black">H</span>
                    Huggnote
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                <Button
                    variant="ghost"
                    className={getLinkClass('/dashboard')}
                    asChild
                >
                    <Link href="/dashboard">
                        <MaterialIcon name="library_music" className="mr-3 h-5 w-5 shrink-0" />
                        My Songs
                    </Link>
                </Button>
                <Button
                    variant="ghost"
                    className={getLinkClass('/dashboard/create')}
                    asChild
                >
                    <Link href="/dashboard/create">
                        <MaterialIcon name="add_circle" className="mr-3 h-5 w-5 shrink-0" />
                        Create New
                    </Link>
                </Button>
                <Button
                    variant="ghost"
                    className={getLinkClass('/dashboard/orders')}
                    asChild
                >
                    <Link href="/dashboard/orders">
                        <MaterialIcon name="receipt_long" className="mr-3 h-5 w-5 shrink-0" />
                        Orders
                    </Link>
                </Button>
                <Button
                    variant="ghost"
                    className={getLinkClass('/dashboard/settings')}
                    asChild
                >
                    <Link href="/dashboard/settings">
                        <MaterialIcon name="settings" className="mr-3 h-5 w-5 shrink-0" />
                        Settings
                    </Link>
                </Button>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50">
                <div className="user-info flex items-center gap-3 mb-4 p-3 bg-white rounded-lg shadow-sm">
                    <div className="user-avatar bg-gray-200 p-2 rounded-full">
                        <MaterialIcon name="person" className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{session?.user?.email || 'User'}</p>
                        {/* Credits would ideally be fetched from a context or prop, removing basic 0 for now or handled in separate component */}
                        <p className="text-xs text-muted-foreground">{(session?.user as any)?.credits || 0} Credits</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => signOut()}
                    size="sm"
                >
                    <MaterialIcon name="logout" className="mr-2 h-4 w-4" />
                    Log Out
                </Button>
            </div>
        </aside>
    );
}
