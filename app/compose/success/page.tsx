'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lora } from 'next/font/google';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CircleCheckBig, Sparkles, Mail, Music, Gift } from 'lucide-react';

const lora = Lora({ subsets: ['latin'] });

// Generate random confetti pieces
function generateConfetti() {
    const confetti = [];
    for (let i = 0; i < 15; i++) {
        confetti.push({
            left: Math.random() * 100,
            top: -(Math.random() * 20),
            delay: Math.random() * 5,
            duration: 3 + Math.random() * 3.5,
            opacity: 0.65 + Math.random() * 0.25,
            rotation: Math.random() * 360,
            type: Math.random() > 0.5 ? 'square' : 'rect',
            width: Math.random() > 0.7 ? 8 : Math.random() > 0.5 ? 5 : 4,
            height: Math.random() > 0.7 ? 4 : Math.random() > 0.5 ? 12 : 4,
        });
    }
    return confetti;
}

function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const sessionId = searchParams.get('session_id');
    const [confetti] = useState(generateConfetti);
    const [currentStep, setCurrentStep] = useState(1);
    const [recipientName, setRecipientName] = useState('');
    const [orderNumber, setOrderNumber] = useState('');

    useEffect(() => {
        if (sessionId) {
            // Generate order number
            setOrderNumber(`HUG-${Math.floor(10000000 + Math.random() * 90000000)}`);

            // Get recipient name from form data
            const formId = sessionStorage.getItem('currentFormId');
            if (formId) {
                const savedData = localStorage.getItem(`songForm_${formId}`);
                if (savedData) {
                    try {
                        const parsedData = JSON.parse(savedData);
                        const formData = parsedData.formData;
                        if (formData?.songs?.[0]?.recipientName) {
                            setRecipientName(formData.songs[0].recipientName);
                        }
                    } catch (e) {
                        console.error('Error parsing form data:', e);
                    }

                    // Update localStorage with success status
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
        }

        // Animate steps
        const timer1 = setTimeout(() => setCurrentStep(2), 1000);
        const timer2 = setTimeout(() => setCurrentStep(3), 2000);
        const timer3 = setTimeout(() => setCurrentStep(4), 3000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, [sessionId]);

    const steps = [
        {
            id: 1,
            title: 'Order Confirmed',
            description: 'Your payment was successful',
            icon: CircleCheckBig,
            color: '#87CEEB',
            completed: currentStep >= 1,
        },
        {
            id: 2,
            title: 'Crafting Your Song',
            description: 'Our elves are composing magic',
            icon: Music,
            color: '#F5E6B8',
            completed: currentStep >= 2,
        },
        {
            id: 3,
            title: 'Gift Wrapping',
            description: 'Adding the final touches',
            icon: Gift,
            color: '#87CEEB',
            completed: currentStep >= 3,
        },
        {
            id: 4,
            title: 'Express Festive Offer',
            description: 'Sent via Santa\'s sleigh 🎅',
            icon: Mail,
            color: '#F5E6B8',
            completed: currentStep >= 4,
        },
    ];

    return (
        <div className="w-full relative">
            {/* Animated Confetti - Positioned relative to layout */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-[5]">
                {confetti.map((piece, index) => (
                    <div
                        key={index}
                        className="absolute animate-fall"
                        style={{
                            left: `${piece.left}%`,
                            top: `${piece.top}%`,
                            animationDelay: `${piece.delay}s`,
                            animationDuration: `${piece.duration}s`,
                            opacity: piece.opacity,
                        }}
                    >
                        <div
                            style={{
                                backgroundColor: '#F5E6B8',
                                width: `${piece.width}px`,
                                height: `${piece.height}px`,
                                transform: `rotate(${piece.rotation}deg)`,
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-4 py-4 md:py-8">
                {/* Header */}
                <div className="text-center mb-8 md:mb-12">
                    <div className="flex items-center justify-center gap-3 md:gap-4 mb-4">
                        <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#87CEEB] to-[#4A90E2] rounded-full animate-scale-in shadow-[0_0_40px_rgba(135,206,235,0.4)]">
                            <CircleCheckBig className="w-6 h-6 md:w-7 md:h-7 text-white" />
                        </div>
                        <h1 className={`text-2xl md:text-4xl text-[#F5E6B8] animate-fade-in ${lora.className}`}>
                            Order Confirmed
                        </h1>
                    </div>
                    <p className="text-base md:text-lg text-white/80 mb-2">
                        Order #{orderNumber}
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white/10 backdrop-blur-md border-2 border-[#87CEEB]/30 rounded-2xl p-6 md:p-10 shadow-[0_8px_32px_rgba(135,206,235,0.2)]">
                    {/* Message */}
                    <div className="flex items-start gap-3 md:gap-4 mb-8 pb-8 border-b border-white/10">
                        <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-[#F5E6B8] flex-shrink-0 mt-1 animate-pulse" />
                        <div className="flex-1">
                            <p className="text-white/90 text-base md:text-lg leading-relaxed">
                                The Huggnote elves are putting the final touches on your special song
                                {recipientName && (
                                    <span className="text-[#F5E6B8]"> for {recipientName}</span>
                                )}
                                . Every note, every word will be uniquely yours.
                            </p>
                        </div>
                    </div>

                    {/* Email Notice */}
                    <div className="flex items-start gap-4 mb-8 pb-8 border-b border-white/10">
                        <div className="hidden md:flex w-14 h-14 bg-[#87CEEB] rounded-full items-center justify-center flex-shrink-0">
                            <Mail className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className={`text-base md:text-lg text-[#F5E6B8] mb-2 ${lora.className}`}>
                                Incoming - Keep an Eye on Your Inbox
                            </h3>
                            <p className="text-white/80 text-sm md:text-base leading-relaxed">
                                Your finished song will arrive at your email faster than Santa's sleigh!
                            </p>
                            <p className="text-white/80 text-sm md:text-base leading-relaxed mt-2">
                                Thanks to our Express Festive Offer, your musical gift is already being crafted with extra holiday magic.
                            </p>
                        </div>
                    </div>

                    {/* Progress Steps */}
                    <div>
                        <h2 className={`text-xl md:text-2xl text-[#F5E6B8] mb-6 text-center ${lora.className}`}>
                            What Happens Next
                        </h2>
                        <div className="space-y-6">
                            {steps.map((step, index) => {
                                const Icon = step.icon;
                                const isLast = index === steps.length - 1;
                                const isActive = step.completed;

                                return (
                                    <div key={step.id} className="relative">
                                        {/* Connector Line */}
                                        {!isLast && (
                                            <div
                                                className="absolute left-5 md:left-7 top-10 md:top-14 w-0.5 h-10 md:h-12 transition-all duration-1000"
                                                style={{
                                                    background: isActive
                                                        ? 'linear-gradient(rgba(135, 206, 235, 0.6), rgba(135, 206, 235, 0.2))'
                                                        : 'rgba(255, 255, 255, 0.1)',
                                                }}
                                            />
                                        )}

                                        {/* Step Content */}
                                        <div
                                            className="flex items-start gap-4 md:gap-6 transition-all duration-500"
                                            style={{ opacity: isActive ? 1 : 0.5 }}
                                        >
                                            {/* Icon Circle */}
                                            <div
                                                className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${isActive
                                                    ? 'bg-gradient-to-br from-[#87CEEB] to-[#4A90E2] shadow-[0_0_30px_rgba(135,206,235,0.4)]'
                                                    : 'bg-gradient-to-br from-[#87CEEB]/60 to-[#4A90E2]/60 shadow-[0_0_20px_rgba(135,206,235,0.3)]'
                                                    } ${!isActive && step.id === 4 ? 'animate-pulse' : ''}`}
                                                style={{
                                                    borderColor: step.color,
                                                    borderWidth: '2px',
                                                    borderStyle: 'solid',
                                                }}
                                            >
                                                <Icon className="w-5 h-5 md:w-7 md:h-7 text-white" />
                                            </div>

                                            {/* Text */}
                                            <div className="flex-1 pt-1 md:pt-2">
                                                <h3
                                                    className={`text-base md:text-lg mb-1 ${lora.className}`}
                                                    style={{ color: step.color }}
                                                >
                                                    {step.title}
                                                </h3>
                                                <p className="text-sm md:text-base text-white/80">
                                                    {step.description}
                                                </p>
                                            </div>

                                            {/* Checkmark */}
                                            {isActive && step.id !== 4 && (
                                                <CircleCheckBig className="w-5 h-5 md:w-6 md:h-6 text-[#87CEEB] flex-shrink-0 animate-scale-in" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 space-y-3">
                    <button
                        onClick={() => router.push('/compose/library')}
                        className="w-full py-4 px-6 bg-gradient-to-br from-[#F5E6B8] to-[#D4C89A] text-[#1a3d5f] rounded-xl font-semibold text-lg shadow-[0_4px_20px_rgba(245,230,184,0.3)] hover:shadow-[0_6px_25px_rgba(245,230,184,0.4)] transition-all duration-200"
                    >
                        View & Share Your Song
                    </button>
                    <button
                        onClick={() => router.push('/')}
                        className="w-full py-3 px-6 bg-white/10 hover:bg-white/20 text-[#E0F4FF] rounded-xl font-medium border border-white/20 transition-all duration-200"
                    >
                        Return Home
                    </button>
                </div>
            </div>

            {/* Animations */}
            <style jsx>{`
                @keyframes fall {
                    to {
                        transform: translateY(100vh) rotate(360deg);
                    }
                }
                @keyframes scale-in {
                    from {
                        transform: scale(0);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fall {
                    animation: fall linear infinite;
                }
                .animate-scale-in {
                    animation: scale-in 0.5s ease-out;
                }
                .animate-fade-in {
                    animation: fade-in 0.8s ease-out;
                }
            `}</style>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-[50vh]">
                    <LoadingSpinner size="lg" variant="dots" color="primary" />
                </div>
            }
        >
            <SuccessContent />
        </Suspense>
    );
}
