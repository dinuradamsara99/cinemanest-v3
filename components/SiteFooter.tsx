"use client";

import Link from "next/link";
import { MessageSquare, Shield } from "lucide-react";

export function SiteFooter() {
    return (
        <footer className="mt-auto border-t border-zinc-800/50 bg-zinc-950/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Left Side - Copyright */}
                    <div className="text-center md:text-left">
                        <p className="text-sm text-zinc-500">
                            © {new Date().getFullYear()} CinemaNest. All rights reserved.
                        </p>
                    </div>

                    {/* Right Side - Links */}
                    <div className="flex items-center gap-6">
                        <Link
                            href="/privacy"
                            className="group flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
                        >

                            <span>Privacy Policy</span>
                        </Link>
                        <span className="text-zinc-700">•</span>

                        <Link
                            href="/terms"
                            className="group flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
                        >

                            <span>
                                Terms of Service</span>
                        </Link>

                        <span className="text-zinc-700">•</span>

                        <Link
                            href="/contact"
                            className="group flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
                        >

                            <span>
                                Contact Us</span>
                        </Link>


                    </div>
                </div>

                {/* Additional Info */}
                <div className="mt-6 pt-6 border-t border-zinc-800/30">
                    <p className="text-xs text-center text-zinc-600">
                        CinemaNest is your premium destination for streaming movies and TV shows. Stream in HD quality across all your devices.
                    </p>
                </div>
            </div>
        </footer>
    );
}
