"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, Mail } from "lucide-react";

interface LoginFormProps {
    onSuccess?: () => void;
    onSwitchToRegister?: () => void;
    onClose?: () => void;
}

export function LoginForm({ onSuccess, onSwitchToRegister, onClose }: LoginFormProps = {}) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        if (!email || !password) {
            setError("Please fill in all fields.");
            setIsLoading(false);
            return;
        }

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid credentials. Please try again.");
            } else {
                router.refresh();
                if (onSuccess) {
                    onSuccess();
                } else {
                    router.push("/account");
                }
            }
        } catch (error) {
            setError("An unexpected error occurred.");
        } finally {
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

            <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-zinc-400 text-sm">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm text-zinc-300">
                        Email
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        disabled={isLoading}
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-[#333] focus:ring-[#333]"
                    />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm text-zinc-300">
                        Password
                    </Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            disabled={isLoading}
                            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-[#333] focus:ring-[#333] pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                            tabIndex={-1}
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {error}
                    </div>
                )}

                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-white border-[#333] hover:bg-[#cccc] text-black h-11"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Signing in..
                        </>
                    ) : (
                        "Sign In"
                    )}
                </Button>

                {/* Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-zinc-700"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-zinc-900 px-2 text-zinc-500">Or continue with</span>
                    </div>
                </div>

                {/* Google Login Button */}
                <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading}
                    onClick={() => signIn('google', { callbackUrl: '/account' })}
                    className="w-full bg-white/5 border-zinc-700 text-white hover:bg-white/10 h-11 flex items-center justify-center gap-3"
                >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.71 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4" />
                        <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.57C14.72 18.23 13.47 18.62 12 18.62C9.14 18.62 6.71 16.6 5.83 13.95H2.18V16.71C4 20.34 7.7 23 12 23Z" fill="#34A853" />
                        <path d="M5.83 13.95C5.62 13.36 5.49 12.72 5.49 12C5.49 11.28 5.62 10.64 5.83 10.05V7.29H2.18C1.43 8.78 1 10.43 1 12.25C1 14.07 1.43 15.72 2.18 17.21L5.83 13.95Z" fill="#FBBC05" />
                        <path d="M12 4.75C13.7 4.75 15.2 5.43 16.33 6.71L19.36 3.68C17.46 1.88 14.97 1 12 1C7.7 1 4 3.66 2.18 7.29L5.83 10.05C6.71 7.4 9.14 4.75 12 4.75Z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
                <p className="text-zinc-500 text-sm">
                    Don't have an account?{" "}
                    <button
                        type="button"
                        onClick={onSwitchToRegister || (() => window.location.href = "/register")}
                        className="text-white hover:text-[#cccc] font-medium transition-colors"
                    >
                        Sign up
                    </button>
                </p>
            </div>
        </div>
    );
}

export default LoginForm;