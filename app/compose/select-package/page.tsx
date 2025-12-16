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

        // Navigate to the consolidated create page
        router.push('/compose/create');
    };

    return (
        <div className="text-center space-y-8">
            {/* Title Section */}
            <div className="space-y-3 mb-8 md:mb-12">
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
                        className="cursor-pointer transition-all duration-300 w-[85%] mx-auto bg-transparent rounded-2xl overflow-hidden relative shadow-[0_8px_30px_rgba(135,206,235,0.2)] border-2 border-[#87CEEB]"
                    >
                        <div className="w-full relative">
                            <Image
                                src="/soloSerenade.png"
                                alt="Solo Serenade"
                                width={600}
                                height={800}
                                className="w-full h-auto object-contain"
                                priority
                            />
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <button
                            onClick={() => handleSelect('solo-serenade')}
                            className={`inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium h-12 px-8 w-[85%] bg-gradient-to-r from-[#9FE8E4] to-[#B3E5FC] text-[#1a3d5f] rounded-xl shadow-[0_4px_15px_rgba(135,206,235,0.4)] text-lg border-2 border-[#5A8BA8] ${lora.className}`}
                        >
                            Select Solo Serenade
                        </button>
                    </div>
                </div>

                {/* Merry Medley Card Mobile */}
                <div className="space-y-4 relative pt-4">

                    <div
                        onClick={() => handleSelect('holiday-hamper')}
                        className="cursor-pointer transition-all duration-300 w-[85%] mx-auto bg-transparent rounded-2xl overflow-hidden relative shadow-[0_8px_30px_rgba(245,236,212,0.2)] border-2 border-[#f5ecd4]"
                    >
                        <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-[#f5ecd4] text-[#1a3d5f] px-3 py-1.5 rounded-full shadow-lg border border-[#1a3d5f]/10">
                            <StarIcon className="w-3 h-3 fill-[#1a3d5f]" />
                            <span className={`text-xs font-bold uppercase tracking-wide`}>Best Value</span>
                        </div>

                        <div className="w-full relative">
                            <Image
                                src="/merryMedley.png"
                                alt="Merry Medley"
                                width={600}
                                height={800}
                                className="w-full h-auto object-contain"
                                priority
                            />
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <button
                            onClick={() => handleSelect('holiday-hamper')}
                            className={`inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium h-12 px-8 w-[85%] bg-[#f5ecd4] text-[#1a3d5f] rounded-xl shadow-[0_4px_15px_rgba(245,236,212,0.4)] text-lg border-2 border-[#c9b5a7] ${lora.className}`}
                        >
                            Select Merry Medley
                        </button>
                    </div>
                </div>
            </div>

            {/* Desktop Layout (Grid) */}
            <div className="hidden md:block">
                <div className="grid md:grid-cols-2 gap-4 md:gap-6 max-w-5xl md:max-w-xl lg:max-w-2xl mx-auto">

                    {/* Solo Serenade Column */}
                    <div className="flex flex-col">
                        <div
                            onClick={() => handleSelect('solo-serenade')}
                            className="cursor-pointer transition-all duration-300 w-full hover:-translate-y-2 bg-transparent rounded-2xl overflow-hidden relative shadow-[0_8px_30px_rgba(135,206,235,0.2)] hover:shadow-[0_15px_40px_rgba(135,206,235,0.4)] border-2 border-[#87CEEB] group flex-1"
                        >
                            {/* Image Container - Full display */}
                            <div className="w-full relative">
                                <Image
                                    src="/soloSerenade.png"
                                    alt="Solo Serenade"
                                    width={600}
                                    height={800}
                                    className="w-full h-auto object-contain transform group-hover:scale-105 transition-duration-500"
                                    priority
                                />
                            </div>
                        </div>
                        <div className="flex justify-center mt-6">
                            <button
                                onClick={() => handleSelect('solo-serenade')}
                                className={`inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium h-14 px-10 w-full bg-gradient-to-r from-[#9FE8E4] to-[#B3E5FC] hover:from-[#8EDDF0] hover:to-[#A3D5FC] text-[#1a3d5f] rounded-xl shadow-[0_4px_15px_rgba(135,206,235,0.4)] hover:shadow-[0_6px_20px_rgba(135,206,235,0.6)] transform hover:scale-[1.02] transition-all duration-200 text-xl border-3 border-[#5A8BA8] ${lora.className}`}
                            >
                                Select Solo Serenade
                            </button>
                        </div>
                    </div>

                    {/* Merry Medley Column */}
                    <div className="flex flex-col relative">
                        {/* Best Value Badge */}
                        <div className="absolute -top-6 right-4 z-20 flex items-center gap-2 bg-[#f5ecd4] text-[#1a3d5f] px-4 py-2 rounded-full shadow-xl transform rotate-3 border border-[#1a3d5f]/10">
                            <StarIcon className="w-4 h-4 fill-[#1a3d5f]" />
                            <span className={`text-sm font-bold uppercase tracking-wide`}>Best Value</span>
                        </div>

                        <div
                            onClick={() => handleSelect('holiday-hamper')}
                            className="cursor-pointer transition-all duration-300 w-full hover:-translate-y-2 bg-transparent rounded-2xl overflow-hidden relative shadow-[0_8px_30px_rgba(245,236,212,0.2)] hover:shadow-[0_15px_40px_rgba(245,236,212,0.4)] border-2 border-[#f5ecd4] group flex-1"
                        >
                            {/* Image Container - Full display */}
                            <div className="w-full relative">
                                <Image
                                    src="/merryMedley.png"
                                    alt="Merry Medley"
                                    width={600}
                                    height={800}
                                    className="w-full h-auto object-contain transform group-hover:scale-105 transition-duration-500"
                                    priority
                                />
                            </div>
                        </div>
                        <div className="flex justify-center mt-6">
                            <button
                                onClick={() => handleSelect('holiday-hamper')}
                                className={`inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium h-14 px-10 w-full bg-[#f5ecd4] hover:bg-[#fff9e6] text-[#1a3d5f] rounded-xl shadow-[0_4px_15px_rgba(245,236,212,0.4)] hover:shadow-[0_6px_20px_rgba(245,236,212,0.6)] transform hover:scale-[1.02] transition-all duration-200 text-xl border-3 border-[#c9b5a7] ${lora.className}`}
                            >
                                Select Merry Medley
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
