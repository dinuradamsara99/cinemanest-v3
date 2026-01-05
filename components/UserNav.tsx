"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Shield } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface UserNavProps {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
}

export function UserNav({ user }: UserNavProps) {
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        router.push("/");
        router.refresh();
    };

    const getInitials = (name?: string | null) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:ring-2 hover:ring-zinc-700 transition-all">
                    <Avatar className="h-9 w-9 ring-2 ring-zinc-800 hover:ring-zinc-700 transition-all">
                        <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
                        <AvatarFallback className="bg-gradient-to-br from-zinc-700 to-zinc-800 text-white font-bold text-sm">
                            {getInitials(user.name)}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-64 bg-zinc-900/95 backdrop-blur-xl border-zinc-800 rounded-xl shadow-2xl p-2"
                align="end"
                forceMount
            >
                {/* User Info Header */}
                <DropdownMenuLabel className="font-normal px-3 py-3">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 ring-2 ring-zinc-800">
                            <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
                            <AvatarFallback className="bg-gradient-to-br from-zinc-700 to-zinc-800 text-white font-bold">
                                {getInitials(user.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-1 flex-1 min-w-0">
                            <p className="text-sm font-semibold leading-none text-white truncate">
                                {user.name || "User"}
                            </p>
                            <p className="text-xs leading-none text-zinc-500 truncate">
                                {user.email}
                            </p>
                        </div>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="bg-zinc-800 my-2" />

                {/* Menu Items */}
                <DropdownMenuItem
                    className="text-zinc-300 hover:bg-zinc-800/60 hover:text-white cursor-pointer rounded-lg px-3 py-2.5 transition-all focus:bg-zinc-800/60 focus:text-white mb-1"
                    onClick={() => router.push("/account")}
                >
                    <User className="mr-3 h-4 w-4" />
                    <span className="font-medium">My Account</span>
                </DropdownMenuItem>



                <DropdownMenuSeparator className="bg-zinc-800 my-2" />

                {/* Sign Out */}
                <DropdownMenuItem
                    className="text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer rounded-lg px-3 py-2.5 transition-all focus:bg-red-500/10 focus:text-red-300"
                    onClick={handleSignOut}
                >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span className="font-medium">Sign Out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
