import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import { useState } from "react";

// Image paths
const logoImage = "/images/huggnote-logo.png";
const giftBoxImage = "/images/gift-box.png";
const musicNotesImage = "/images/music-notes.png";
const bgImage = "/images/background.png";

interface RecipientLandingProps {
    recipientName: string;
    senderName: string;
    onOpenGift: () => void;
    onNavigateHome?: () => void;
}

export function RecipientLanding({
    recipientName = "Sarah",
    senderName = "John",
    onOpenGift,
    onNavigateHome
}: RecipientLandingProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const snowflakes = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        animationDuration: `${8 + Math.random() * 7}s`,
        animationDelay: `${Math.random() * 5}s`,
        opacity: Math.random() * 0.5 + 0.2,
        size: Math.random() * 4 + 2
    }));

    const handleGiftClick = () => {
        console.log("Gift box clicked - connect to video screen");
        onOpenGift();
    };

    return (
        <div
            className="min-h-screen relative flex flex-col items-center justify-center"
            style={{
                backgroundImage: `url(${bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            }}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a2a3f]/50 via-[#0f1e30]/45 to-[#1a2a3f]/50"></div>

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {snowflakes.map((flake) => (
                    <motion.div
                        key={flake.id}
                        className="absolute bg-white rounded-full"
                        style={{
                            left: flake.left,
                            width: `${flake.size}px`,
                            height: `${flake.size}px`,
                            opacity: flake.opacity,
                        }}
                        animate={{
                            y: ['0vh', '100vh'],
                            x: ['-10px', '10px', '-10px']
                        }}
                        transition={{
                            y: {
                                duration: parseFloat(flake.animationDuration),
                                repeat: Infinity,
                                ease: "linear",
                                delay: parseFloat(flake.animationDelay)
                            },
                            x: {
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }
                        }}
                    />
                ))}
            </div>





            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'tween', duration: 0.3 }}
                        className="fixed top-0 right-0 h-full w-80 bg-gradient-to-br from-[#0f2438]/98 to-[#1a3d5f]/98 backdrop-blur-md shadow-2xl z-40 border-l-2 border-[#87CEEB]/20"
                    >
                        <div className="flex flex-col h-full pt-28 pb-8 px-8">
                            <nav className="flex flex-col space-y-2">
                                <p className="text-[#87CEEB] text-sm uppercase tracking-wider mb-4" style={{ fontFamily: "'Lora', serif" }}>
                                    Menu
                                </p>
                                {onNavigateHome && (
                                    <button
                                        onClick={() => { onNavigateHome(); setIsMenuOpen(false); }}
                                        className="text-[#E0F4FF] hover:text-[#F5E6B8] text-lg py-3 px-4 rounded-lg hover:bg-[#E0F4FF]/10 transition-all duration-200 text-left"
                                        style={{ fontFamily: "'Lora', serif" }}
                                    >
                                        To Home
                                    </button>
                                )}
                            </nav>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {isMenuOpen && (
                <div onClick={() => setIsMenuOpen(false)} className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm" />
            )}

            <div className="relative z-10 w-full max-w-4xl px-4">
                <motion.div
                    className="flex justify-center -mt-4 md:-mt-6 mb-2 md:mb-4"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <img
                        src={logoImage}
                        alt="Huggnote"
                        className="h-28 md:h-32 lg:h-[140px] w-auto"
                    />
                </motion.div>

                <motion.div
                    className="text-center mb-4 md:mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                >
                    <h1
                        className="text-[#C0E5F0] md:text-[#B8E0ED] text-xl md:text-3xl lg:text-4xl mb-6 md:mb-10"
                        style={{ fontFamily: "'Lora', serif" }}
                    >
                        Dear {recipientName},
                    </h1>
                    <p
                        className="text-[#F5E6B8] text-3xl md:text-4xl lg:text-5xl"
                        style={{ fontFamily: "'Lora', serif" }}
                    >
                        <span className="md:hidden">A Gift You Won't Forget</span>
                        <span className="hidden md:inline">A Gift You'll Never Forget</span>
                    </p>
                </motion.div>

                <motion.div
                    className="flex flex-col items-center mt-0 md:mt-2"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                >
                    <motion.button
                        onClick={handleGiftClick}
                        className="relative group cursor-pointer focus:outline-none mb-0"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <motion.div
                            className="absolute inset-0 bg-[#87CEEB] rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                            animate={{
                                scale: [1, 1.1, 1],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />

                        <motion.img
                            src={giftBoxImage}
                            alt="Your Bespoke Gift"
                            className="w-40 h-40 md:w-56 md:h-56 lg:w-72 lg:h-72 object-contain relative"
                            animate={{
                                y: [0, -15, 0],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                    </motion.button>

                    <motion.p
                        className="text-white text-sm md:text-base mt-1 md:mt-2 text-center"
                        style={{ fontFamily: "'Lora', serif" }}
                        animate={{
                            opacity: [0.7, 1, 0.7],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        Click to Open
                    </motion.p>

                    <motion.p
                        className="text-[#E8DCC0] text-2xl md:text-4xl lg:text-5xl text-center px-4 mt-2 md:mt-4"
                        style={{ fontFamily: "'Lora', serif" }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                    >
                        Wrapped in Emotion
                    </motion.p>
                </motion.div>
            </div>
        </div>
    );
}
