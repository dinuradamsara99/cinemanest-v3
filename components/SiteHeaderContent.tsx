"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/UserNav";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { SearchBar } from "@/components/SearchBar";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function SiteHeaderContent() {
    const { data: session } = useSession();
    const [authDialogOpen, setAuthDialogOpen] = useState(false);
    const [authMode, setAuthMode] = useState<"login" | "register">("login");

    const handleOpenLogin = () => {
        setAuthMode("login");
        setAuthDialogOpen(true);
    };

    const handleOpenRegister = () => {
        setAuthMode("register");
        setAuthDialogOpen(true);
    };

    return (
        <>
            <SidebarTrigger
                className="h-8 w-8 [&_svg]:size-5 text-zinc-400 hover:text-white hover:bg-zinc-800"
            />
            <h1 className="text-sm font-medium text-zinc-200"></h1>

            {/* Search Bar */}
            <SearchBar className="ml-auto w-full max-w-xs md:max-w-sm" />

            {/* Auth UI */}
            <div className="flex items-center gap-2 ml-4">
                {session?.user ? (
                    <UserNav user={session.user} />
                ) : (
                    <>
                        <Button
                            variant="ghost"
                            className="text-zinc-300 hover:text-white hover:bg-zinc-800"
                            onClick={handleOpenLogin}
                        >
                            Login
                        </Button>
                        <Button
                            className="bg-gradient-to-r bg-white hover:bg-[#cccccc] text-black"
                            onClick={handleOpenRegister}
                        >
                            Sign Up
                        </Button>
                    </>
                )}
            </div>

            {/* Auth Dialog */}
            <AuthDialog
                open={authDialogOpen}
                onOpenChange={setAuthDialogOpen}
                defaultMode={authMode}
            />
        </>
    );
}
