"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ForgotPasswordDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

type Step = 'email' | 'success';

export function ForgotPasswordDialog({ open, onOpenChange }: ForgotPasswordDialogProps) {
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const resetForm = () => {
        setStep('email');
        setEmail('');
        setError('');
        setIsLoading(false);
    };

    const handleClose = () => {
        resetForm();
        onOpenChange(false);
    };

    // Send password reset email with magic link
    const handleSendResetEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;

            setStep('success');
        } catch (err: any) {
            setError(err.message || 'Failed to send reset email. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white">
                        {step === 'email' && 'Forgot Password?'}
                        {step === 'success' && 'Check Your Email'}
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        {step === 'email' && 'Enter your email address and we\'ll send you a password reset link.'}
                        {step === 'success' && 'We\'ve sent a password reset link to your email.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    {/* Step 1: Email Input */}
                    {step === 'email' && (
                        <form onSubmit={handleSendResetEmail} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="reset-email" className="text-zinc-300">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                    <Input
                                        id="reset-email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@example.com"
                                        required
                                        disabled={isLoading}
                                        className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-zinc-600 focus:ring-zinc-600"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-white hover:bg-zinc-100 text-black"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Sending...
                                    </>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </Button>
                        </form>
                    )}

                    {/* Step 2: Success */}
                    {step === 'success' && (
                        <div className="space-y-4 text-center py-4">
                            <div className="flex justify-center">
                                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-zinc-300">
                                    We've sent a password reset link to:
                                </p>
                                <p className="text-white font-semibold">{email}</p>
                                <p className="text-sm text-zinc-400 pt-2">
                                    Click the link in the email to reset your password. The link will expire in 1 hour.
                                </p>
                            </div>
                            <Button
                                onClick={handleClose}
                                className="w-full bg-white hover:bg-zinc-100 text-black"
                            >
                                Got it
                            </Button>
                            <button
                                onClick={() => {
                                    setStep('email');
                                    setError('');
                                }}
                                className="w-full text-xs text-zinc-400 hover:text-white transition-colors"
                            >
                                Didn't receive the email? Try again
                            </button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
