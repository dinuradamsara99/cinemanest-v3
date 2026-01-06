"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { RequestMovieForm } from "./RequestMovieForm";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { Video } from "lucide-react";

export function RequestMovieDialog({ children }: { children?: React.ReactNode }) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <SidebarMenuButton tooltip="Request Movie">
                        <Video className="h-4.5 w-4.5 text-zinc-500" />
                        <span>Request Movie</span>
                    </SidebarMenuButton>
                )}
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[90vh] border-zinc-800 bg-zinc-950 p-0 overflow-hidden">
                <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2">
                    <DialogTitle className="text-lg sm:text-xl font-bold text-white">Request a Movie or Show</DialogTitle>
                    <DialogDescription className="text-sm text-zinc-400">
                        Can't find what you're looking for? Let us know!
                    </DialogDescription>
                </DialogHeader>
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 max-h-[70vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <RequestMovieForm className="border-0 shadow-none bg-transparent p-0" onSuccess={() => setOpen(false)} />
                </div>
            </DialogContent>
        </Dialog>
    );
}
