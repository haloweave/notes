'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function SuccessRedirect() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Preserve query params when redirecting
        const params = searchParams.toString();
        const newPath = params ? `/compose/success?${params}` : '/compose/success';
        router.replace(newPath);
    }, [router, searchParams]);

    return null;
}

export default function SuccessPage() {
    return (
        <Suspense fallback={null}>
            <SuccessRedirect />
        </Suspense>
    );
}
