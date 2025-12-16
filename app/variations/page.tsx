'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function VariationsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Preserve query params when redirecting
        const params = searchParams.toString();
        const newPath = params ? `/compose/variations?${params}` : '/compose/variations';
        router.replace(newPath);
    }, [router, searchParams]);

    return null;
}