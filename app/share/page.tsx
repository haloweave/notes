'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lora } from 'next/font/google';
import Image from 'next/image';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { RecipientLanding } from '@/app/components/RecipientLanding';

const lora = Lora({ subsets: ['latin'] });

function ShareContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const sessionId = searchParams.get('session_id');
    const indexParam = searchParams.get('index');
    const songIndex = indexParam ? parseInt(indexParam, 10) : 0; // Default to 0

    const [recipientName, setRecipientName] = useState('Someone Special');
    const [senderName, setSenderName] = useState('John');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

    // Initial Load & Data Processing
    useEffect(() => {
        const fetchFormData = async () => {
            if (!sessionId) {
                setLoading(false);
                return;
            }

            try {
                // Fetch compose form by session ID
                console.log('[SHARE] Fetching form for session ID:', sessionId);

                // Try fetching by formId first (for direct links from purchases)
                let response = await fetch(`/api/compose/forms?formId=${sessionId}`);

                // If not found, try stripeSessionId (for actual Stripe session IDs)
                if (!response.ok) {
                    console.log('[SHARE] Not found by formId, trying stripeSessionId...');
                    response = await fetch(`/api/compose/forms?stripeSessionId=${sessionId}`);
                }

                console.log('[SHARE] API response status:', response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('[SHARE] Failed to fetch form data');
                    console.error('[SHARE] Status:', response.status);
                    console.error('[SHARE] Error:', errorText);
                    setLoading(false);
                    return;
                }

                const data = await response.json();
                console.log('[SHARE] API response data:', data);

                if (!data.success || !data.form) {
                    console.error('[SHARE] No form found for session:', sessionId);
                    console.error('[SHARE] Response:', data);
                    setError('We couldn\'t find your order. The payment may not have completed, or the link may be invalid. Please check your email for the correct link or contact support.');
                    setLoading(false);
                    return;
                }

                const form = data.form; // API returns {success: true, form: {...}}

                console.log('[SHARE] Form data:', form);

                // Get recipient name from form data
                const formData = form.formData;
                if (formData?.recipientName) {
                    setRecipientName(formData.recipientName);
                } else if (formData?.songs?.[songIndex]?.recipientName) {
                    setRecipientName(formData.songs[songIndex].recipientName);
                }

                if (formData?.senderName) {
                    setSenderName(formData.senderName);
                }

                // Get selected variation task ID
                const selectedVariations = form.selectedVariations || {};
                const variationTaskIds = form.variationTaskIds || {};

                console.log('[SHARE] Selected variations:', selectedVariations);
                console.log('[SHARE] Variation task IDs:', variationTaskIds);

                // For solo-serenade, get the first (and only) song's selected variation
                // For bundles, we use the parsed index
                const selectedVariationId = selectedVariations[songIndex];
                const taskIdsForSong = variationTaskIds[songIndex];

                console.log('[SHARE] Song index:', songIndex);
                console.log('[SHARE] Selected variation ID:', selectedVariationId);
                console.log('[SHARE] Task IDs for song:', taskIdsForSong);

                if (selectedVariationId && taskIdsForSong && taskIdsForSong[selectedVariationId - 1]) {
                    const taskId = taskIdsForSong[selectedVariationId - 1];
                    setSelectedTaskId(taskId);
                    console.log('[SHARE] ✅ Selected task ID:', taskId);
                } else {
                    console.warn('[SHARE] ⚠️ No task ID found for selected variation');
                    console.warn('[SHARE] This might mean:');
                    console.warn('[SHARE]   - No variation was selected yet');
                    console.warn('[SHARE]   - Variations are still generating');
                    console.warn('[SHARE]   - Data structure mismatch');
                    console.warn('[SHARE]   - Payment webhook hasn\'t been processed yet');

                    // Set error state instead of showing the gift UI
                    setError('Your song is still being prepared. This usually means the payment is being processed or the songs are still generating. Please check your email in a few minutes for the link, or contact support if this persists.');
                }

            } catch (error) {
                console.error('[SHARE] Error fetching form data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFormData();
    }, [sessionId]);

    const handleOpenGift = () => {
        if (selectedTaskId) {
            console.log('[SHARE] Opening song for session:', sessionId);
            // Redirect to the new public library page for this song (using the form ID/Session ID)
            router.push(`/compose/library/${sessionId}?index=${songIndex}`);
        } else {
            console.error('[SHARE] No task ID available');
            // This should rarely happen now since we set error state earlier
            alert('⚠️ Unable to open your song. The link may be invalid or the payment may not have completed. Please check your email for the correct link or contact support.');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <LoadingSpinner size="lg" variant="dots" color="primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-2xl w-full relative z-10 animate-in fade-in zoom-in duration-700">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden p-8 text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h1 className={`text-2xl md:text-3xl font-bold text-red-600 mb-4 ${lora.className}`}>
                        Oops! Something Went Wrong
                    </h1>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        {error}
                    </p>
                    <button
                        onClick={() => router.push('/')}
                        className="px-6 py-3 bg-gradient-to-r from-red-600 to-green-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <RecipientLanding
            recipientName={recipientName}
            senderName={senderName}
            onOpenGift={handleOpenGift}
            onNavigateHome={() => router.push('/')}
        />
    );
}

export default function SharePage() {
    return (
        <Suspense fallback={
            <div className="relative z-10 flex min-h-screen items-center justify-center text-white bg-[#1a3d5f]">
                <LoadingSpinner size="lg" variant="dots" color="primary" />
            </div>
        }>
            <ShareContent />
        </Suspense>
    );
}
