'use client';

import { useRouter } from 'next/navigation';
import { Lora } from 'next/font/google';
import Image from 'next/image';
import { ArrowLeft01Icon, Menu01Icon, StarIcon, CheckmarkCircle01Icon } from 'hugeicons-react';
import { useEffect } from 'react';

const lora = Lora({ subsets: ['latin'] });

export default function SelectPackagePage() {
    const router = useRouter();

    const handleSelect = (packageId: 'solo-serenade' | 'holiday-hamper') => {
        // Clear previous session data to start fresh
        sessionStorage.removeItem('songFormData');
        sessionStorage.removeItem('generatedPrompt');
        sessionStorage.removeItem('currentFormId');

        // Set the selected package
        sessionStorage.setItem('selectedPackageId', packageId);

        // Initialize a session ID for this flow if we want to track it early
        // For now, just navigating to create is enough, the create page generates the form ID

        router.push('/create');
    };

    return (
        <div className="relative min-h-screen w-full flex flex-col font-sans" style={{ backgroundColor: '#1a3d5f' }}>
            {/* Background Image Layer */}
            <div
                className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40"
                style={{ backgroundImage: "url('/web background image.png')" }}
            />

            <div className="relative z-10 container mx-auto max-w-7xl p-4 md:p-8">
                {/* Mobile Header */}
                <div className="flex md:hidden justify-between items-start mb-8">
                    <button
                        onClick={() => router.push('/')}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all hover:bg-white/20 h-9 px-4 py-2 text-white"
                    >
                        <ArrowLeft01Icon className="w-4 h-4 mr-2" />
                        Back to Home
                    </button>
                    {/* Placeholder for menu if needed, or just remove if not functional yet */}
                </div>

                {/* Desktop Header */}
                <div className="hidden md:flex justify-center items-center mb-10 relative">
                    <button
                        onClick={() => router.push('/')}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all hover:bg-white/20 h-9 px-4 py-2 absolute left-0 text-white"
                    >
                        <ArrowLeft01Icon className="w-4 h-4 mr-2" />
                        Back to Home
                    </button>

                    <Image
                        src="/huggnote bespoke logo.png"
                        alt="Huggnote Bespoke Songs"
                        width={200}
                        height={80}
                        className="h-24 w-auto drop-shadow-lg"
                    />
                </div>

                {/* Mobile Logo Center */}
                <div className="flex md:hidden justify-center mb-6">
                    <Image
                        src="/huggnote bespoke logo.png"
                        alt="Huggnote Bespoke Songs"
                        width={160}
                        height={64}
                        className="h-20 w-auto drop-shadow-lg"
                    />
                </div>

                {/* Title Section */}
                <div className="text-center mb-8 md:mb-12 space-y-3">
                    <h1 className={`text-white md:text-[#E8DCC0] text-3xl md:text-5xl font-normal drop-shadow-xl ${lora.className}`}>
                        Select Your Bespoke Gift
                    </h1>
                    <p className="text-white/90 md:text-white/80 text-base md:text-xl max-w-2xl mx-auto font-light">
                        Compose one special song or save 58% with a 5-song Merry Medley (2 songs free!)
                    </p>
                </div>

                {/* Mobile Layout (Stacked) */}
                <div className="md:hidden space-y-8 pb-12">
                    {/* Solo Serenade Card Mobile */}
                    <div className="space-y-4">
                        <div
                            onClick={() => handleSelect('solo-serenade')}
                            className="cursor-pointer transition-all duration-300 w-[90%] mx-auto bg-gradient-to-b from-[#87CEEB]/10 to-[#1a3d5f]/50 backdrop-blur-md border-2 border-[#87CEEB] rounded-2xl overflow-hidden relative shadow-[0_8px_30px_rgba(135,206,235,0.2)] aspect-[4/3] flex items-center justify-center group"
                        >
                            <div className="text-center p-6">
                                <h3 className={`text-2xl text-[#87CEEB] mb-2 ${lora.className}`}>Solo Serenade</h3>
                                <p className="text-white/80">1 Custom Personalised Song</p>
                                <div className="mt-4 text-3xl font-bold text-white">€37</div>
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <button
                                onClick={() => handleSelect('solo-serenade')}
                                className={`inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium h-12 px-8 w-[85%] bg-gradient-to-r from-[#9FE8E4] to-[#B3E5FC] text-[#1a3d5f] rounded-xl shadow-[0_4px_15px_rgba(135,206,235,0.4)] text-lg ${lora.className}`}
                            >
                                Select Solo Serenade
                            </button>
                        </div>
                    </div>

                    {/* Merry Medley Card Mobile */}
                    <div className="space-y-4 relative pt-4">
                        <div className="absolute top-0 right-[5%] z-20 flex items-center gap-1.5 bg-[#f5ecd4] text-[#1a3d5f] px-3 py-1.5 rounded-full shadow-lg">
                            <StarIcon className="w-3 h-3 fill-[#1a3d5f]" />
                            <span className={`text-xs font-bold uppercase tracking-wide`}>Best Value</span>
                        </div>
                        <div
                            onClick={() => handleSelect('holiday-hamper')}
                            className="cursor-pointer transition-all duration-300 w-[90%] mx-auto bg-gradient-to-b from-[#f5ecd4]/10 to-[#1a3d5f]/50 backdrop-blur-md border-2 border-[#f5ecd4] rounded-2xl overflow-hidden relative shadow-[0_8px_30px_rgba(245,236,212,0.2)] aspect-[4/3] flex items-center justify-center"
                        >
                            <div className="text-center p-6">
                                <h3 className={`text-2xl text-[#f5ecd4] mb-2 ${lora.className}`}>Merry Medley</h3>
                                <p className="text-white/80">5 Custom Personalised Songs</p>
                                <div className="mt-4 text-3xl font-bold text-white">€87</div>
                                <div className="mt-1 text-sm text-[#f5ecd4] font-medium">Save €98!</div>
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <button
                                onClick={() => handleSelect('holiday-hamper')}
                                className={`inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium h-12 px-8 w-[85%] bg-[#f5ecd4] text-[#1a3d5f] rounded-xl shadow-[0_4px_15px_rgba(245,236,212,0.4)] text-lg ${lora.className}`}
                            >
                                Select Merry Medley
                            </button>
                        </div>
                    </div>
                </div>

                {/* Desktop Layout (Grid) */}
                <div className="hidden md:block">
                    <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-4xl mx-auto">

                        {/* Solo Serenade Column */}
                        <div className="space-y-6">
                            <div
                                onClick={() => handleSelect('solo-serenade')}
                                className="cursor-pointer transition-all duration-300 w-full hover:-translate-y-2 bg-gradient-to-b from-[#87CEEB]/10 to-[#1a3d5f]/50 backdrop-blur-md border-2 border-[#87CEEB] rounded-2xl overflow-hidden relative shadow-[0_8px_30px_rgba(135,206,235,0.2)] hover:shadow-[0_15px_40px_rgba(135,206,235,0.3)] aspect-[4/3] flex items-center justify-center group"
                            >
                                <div className="text-center p-8">
                                    <h3 className={`text-3xl text-[#87CEEB] mb-3 ${lora.className}`}>Solo Serenade</h3>
                                    <p className="text-white/80 text-lg">1 Custom Personalised Song</p>
                                    <div className="mt-6 text-4xl font-bold text-white">€37</div>
                                </div>
                            </div>
                            <div className="flex justify-center">
                                <button
                                    onClick={() => handleSelect('solo-serenade')}
                                    className={`inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium h-14 px-10 w-full bg-gradient-to-r from-[#9FE8E4] to-[#B3E5FC] hover:from-[#8EDDF0] hover:to-[#A3D5FC] text-[#1a3d5f] rounded-xl shadow-[0_4px_15px_rgba(135,206,235,0.4)] hover:shadow-[0_6px_20px_rgba(135,206,235,0.6)] transform hover:scale-[1.02] transition-all duration-200 text-xl ${lora.className}`}
                                >
                                    Select Solo Serenade
                                </button>
                            </div>
                        </div>

                        {/* Merry Medley Column */}
                        <div className="space-y-6 relative">
                            {/* Best Value Badge */}
                            <div className="absolute -top-4 -right-4 z-20 flex items-center gap-2 bg-[#f5ecd4] text-[#1a3d5f] px-4 py-2 rounded-full shadow-xl transform rotate-3">
                                <StarIcon className="w-4 h-4 fill-[#1a3d5f]" />
                                <span className={`text-sm font-bold uppercase tracking-wide`}>Best Value</span>
                            </div>

                            <div
                                onClick={() => handleSelect('holiday-hamper')}
                                className="cursor-pointer transition-all duration-300 w-full hover:-translate-y-2 bg-gradient-to-b from-[#f5ecd4]/10 to-[#1a3d5f]/50 backdrop-blur-md border-2 border-[#f5ecd4] rounded-2xl overflow-hidden relative shadow-[0_8px_30px_rgba(245,236,212,0.2)] hover:shadow-[0_15px_40px_rgba(245,236,212,0.3)] aspect-[4/3] flex items-center justify-center group"
                            >
                                <div className="text-center p-8">
                                    <h3 className={`text-3xl text-[#f5ecd4] mb-3 ${lora.className}`}>Merry Medley</h3>
                                    <p className="text-white/80 text-lg">5 Custom Personalised Songs</p>
                                    <div className="mt-6 text-4xl font-bold text-white">€87</div>
                                    <div className="mt-2 text-[#f5ecd4] font-medium bg-[#f5ecd4]/10 px-3 py-1 rounded-full inline-block">Save €98!</div>
                                </div>
                            </div>
                            <div className="flex justify-center">
                                <button
                                    onClick={() => handleSelect('holiday-hamper')}
                                    className={`inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium h-14 px-10 w-full bg-[#f5ecd4] hover:bg-[#fff9e6] text-[#1a3d5f] rounded-xl shadow-[0_4px_15px_rgba(245,236,212,0.4)] hover:shadow-[0_6px_20px_rgba(245,236,212,0.6)] transform hover:scale-[1.02] transition-all duration-200 text-xl ${lora.className}`}
                                >
                                    Select Merry Medley
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
