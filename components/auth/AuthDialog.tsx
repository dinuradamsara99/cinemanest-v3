"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { LoginForm } from "./LoginForm";

interface AuthDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
    const handleSuccess = () => {
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-w-[95vw] md:max-w-[500px] p-0 bg-transparent border-none overflow-hidden [&>button]:hidden"
                onPointerDownOutside={(e) => {
                    // Allow clicking outside to close
                }}
            >
                <VisuallyHidden>
                    <DialogTitle>Login to CinemaNest</DialogTitle>
                </VisuallyHidden>

                <LoginForm
                    onSuccess={handleSuccess}
                    onClose={() => onOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    );
}
