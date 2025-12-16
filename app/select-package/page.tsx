'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SelectPackagePage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to the new compose route
        router.replace('/compose/select-package');
    }, [router]);

    return null;
}
