"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        // Check if user has already made a choice
        const cookieConsent = localStorage.getItem("cookieConsent");
        if (!cookieConsent) {
            // Show banner after a short delay for better UX
            setTimeout(() => setIsVisible(true), 1000);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem("cookieConsent", "accepted");
        handleClose();
    };

    const handleDecline = () => {
        localStorage.setItem("cookieConsent", "declined");
        handleClose();
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsVisible(false);
            setIsClosing(false);
        }, 300);
    };

    if (!isVisible) return null;

    return (
        <div
            className={cn(
                "fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 transition-all duration-300",
                isClosing ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
            )}
        >
            <div className="max-w-7xl mx-auto">
                <div className="bg-zinc-900 backdrop-blur-xl border border-zinc-800/50 ring-1 ring-white/5 rounded-2xl p-4 md:p-6 shadow-2xl">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        {/* Icon */}
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center">
                                <Cookie className="w-6 h-6 text-zinc-400" />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-2">
                            <h3 className="text-lg font-semibold text-white">
                                Cookie Notice
                            </h3>
                            <p className="text-sm text-zinc-400 leading-relaxed">
                                We use cookies to enhance your browsing experience, provide personalized content, and analyze our traffic.
                                By clicking "Accept All", you consent to our use of cookies.{" "}
                                <Link
                                    href="/privacy"
                                    className="text-zinc-300 hover:text-white underline underline-offset-2 transition-colors"
                                >
                                    Learn more
                                </Link>
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                            <button
                                onClick={handleDecline}
                                className="px-6 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 transition-all"
                            >
                                Decline
                            </button>
                            <button
                                onClick={handleAccept}
                                className="px-6 py-2.5 rounded-xl text-sm font-medium bg-white text-black hover:bg-zinc-100 transition-all shadow-lg"
                            >
                                Accept All
                            </button>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 md:static p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all"
                            aria-label="Close cookie banner"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
