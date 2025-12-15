'use client';

import { useSession, signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// MaterialIcon import removed

import { DashboardHeader } from '@/components/dashboard/dashboard-header';

export default function SettingsPage() {
    const { data: session } = useSession();
    const router = useRouter();

    return (
        <div className="space-y-6 md:space-y-8">
            <DashboardHeader
                title="Settings"
                description="Manage your profile and preferences."
            />
            <Card className="max-w-2xl">
                <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    <div>
                        <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Profile</h3>
                        <form id="settings-form" className="space-y-3 md:space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="settings-email" className="text-sm md:text-base">Email Address</Label>
                                <Input
                                    id="settings-email"
                                    type="email"
                                    value={session?.user?.email || ''}
                                    disabled
                                    className="bg-gray-50 text-sm md:text-base"
                                />
                                <p className="text-xs md:text-sm text-muted-foreground">Contact support to change email.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="display-name" className="text-sm md:text-base">Display Name</Label>
                                <Input id="display-name" placeholder="Your Name" className="text-sm md:text-base" />
                            </div>
                            <Button type="submit" className="w-full text-sm md:text-base">Save Changes</Button>
                        </form>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}
