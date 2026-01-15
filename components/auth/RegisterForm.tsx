"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Lock, Eye, EyeOff, User } from "lucide-react";

interface RegisterFormProps {
    onSuccess?: () => void;
    onClose?: () => void;
    onSwitchToLogin?: () => void;
}

export function RegisterForm({ onSuccess, onClose, onSwitchToLogin }: RegisterFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true);
        setError(null);
        try {
            await signIn("google", { callbackUrl: window.location.href });
        } catch (error) {
            console.error("Google sign in error:", error);
            setError("Failed to sign in with Google");
            setIsGoogleLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        // Validate password length
        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Registration failed");
                setIsLoading(false);
                return;
            }

            // Auto-login after successful registration
            const signInResult = await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                redirect: false
            });

            if (signInResult?.error) {
                setError("Account created! Please sign in.");
                setIsLoading(false);
                if (onSwitchToLogin) onSwitchToLogin();
                return;
            }

            if (signInResult?.ok) {
                router.refresh();
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            console.error("Registration error:", error);
            setError("Something went wrong. Please try again.");
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
            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
                <p className="text-zinc-400 text-sm">Join CinemaNest today</p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
                    {error}
                </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-zinc-300 text-sm">Name <span className="text-zinc-500">(optional)</span></Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <Input
                            id="name"
                            type="text"
                            placeholder="Your name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="pl-10 h-11 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-primary/50"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-zinc-300 text-sm">Email</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <Input
                            id="register-email"
                            type="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="pl-10 h-11 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-primary/50"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-zinc-300 text-sm">Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <Input
                            id="register-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="pl-10 pr-10 h-11 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-primary/50"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    <p className="text-xs text-zinc-500">Minimum 6 characters</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-zinc-300 text-sm">Confirm Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <Input
                            id="confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className="pl-10 pr-10 h-11 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-primary/50"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                        >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={isLoading || isGoogleLoading}
                    className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                        </>
                    ) : (
                        "Create Account"
                    )}
                </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-800"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-zinc-900 px-2 text-zinc-500">Or continue with</span>
                </div>
            </div>

            {/* Google Sign Up Button */}
            <Button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading || isGoogleLoading}
                variant="outline"
                className="w-full h-11 bg-white hover:bg-zinc-100 text-black border-0 font-medium"
            >
                {isGoogleLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing up...
                    </>
                ) : (
                    <>
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
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

            {/* Login Link */}
            {onSwitchToLogin && (
                <p className="mt-6 text-center text-sm text-zinc-400">
                    Already have an account?{" "}
                    <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                        Sign in
                    </button>
                </p>
            )}

            {/* Terms & Privacy */}
            <p className="mt-4 text-center text-xs text-zinc-500">
                By creating an account, you agree to our{" "}
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
