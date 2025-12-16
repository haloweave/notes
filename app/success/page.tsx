'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SuccessPage() {
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
