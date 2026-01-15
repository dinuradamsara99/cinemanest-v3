"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";

interface ForgotPasswordFormProps {
    onClose?: () => void;
    onSwitchToLogin?: () => void;
}

type Step = "email" | "otp" | "password" | "success";

export function ForgotPasswordForm({ onClose, onSwitchToLogin }: ForgotPasswordFormProps) {
    const [step, setStep] = useState<Step>("email");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [resetToken, setResetToken] = useState<string | null>(null);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Focus first OTP input when step changes to OTP
    useEffect(() => {
        if (step === "otp" && otpInputRefs.current[0]) {
            otpInputRefs.current[0].focus();
        }
    }, [step]);

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error);
                setIsLoading(false);
                return;
            }

            setStep("otp");
        } catch (error) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) {
            // Handle paste
            const pastedValue = value.slice(0, 6).split("");
            const newOtp = [...otp];
            pastedValue.forEach((char, i) => {
                if (index + i < 6 && /^\d$/.test(char)) {
                    newOtp[index + i] = char;
                }
            });
            setOtp(newOtp);
            const nextIndex = Math.min(index + pastedValue.length, 5);
            otpInputRefs.current[nextIndex]?.focus();
            return;
        }

        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const otpValue = otp.join("");
        if (otpValue.length !== 6) {
            setError("Please enter the complete 6-digit code");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp: otpValue })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error);
                setIsLoading(false);
                return;
            }

            setResetToken(data.resetToken);
            setStep("password");
        } catch (error) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    resetToken,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error);
                setIsLoading(false);
                return;
            }

            setStep("success");
        } catch (error) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setIsLoading(true);
        setError(null);
        setOtp(["", "", "", "", "", ""]);

        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                setError(null);
            }
        } catch (error) {
            setError("Failed to resend code");
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            )}

            {/* Step: Email */}
            {step === "email" && (
                <>
                    <div className="mb-6 text-center">
                        <h2 className="text-2xl font-bold text-white mb-2">Forgot Password?</h2>
                        <p className="text-zinc-400 text-sm">Enter your email to receive a reset code</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="reset-email" className="text-zinc-300 text-sm">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <Input
                                    id="reset-email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 h-11 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-primary/50"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending code...
                                </>
                            ) : (
                                "Send Reset Code"
                            )}
                        </Button>
                    </form>

                    {onSwitchToLogin && (
                        <button
                            type="button"
                            onClick={onSwitchToLogin}
                            className="mt-6 w-full flex items-center justify-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </button>
                    )}
                </>
            )}

            {/* Step: OTP */}
            {step === "otp" && (
                <>
                    <div className="mb-6 text-center">
                        <h2 className="text-2xl font-bold text-white mb-2">Enter Code</h2>
                        <p className="text-zinc-400 text-sm">
                            We sent a 6-digit code to <br />
                            <span className="text-white font-medium">{email}</span>
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleOtpSubmit} className="space-y-6">
                        <div className="flex justify-center gap-2">
                            {otp.map((digit, index) => (
                                <Input
                                    key={index}
                                    ref={(el) => { otpInputRefs.current[index] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                    className="w-11 h-12 text-center text-lg font-semibold bg-zinc-800/50 border-zinc-700 text-white focus-visible:ring-primary/50"
                                />
                            ))}
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading || otp.join("").length !== 6}
                            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                "Verify Code"
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-zinc-500 text-sm">
                            Didn't receive the code?{" "}
                            <button
                                type="button"
                                onClick={handleResendOTP}
                                disabled={isLoading}
                                className="text-primary hover:text-primary/80 font-medium"
                            >
                                Resend
                            </button>
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setStep("email")}
                        className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Change email
                    </button>
                </>
            )}

            {/* Step: Password */}
            {step === "password" && (
                <>
                    <div className="mb-6 text-center">
                        <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
                        <p className="text-zinc-400 text-sm">Enter your new password</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-password" className="text-zinc-300 text-sm">New Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <Input
                                    id="new-password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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
                            <Label htmlFor="confirm-new-password" className="text-zinc-300 text-sm">Confirm Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <Input
                                    id="confirm-new-password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                            disabled={isLoading}
                            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Resetting...
                                </>
                            ) : (
                                "Reset Password"
                            )}
                        </Button>
                    </form>
                </>
            )}

            {/* Step: Success */}
            {step === "success" && (
                <div className="text-center py-4">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-green-500/20 rounded-full">
                            <CheckCircle2 className="w-8 h-8 text-green-400" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Password Reset!</h2>
                    <p className="text-zinc-400 text-sm mb-6">
                        Your password has been successfully reset. You can now login with your new password.
                    </p>
                    {onSwitchToLogin && (
                        <Button
                            onClick={onSwitchToLogin}
                            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                        >
                            Back to Login
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
