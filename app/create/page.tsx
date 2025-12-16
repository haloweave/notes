'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatePage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to the new compose route
        router.replace('/compose/create');
    }, [router]);

    return null;
}
