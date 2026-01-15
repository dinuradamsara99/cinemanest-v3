"use client";

import Lottie from "lottie-react";
import loadingAnimation from "@/public/loading.json";

interface LottieLoaderProps {
    size?: number;
    className?: string;
    color?: "default" | "blue" | "green" | "red" | "amber" | "primary";
}

// Color filters for different variants
const colorFilters: Record<string, string> = {
    default: "",
    blue: "invert(70%) sepia(93%) saturate(1352%) hue-rotate(196deg) brightness(100%) contrast(101%)",
    green: "invert(57%) sepia(74%) saturate(410%) hue-rotate(93deg) brightness(96%) contrast(91%)",
    red: "invert(27%) sepia(94%) saturate(4000%) hue-rotate(350deg) brightness(95%) contrast(95%)",
    amber: "invert(73%) sepia(68%) saturate(500%) hue-rotate(360deg) brightness(100%) contrast(95%)",
    primary: "invert(48%) sepia(87%) saturate(2000%) hue-rotate(295deg) brightness(95%) contrast(105%)",
};

export function LottieLoader({ size = 64, className = "", color = "default" }: LottieLoaderProps) {
    return (
        <div
            className={`flex items-center justify-center ${className}`}
            style={{
                width: size,
                height: size,
                filter: colorFilters[color] || ""
            }}
        >
            <Lottie
                animationData={loadingAnimation}
                loop={true}
                autoplay={true}
                style={{ width: size, height: size }}
            />
        </div>
    );
}

// Full page loading overlay
export function FullPageLoader() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm">
            <LottieLoader size={120} />
        </div>
    );
}

// Inline loader for buttons and small areas
export function InlineLoader({ size = 20, className = "", color = "default" }: LottieLoaderProps) {
    return <LottieLoader size={size} className={className} color={color} />;
}
