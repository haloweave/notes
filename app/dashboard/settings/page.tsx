'use client';

import { useSession, signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MaterialIcon } from '@/components/ui/material-icon';

export default function SettingsPage() {
    const { data: session } = useSession();
    const router = useRouter();

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center pb-6 border-b border-gray-200">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-500 mt-1">Manage your profile and preferences.</p>
                </div>
            </header>
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
                    <div className="pt-6 border-t">
                        <h3 className="text-lg font-semibold mb-4">Danger Zone</h3>
                        <p className="text-sm text-muted-foreground mb-4">Resetting data will clear all local storage, including your session and created songs. This cannot be undone.</p>
                        <Button
                            variant="destructive"
                            className="w-full flex items-center gap-2"
                            onClick={() => {
                                if (confirm('Are you sure you want to reset local data? This action cannot be undone.')) {
                                    localStorage.clear();
                                    sessionStorage.clear();
                                    signOut();
                                    router.push('/');
                                }
                            }}
                        >
                            <MaterialIcon name="refresh" className="h-4 w-4" />
                            Reset Local Data
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
