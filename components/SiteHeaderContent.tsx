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

    const handleOpenLogin = () => {
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
                    <Button
                        variant="ghost"
                        className="bg-gradient-to-r py-3 px-8 from-[#f5f5f5] to-[#cccccc] hover:bg-transparent text-black hover:text-black"
                        onClick={handleOpenLogin}
                    >
                        Login
                    </Button>
                )}
            </div>

            {/* Auth Dialog */}
            <AuthDialog
                open={authDialogOpen}
                onOpenChange={setAuthDialogOpen}
            />
        </>
    );
}
