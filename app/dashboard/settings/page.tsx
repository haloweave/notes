import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { PricingTable } from '@/components/dashboard/pricing-table';
import { OrderSuccessDialog } from '@/components/dashboard/order-success-dialog';

export default async function SettingsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        redirect('/');
    }

    // Fetch orders
    const userOrders = await db.select()
        .from(orders)
        .where(eq(orders.userId, session.user.id))
        .orderBy(desc(orders.createdAt));

    return (
        <div className="space-y-6 md:space-y-8">
            <DashboardHeader
                title="Settings"
                description="Manage your profile, preferences, and orders."
            />

            {/* Profile Settings */}
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

            {/* Pricing Options */}
            <div className="pt-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Get More Songs</h2>
                <PricingTable />
                <OrderSuccessDialog />
            </div>

            {/* Order History */}
            <div className="pt-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Order History</h2>
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px]">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 md:px-6 py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                    <th className="px-4 md:px-6 py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-4 md:px-6 py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Package</th>
                                    <th className="px-4 md:px-6 py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-4 md:px-6 py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 md:px-6 py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Songs</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {userOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 md:px-6 py-8 md:py-12 text-center text-sm md:text-base text-gray-500">
                                            No orders yet. Purchase songs to see your purchase history here.
                                        </td>
                                    </tr>
                                ) : (
                                    userOrders.map((order) => (
                                        <tr key={order.id}>
                                            <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm font-medium text-gray-900">
                                                {order.id.substring(0, 8)}...
                                            </td>
                                            <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">
                                                {order.packageId === 'bundle' ? '3 Song Bundle' : order.packageId === 'holiday-hamper' ? 'Holiday Hamper' : order.packageId === 'solo-serenade' ? 'Solo Serenade' : '1 Song'}
                                            </td>
                                            <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">
                                                €{(order.amount / 100).toFixed(2)}
                                            </td>
                                            <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm">
                                                <span className={`px-2 inline-flex text-[10px] md:text-xs leading-5 font-semibold rounded-full ${order.status === 'succeeded' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">
                                                {order.credits}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
}
