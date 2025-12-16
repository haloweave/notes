'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lora } from 'next/font/google';
import { Button } from '@/components/ui/button';
import { Loading01Icon, MusicNote01Icon } from 'hugeicons-react';
import { PremiumButton } from '@/components/ui/premium-button';

const lora = Lora({ subsets: ['latin'] });

function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const sessionId = searchParams.get('session_id');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (sessionId) {
            // Update localStorage with success status
            const formId = sessionStorage.getItem('currentFormId');
            if (formId) {
                const savedData = localStorage.getItem(`songForm_${formId}`);
                if (savedData) {
                    const parsedData = JSON.parse(savedData);
                    const updatedData = {
                        ...parsedData,
                        status: 'payment_successful',
                        subStatus: 'composing',
                        stripeSessionId: sessionId,
                        lastUpdated: new Date().toISOString()
                    };
                    localStorage.setItem(`songForm_${formId}`, JSON.stringify(updatedData));
                    console.log('[FRONTEND] Payment successful, updated local storage:', updatedData);
                }
            }

            // Clear form data from session
            sessionStorage.removeItem('songFormData');
            sessionStorage.removeItem('generatedPrompt');
            sessionStorage.removeItem('currentFormId');

            // Show loading for effect
            const timer = setTimeout(() => {
                setLoading(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [sessionId]);

    return (
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border-2 border-[#F5E6B8] p-8 md:p-12 shadow-[0_8px_30px_rgba(245,230,184,0.2)]">
                {loading ? (
                    <div className="space-y-6">
                        <div className="w-20 h-20 mx-auto text-[#F5E6B8] animate-spin">
                            <Loading01Icon className="w-full h-full" />
                        </div>
                        <h1 className={`text-2xl md:text-3xl font-medium text-[#E8DCC0] ${lora.className}`}>
                            Confirming your order...
                        </h1>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                        <div className="w-24 h-24 mx-auto bg-[#F5E6B8]/20 rounded-full flex items-center justify-center border-2 border-[#F5E6B8]">
                            <MusicNote01Icon className="w-12 h-12 text-[#F5E6B8]" />
                        </div>

                        <div className="space-y-4">
                            <h1 className={`text-3xl md:text-4xl font-normal text-[#F5E6B8] ${lora.className}`}>
                                Payment Successful!
                            </h1>
                            <p className="text-lg text-white/80 leading-relaxed">
                                Thank you for your order. We are now composing your bespoke song!
                            </p>
                            <div className="bg-[#1a3d5f]/50 rounded-lg p-6 border border-white/10">
                                <p className="text-white/90">
                                    You will receive an email shortly with the link to your song once it's ready.
                                </p>
                            </div>
                        </div>

                        <div className="pt-4">
                            <PremiumButton onClick={() => router.push(`/share?session_id=${sessionId}`)} className="w-full">
                                View & Share Your Song
                            </PremiumButton>

                            <Button
                                variant="ghost"
                                className="w-full text-[#F5E6B8] hover:text-[#F5E6B8]/80 hover:bg-[#F5E6B8]/10"
                                onClick={() => router.push('/')}
                            >
                                Return Home
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center text-white">
                <Loading01Icon className="w-8 h-8 animate-spin" />
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
