"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from "@/components/ui/sidebar";
import Link from "next/link";
import {
    Home,
    Tv,
    TrendingUp,
    Film,
    Globe,
    Clapperboard,
} from "lucide-react";
import { Category, Language } from "@/types/movie";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
    categories: Category[];
    languages: Language[];
}

export function AppSidebar({ categories, languages }: AppSidebarProps) {
    const pathname = usePathname();

    return (
        <Sidebar className="border-r border-zinc-800 bg-[#09090b]">
            {/* Header Section */}
            <SidebarHeader className="h-16 flex justify-center px-4 border-b border-zinc-800/50">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                        <Clapperboard className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-bold text-white tracking-tight">
                            CinemaNest
                        </span>
                        <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
                            Streaming v2.0
                        </span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="px-3 py-4">
                {/* Main Navigation */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-2 mb-2">
                        Menu
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-1">
                            <NavItem
                                href="/"
                                icon={Home}
                                title="Home"
                                active={pathname === "/"}
                            />
                            <NavItem
                                href="/tv-shows"
                                icon={Tv}
                                title="TV Shows"
                                active={pathname?.startsWith("/tv-shows") ?? false}
                            />
                            <NavItem
                                href="/trending"
                                icon={TrendingUp}
                                title="Trending"
                                active={pathname?.startsWith("/trending") ?? false}
                            />
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator className="bg-zinc-800/50 my-4 mx-2" />

                {/* Categories Group */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-2 mb-2 flex items-center gap-2">
                        <Film className="h-3.5 w-3.5" />
                        Genres
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        {/* Tree View Line Adjustment */}
                        <SidebarMenu className="space-y-0.5 border-l-2 border-zinc-800 ml-3.5 pl-3">
                            {categories?.map((category) => {
                                const isActive = pathname === `/category/${category.slug.current}`;
                                return (
                                    <SidebarMenuItem key={category._id}>
                                        <SidebarMenuButton
                                            asChild
                                            className={cn(
                                                "h-8 w-full justify-start text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-all duration-200",
                                                isActive && "text-white font-medium bg-zinc-800 shadow-sm"
                                            )}
                                        >
                                            <Link href={`/category/${category.slug.current}`} className="flex items-center gap-3">
                                                {/* Consistent Dot Alignment */}
                                                <div className={cn(
                                                    "h-1.5 w-1.5 rounded-full transition-all duration-300",
                                                    isActive ? "bg-primary scale-125 shadow-[0_0_8px_rgba(220,38,38,0.5)]" : "bg-zinc-700 group-hover:bg-zinc-500"
                                                )} />
                                                <span className="line-clamp-1 text-sm">{category.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Languages Group */}
                <SidebarGroup className="mt-4">
                    <SidebarGroupLabel className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-2 mb-2 flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5" />
                        Languages
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        {/* Tree View Line Adjustment */}
                        <SidebarMenu className="space-y-0.5 border-l-2 border-zinc-800 ml-3.5 pl-3">
                            {languages?.map((language) => {
                                const isActive = pathname === `/language/${language.slug.current}`;
                                return (
                                    <SidebarMenuItem key={language._id}>
                                        <SidebarMenuButton
                                            asChild
                                            className={cn(
                                                "h-8 w-full justify-start text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-all duration-200",
                                                isActive && "text-white font-medium bg-zinc-800 shadow-sm"
                                            )}
                                        >
                                            <Link href={`/language/${language.slug.current}`} className="flex items-center gap-3">
                                                <div className={cn(
                                                    "h-1.5 w-1.5 rounded-full transition-all duration-300",
                                                    isActive ? "bg-primary scale-125 shadow-[0_0_8px_rgba(220,38,38,0.5)]" : "bg-zinc-700 group-hover:bg-zinc-500"
                                                )} />
                                                <span className="text-sm">{language.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}

// Reusable NavItem Component
function NavItem({ href, icon: Icon, title, active }: { href: string; icon: any; title: string; active: boolean }) {
    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                asChild
                isActive={active}
                tooltip={title}
                className={cn(
                    "h-10 text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-all rounded-md mb-1",
                    active && "bg-zinc-800 text-white font-medium shadow-sm ring-1 ring-zinc-700"
                )}
            >
                <Link href={href} className="flex items-center gap-3 px-3">
                    <Icon className={cn("h-4.5 w-4.5", active ? "text-primary" : "text-zinc-500")} />
                    <span>{title}</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}