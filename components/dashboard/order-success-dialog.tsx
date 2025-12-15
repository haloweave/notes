'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckmarkCircle01Icon as CheckCircleIcon } from 'hugeicons-react';

export function OrderSuccessDialog() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (searchParams.get('success') === 'true') {
            setIsOpen(true);
        }
    }, [searchParams]);

    const handleClose = () => {
        setIsOpen(false);
        // Clean up URL
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.delete('success');
        newParams.delete('session_id');
        router.replace('/dashboard/orders');
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex justify-center mb-4">
                        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircleIcon className="h-10 w-10 text-green-600" />
                        </div>
                    </div>
                    <DialogTitle className="text-center text-xl">Payment Successful!</DialogTitle>
                    <DialogDescription className="text-center text-base pt-2">
                        Thank you for your purchase. Your credits have been added to your account and you are ready to create magic!
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-center">
                    <Button type="button" onClick={handleClose} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700">
                        Start Creating
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
