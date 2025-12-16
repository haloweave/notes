import { cn } from "@/lib/utils";

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: "xs" | "sm" | "md" | "lg";
    variant?: "dots" | "pulse" | "spin";
    color?: "primary" | "white" | "current" | "muted";
    customColor?: string; // Custom CSS color value
}

const sizeClasses = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
};

const dotSizeClasses = {
    xs: "h-1 w-1",
    sm: "h-1.5 w-1.5",
    md: "h-2 w-2",
    lg: "h-2.5 w-2.5",
};

const colorClasses = {
    primary: {
        dots: "bg-[#F5E6B8]",
        pulse: "bg-[#F5E6B8]",
        spin: "border-[#F5E6B8] border-t-transparent"
    },
    white: {
        dots: "bg-white",
        pulse: "bg-white",
        spin: "border-white border-t-transparent"
    },
    current: {
        dots: "bg-current",
        pulse: "bg-current",
        spin: "border-current border-t-transparent"
    },
    muted: {
        dots: "bg-muted-foreground",
        pulse: "bg-muted-foreground",
        spin: "border-muted-foreground border-t-transparent"
    }
};

export function LoadingSpinner({
    size = "sm",
    variant = "dots",
    color = "primary",
    customColor,
    className,
    ...props
}: LoadingSpinnerProps) {
    if (variant === "dots") {
        return (
            <div className={cn("flex items-center justify-center gap-1", className)} {...props}>
                <div className={cn(
                    "rounded-full animate-bounce",
                    !customColor && colorClasses[color].dots,
                    dotSizeClasses[size]
                )} style={{
                    animationDelay: "0ms",
                    backgroundColor: customColor || undefined
                }} />
                <div className={cn(
                    "rounded-full animate-bounce",
                    !customColor && colorClasses[color].dots,
                    dotSizeClasses[size]
                )} style={{
                    animationDelay: "150ms",
                    backgroundColor: customColor || undefined
                }} />
                <div className={cn(
                    "rounded-full animate-bounce",
                    !customColor && colorClasses[color].dots,
                    dotSizeClasses[size]
                )} style={{
                    animationDelay: "300ms",
                    backgroundColor: customColor || undefined
                }} />
                <span className="sr-only">Loading...</span>
            </div>
        );
    }

    if (variant === "pulse") {
        return (
            <div
                className={cn(
                    "rounded-full animate-pulse opacity-75",
                    !customColor && colorClasses[color].pulse,
                    sizeClasses[size],
                    className
                )}
                style={{
                    backgroundColor: customColor || undefined
                }}
                {...props}
            >
                <span className="sr-only">Loading...</span>
            </div>
        );
    }

    // Default spin variant - improved design
    return (
        <div
            className={cn(
                "animate-spin rounded-full border opacity-60",
                !customColor && colorClasses[color].spin,
                sizeClasses[size],
                className
            )}
            style={{
                borderWidth: size === "xs" ? "1px" : size === "sm" ? "1.5px" : "2px",
                borderColor: customColor || undefined,
                borderTopColor: customColor ? 'transparent' : undefined
            }}
            {...props}
        >
            <span className="sr-only">Loading...</span>
        </div>
    );
}
