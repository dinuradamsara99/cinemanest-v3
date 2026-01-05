"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle } from "lucide-react";

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
    onSuccess?: () => void;
    onSwitchToLogin?: () => void;
    onClose?: () => void;
}

export function RegisterForm({ onSuccess, onSwitchToLogin, onClose }: RegisterFormProps = {}) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true);
        setError("");
        setSuccess(false);

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    password: data.password,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                setError(result.error || "Registration failed. Please try again.");
                return;
            }

            setSuccess(true);
            setTimeout(() => {
                if (onSuccess) {
                    onSuccess();
                } else if (onSwitchToLogin) {
                    onSwitchToLogin();
                } else {
                    router.push("/login");
                }
            }, 1500);
        } catch (error) {
            setError("An unexpected error occurred. Please try again.");
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
                <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
                <p className="text-zinc-400 text-sm">Sign up to get started</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Name Field */}
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm text-zinc-300">
                        Full Name
                    </Label>
                    <Input
                        {...register("name")}
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        disabled={isLoading}
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-[#333] focus:ring-[#333]"
                    />
                    {errors.name && (
                        <p className="text-red-400 text-xs">{errors.name.message}</p>
                    )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm text-zinc-300">
                        Email
                    </Label>
                    <Input
                        {...register("email")}
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        disabled={isLoading}
                        className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-[#333] focus:ring-[#333]"
                    />
                    {errors.email && (
                        <p className="text-red-400 text-xs">{errors.email.message}</p>
                    )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm text-zinc-300">
                        Password
                    </Label>
                    <div className="relative">
                        <Input
                            {...register("password")}
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password"
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
                    {errors.password && (
                        <p className="text-red-400 text-xs">{errors.password.message}</p>
                    )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm text-zinc-300">
                        Confirm Password
                    </Label>
                    <div className="relative">
                        <Input
                            {...register("confirmPassword")}
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            disabled={isLoading}
                            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-[#333] focus:ring-[#333] pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                            tabIndex={-1}
                        >
                            {showConfirmPassword ? (
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
                    {errors.confirmPassword && (
                        <p className="text-red-400 text-xs">{errors.confirmPassword.message}</p>
                    )}
                </div>

                {/* Error/Success Messages */}
                {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
                        Account created successfully!
                    </div>
                )}

                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={isLoading || success}
                    className="w-full bg-white border-[#333] hover:bg-[#cccc] text-black h-11"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Creating account..
                        </>
                    ) : (
                        "Create Account"
                    )}
                </Button>
            </form>

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

            {/* Footer */}
            <div className="mt-6 text-center">
                <p className="text-zinc-500 text-sm">
                    Already have an account?{" "}
                    <button
                        type="button"
                        onClick={onSwitchToLogin || (() => window.location.href = "/login")}
                        className="text-white hover:text-[#cccc] font-medium transition-colors"
                    >
                        Sign in
                    </button>
                </p>
            </div>
        </div>
    );
}
