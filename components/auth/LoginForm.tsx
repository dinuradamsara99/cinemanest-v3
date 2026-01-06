"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface LoginFormProps {
    onSuccess?: () => void;
    onClose?: () => void;
}

export function LoginForm({ onSuccess, onClose }: LoginFormProps = {}) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            await signIn("google", { callbackUrl: window.location.href });
        } catch (error) {
            console.error("Login error:", error);
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-8 bg-zinc-900 rounded-2xl border border-zinc-800 relative">
            {/* Close Button */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 z-10 rounded-full p-1.5 bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all duration-200 border border-zinc-700/50 hover:border-zinc-600"
                    aria-label="Close"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            )}

            {/* Header */}
            <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Welcome to CinemaNest</h2>
                <p className="text-zinc-400 text-sm">Sign in with Google to continue</p>
            </div>

            {/* Google Sign In Button */}
            <Button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full h-12 bg-white hover:bg-zinc-100 text-black font-medium"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Signing in...
                    </>
                ) : (
                    <>
                        <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Continue with Google
                    </>
                )}
            </Button>

            {/* Terms & Privacy */}
            <p className="mt-6 text-center text-xs text-zinc-500">
                By continuing, you agree to our{" "}
                <a href="/terms" className="text-zinc-400 hover:text-white underline">
                    Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="text-zinc-400 hover:text-white underline">
                    Privacy Policy
                </a>
            </p>
        </div>
    );
}
