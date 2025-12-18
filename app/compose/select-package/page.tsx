'use client';

import { useRouter } from 'next/navigation';
import { Lora } from 'next/font/google';
import { Star } from 'lucide-react';

const lora = Lora({ subsets: ['latin'] });

export default function SelectPackagePage() {
    const router = useRouter();

    const handleSelect = (packageId: 'solo-serenade' | 'holiday-hamper') => {
        // Clear previous session data
        sessionStorage.removeItem('songFormData');
        sessionStorage.removeItem('generatedPrompt');
        sessionStorage.removeItem('currentFormId');
        sessionStorage.setItem('selectedPackageId', packageId);
        router.push('/compose/create');
    };

    return (
        <div className="w-full">
            {/* Title Section */}
            <div className="text-center mb-4 md:mb-10 lg:mb-12 space-y-3 md:space-y-4 lg:space-y-5">
                <h1 className="text-[#E8DCC0] text-3xl md:text-3xl lg:text-4xl" style={{ fontFamily: 'Lora, serif' }}>
                    <span className="md:hidden">Select Bespoke Gift</span>
                    <span className="hidden md:inline">Select Your Bespoke Gift</span>
                </h1>
                <p className="text-white/90 md:text-white/80 text-base md:text-lg">
                    Compose one special song or save 58% with a 5-song Merry Medley (2 songs free!)
                </p>
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden space-y-6">
                {/* Solo Serenade */}
                <div className="space-y-4">
                    <div
                        onClick={() => handleSelect('solo-serenade')}
                        className="cursor-pointer transition-all duration-300 w-[85%] mx-auto border-2 rounded-2xl overflow-hidden transform relative border-[#87CEEB] hover:scale-105 hover:shadow-[0_8px_30px_rgba(135,206,235,0.4)]"
                    >
                        <img src="/soloSerenade.png" alt="Solo Serenade - 1 Custom Personalised Song" className="w-full h-auto md:w-[80%] md:mx-auto lg:w-[80%] lg:mx-auto" />
                    </div>
                    <div className="flex justify-center">
                        <button
                            onClick={() => handleSelect('solo-serenade')}
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium outline-none h-10 w-auto bg-gradient-to-br from-[#9FE8E4] to-[#B3E5FC] hover:from-[#B3F0ED] hover:to-[#CCEBFC] text-[#1a3d5f] hover:shadow-[0_0_40px_rgba(135,206,235,0.8),0_0_20px_rgba(135,206,235,0.6),0_8px_30px_rgba(135,206,235,0.4)] rounded-xl transform hover:scale-105 transition-all duration-300 px-8 py-3 text-base border-3 border-[#5A8BA8] shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                            style={{ fontFamily: 'Lora, serif' }}
                        >
                            Select Solo Serenade
                        </button>
                    </div>
                </div>

                {/* Merry Medley */}
                <div className="space-y-4 relative">
                    <div
                        onClick={() => handleSelect('holiday-hamper')}
                        className="absolute -top-3 right-[7.5%] z-20 flex items-center gap-1.5 bg-[#f5ecd4] text-[#1a3d5f] px-3 py-1.5 rounded-full shadow-lg"
                        style={{ fontFamily: 'Lora, serif' }}
                    >
                        <Star className="w-3 h-3 fill-[#1a3d5f] flex-shrink-0" />
                        <span className="text-xs">Best Value</span>
                    </div>
                    <div
                        onClick={() => handleSelect('holiday-hamper')}
                        className="cursor-pointer transition-all duration-300 w-[85%] mx-auto border-2 rounded-2xl overflow-hidden transform relative border-[#f5ecd4] hover:scale-105 hover:shadow-[0_8px_30px_rgba(245,236,212,0.3)]"
                    >
                        <img src="/merryMedley.png" alt="Merry Medley - 5 Custom Personalised Songs" className="w-full h-auto md:w-[80%] md:mx-auto lg:w-[80%] lg:mx-auto" />
                    </div>
                    <div className="flex justify-center">
                        <button
                            onClick={() => handleSelect('holiday-hamper')}
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium outline-none h-10 w-auto bg-[#f5ecd4] hover:bg-[#faf7ed] text-[#1a3d5f] hover:shadow-[0_0_40px_rgba(232,220,192,0.8),0_0_20px_rgba(232,220,192,0.6),0_8px_30px_rgba(232,220,192,0.4)] rounded-xl transform hover:scale-105 transition-all duration-300 px-8 md:px-10 lg:px-12 py-3 md:py-4 text-base md:text-lg border-3 border-[#c9b5a7] shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                            style={{ fontFamily: 'Lora, serif' }}
                        >
                            Select Merry Medley
                        </button>
                    </div>
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:block">
                <div className="grid md:grid-cols-2 gap-6 md:gap-10 lg:gap-12 max-w-5xl md:max-w-xl lg:max-w-3xl mx-auto relative">
                    {/* Solo Image */}
                    <div
                        onClick={() => handleSelect('solo-serenade')}
                        className="cursor-pointer transition-all duration-300 w-full mx-auto border-2 rounded-2xl overflow-hidden transform relative md:p-0 border-[#87CEEB] hover:scale-105 hover:shadow-[0_8px_30px_rgba(135,206,235,0.4)]"
                    >
                        <img src="/soloSerenade.png" alt="Solo Serenade - 1 Custom Personalised Song" className="w-full h-auto md:w-[90%] md:mx-auto lg:w-[90%] lg:mx-auto" />
                    </div>

                    {/* Merry Image + Badge */}
                    <div className="relative">
                        <div className="absolute -top-3 md:-top-5 -right-2 md:-right-4 z-20 flex items-center gap-1.5 md:gap-2 bg-gradient-to-br from-[#b89e8d] to-[#a08977] md:bg-none md:!bg-[#f5ecd4] lg:!bg-[#f5ecd4] text-white md:text-[#1a3d5f] lg:text-[#1a3d5f] px-3 md:px-4 py-1.5 md:py-2 rounded-full shadow-lg" style={{ fontFamily: 'Lora, serif' }}>
                            <Star className="w-3 h-3 md:w-4 md:h-4 fill-white md:fill-[#1a3d5f] lg:fill-[#1a3d5f] flex-shrink-0" />
                            <span className="text-xs md:text-sm">Best Value</span>
                        </div>
                        <div
                            onClick={() => handleSelect('holiday-hamper')}
                            className="cursor-pointer transition-all duration-300 w-full mx-auto border-2 rounded-2xl overflow-hidden transform relative border-[#f5ecd4] hover:scale-105 hover:shadow-[0_8px_30px_rgba(245,236,212,0.3)]"
                        >
                            <img src="/merryMedley.png" alt="Merry Medley - 5 Custom Personalised Songs" className="w-full h-auto md:w-[90%] md:mx-auto lg:w-[90%] lg:mx-auto" />
                        </div>
                    </div>
                </div>

                {/* Desktop Buttons */}
                <div className="grid md:grid-cols-2 gap-6 md:gap-10 lg:gap-12 max-w-5xl md:max-w-xl lg:max-w-3xl mx-auto mt-4 md:mt-5">
                    <div className="flex justify-center">
                        <button
                            onClick={() => handleSelect('solo-serenade')}
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium outline-none h-10 w-auto bg-gradient-to-br from-[#9FE8E4]/70 to-[#B3E5FC]/70 hover:from-[#B3F0ED]/80 hover:to-[#CCEBFC]/80 text-[#1a3d5f] hover:shadow-[0_0_40px_rgba(135,206,235,0.8),0_0_20px_rgba(135,206,235,0.6),0_8px_30px_rgba(135,206,235,0.4)] rounded-xl transform hover:scale-105 transition-all duration-300 px-8 md:px-10 lg:px-12 py-3 md:py-4 text-base md:text-lg border-3 border-[#5A8BA8] shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                            style={{ fontFamily: 'Lora, serif' }}
                        >
                            Select Solo Serenade
                        </button>
                    </div>
                    <div className="flex justify-center">
                        <button
                            onClick={() => handleSelect('holiday-hamper')}
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium outline-none h-10 w-auto bg-gradient-to-br from-[#F5E6B8]/70 to-[#E8DCC0]/70 md:bg-[#f5ecd4] lg:bg-[#f5ecd4] hover:from-[#FFF8E8]/80 hover:to-[#F0E5D0]/80 md:hover:bg-[#faf7ed] lg:hover:bg-[#faf7ed] text-[#1a3d5f] hover:shadow-[0_0_40px_rgba(232,220,192,0.8),0_0_20px_rgba(232,220,192,0.6),0_8px_30px_rgba(232,220,192,0.4)] rounded-xl transform hover:scale-105 transition-all duration-300 px-8 md:px-10 lg:px-12 py-3 md:py-4 text-base md:text-lg border-3 border-[#c9b5a7] shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                            style={{ fontFamily: 'Lora, serif' }}
                        >
                            Select Merry Medley
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
