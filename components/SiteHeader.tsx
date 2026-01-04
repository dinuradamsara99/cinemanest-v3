"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SiteHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export function SiteHeader({ children, className }: SiteHeaderProps) {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Scroll එක 0 ට වඩා වැඩි නම් (පහළට ගිහින් නම්) true කරමු
            setIsScrolled(window.scrollY > 0);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={cn(
                "sticky top-0 z-50 flex h-16 items-center md:px-8 gap-4 px-6 transition-all duration-300 ease-in-out",
                // Scroll කරලා නැති වෙලාවට (Transparent)
                !isScrolled && "bg-transparent",
                // Scroll කළාම (Solid Color with Blur)
                isScrolled && "bg-[#18181a] backdrop-blur-md border-b border-zinc-800/50 shadow-sm",
                className
            )}
        >
            {children}
        </header>
    );
}