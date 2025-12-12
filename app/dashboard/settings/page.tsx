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
        <div className="space-y-8">
            <DashboardHeader
                title="Settings"
                description="Manage your profile and preferences."
            />
            <Card className="max-w-2xl">
                <CardContent className="p-6 space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Profile</h3>
                        <form id="settings-form" className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="settings-email">Email Address</Label>
                                <Input
                                    id="settings-email"
                                    type="email"
                                    value={session?.user?.email || ''}
                                    disabled
                                    className="bg-gray-50"
                                />
                                <p className="text-sm text-muted-foreground">Contact support to change email.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="display-name">Display Name</Label>
                                <Input id="display-name" placeholder="Your Name" />
                            </div>
                            <Button type="submit" className="w-full">Save Changes</Button>
                        </form>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}
