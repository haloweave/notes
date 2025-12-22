'use client';

interface LoadingScreenProps {
    songCount?: number;
    message?: string;
}

export default function LoadingScreen({
    songCount = 1,
    message = "Weaving your story into song..."
}: LoadingScreenProps) {
    return (
        <div className="container mx-auto px-4 md:px-8 flex-1 flex flex-col justify-center items-center relative z-10 py-8 -mt-12 md:-mt-16">

            {/* Mobile Loading Card */}
            <div
                className="md:hidden w-full max-w-md aspect-video rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(135,206,235,0.4),0_0_60px_rgba(135,206,235,0.3)] border-2 border-[#87CEEB]/40"
                style={{
                    backgroundImage: 'url("/web background image.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center'
                }}
            >
                <div className="flex flex-col h-full justify-between p-4">
                    <div className="text-center animate-fade-in">
                        <h2
                            className="text-white text-base mb-1 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
                            style={{ fontFamily: 'Lora, serif' }}
                        >
                            {message}
                        </h2>
                        <p className="text-white text-xs drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                            Creating {songCount} magical {songCount === 1 ? 'song' : 'songs'} just for you...
                        </p>

                        {/* Bouncing Dots */}
                        <div className="flex gap-2 justify-center mt-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-white drop-shadow-lg animate-bounce-1"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-white drop-shadow-lg animate-bounce-2"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-white drop-shadow-lg animate-bounce-3"></div>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-white text-xs drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                            This usually takes 2-3 minutes. We&apos;re pouring our hearts into every note! ✨
                        </p>
                    </div>
                </div>
            </div>

            {/* Desktop Loading Card */}
            <div
                className="hidden md:block w-full max-w-2xl lg:max-w-3xl aspect-video rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(135,206,235,0.4),0_0_60px_rgba(135,206,235,0.3)] border-2 border-[#87CEEB]/40"
                style={{
                    backgroundImage: 'url("/web background image.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center'
                }}
            >
                <div className="flex flex-col h-full justify-end p-6 md:p-10 pb-8 md:pb-12">
                    <div className="text-center animate-fade-in">
                        <h2
                            className="text-white text-xl lg:text-2xl mb-2 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
                            style={{ fontFamily: 'Lora, serif' }}
                        >
                            {message}
                        </h2>
                        <p className="text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                            Creating {songCount} magical {songCount === 1 ? 'song' : 'songs'} just for you...
                        </p>
                    </div>

                    {/* Pulsing Dots */}
                    <div className="flex justify-center mt-5">
                        <div className="flex gap-3">
                            <div className="w-3.5 h-3.5 rounded-full bg-white drop-shadow-lg animate-pulse-1"></div>
                            <div className="w-3.5 h-3.5 rounded-full bg-white drop-shadow-lg animate-pulse-2"></div>
                            <div className="w-3.5 h-3.5 rounded-full bg-white drop-shadow-lg animate-pulse-3"></div>
                        </div>
                    </div>

                    <div className="text-center mt-5">
                        <p className="text-white text-sm drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                            This usually takes 2-3 minutes. We&apos;re pouring our hearts into every note! ✨
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
