'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { PricingTable } from '@/components/dashboard/pricing-table';

export default function OrdersPage() {
    const router = useRouter();

    return (
        <div className="space-y-8">
            <DashboardHeader
                title="Get Credits"
                description="Purchase credits to create more songs."
            />

            {/* Pricing Options */}
            {/* Pricing Options */}
            <PricingTable />

            <div className="pt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Order History</h2>
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No orders yet. Purchase credits to see your purchase history here.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
}
