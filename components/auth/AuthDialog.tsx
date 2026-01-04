"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

type AuthMode = "login" | "register";

interface AuthDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultMode?: AuthMode;
}

export function AuthDialog({ open, onOpenChange, defaultMode = "login" }: AuthDialogProps) {
    const [mode, setMode] = useState<AuthMode>(defaultMode);

    // Sync mode with defaultMode when dialog opens
    useEffect(() => {
        if (open) {
            setMode(defaultMode);
        }
    }, [open, defaultMode]);

    const handleSuccess = () => {
        onOpenChange(false);
    };

    const handleSwitchMode = () => {
        setMode(mode === "login" ? "register" : "login");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-w-[95vw] md:max-w-[900px] p-0 bg-transparent border-none overflow-hidden [&>button]:hidden"
                // Hide the default close button since it doesn't work well with transparent bg
                onPointerDownOutside={(e) => {
                    // Allow clicking outside to close
                }}
            >
                <VisuallyHidden>
                    <DialogTitle>
                        {mode === "login" ? "Login to CinemaNest" : "Create CinemaNest Account"}
                    </DialogTitle>
                </VisuallyHidden>

                {mode === "login" ? (
                    <LoginForm
                        onSuccess={handleSuccess}
                        onSwitchToRegister={handleSwitchMode}
                        onClose={() => onOpenChange(false)}
                    />
                ) : (
                    <RegisterForm
                        onSuccess={handleSuccess}
                        onSwitchToLogin={handleSwitchMode}
                        onClose={() => onOpenChange(false)}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
