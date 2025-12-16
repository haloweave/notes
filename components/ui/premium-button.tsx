import * as React from "react";
import { cn } from "@/lib/utils";
import { Lora } from 'next/font/google';

const lora = Lora({ subsets: ['latin'] });

export interface PremiumButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

const PremiumButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    // Base styles
                    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium",
                    // Disabled state
                    "disabled:pointer-events-none disabled:opacity-50",
                    // SVG handling
                    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
                    // Focus and validation states
                    "outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                    // Size
                    "h-10 has-[>svg]:px-4 px-8 py-6",
                    // Width
                    "w-full max-w-md",
                    // Golden gradient background
                    "bg-gradient-to-br from-[#F5E6B8] to-[#E8D89F]",
                    "hover:from-[#F8F0DC] hover:to-[#E8DCC0]",
                    // Text color
                    "text-[#1a3d5f]",
                    // Shadows
                    "shadow-[0_8px_30px_rgba(245,230,184,0.4)]",
                    "hover:shadow-[0_12px_40px_rgba(245,230,184,0.6)]",
                    "active:shadow-[0_0_40px_rgba(135,206,235,0.8),0_0_20px_rgba(135,206,235,0.6),0_8px_30px_rgba(135,206,235,0.5)]",
                    // Border
                    "border-3 border-[#D4C5A0]",
                    // Border radius
                    "rounded-xl",
                    // Transform and transitions
                    "transform hover:scale-105 active:scale-105 transition-all duration-200",
                    // Text size
                    "text-xl",
                    // Lora font
                    lora.className,
                    className
                )}
                {...props}
            >
                {children}
            </button>
        );
    }
);

PremiumButton.displayName = "PremiumButton";

export { PremiumButton };
