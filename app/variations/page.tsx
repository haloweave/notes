'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function VariationsRedirect() {
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

export default function VariationsPage() {
    return (
        <Suspense fallback={null}>
            <VariationsRedirect />
        </Suspense>
    );
}