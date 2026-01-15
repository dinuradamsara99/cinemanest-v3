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
    useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import {
    Home,
    Tv,
    TrendingUp,
    Film,
    Globe,
    Clapperboard,
    Popcorn,
    X,
    ChevronDown,
    Video,
    FileQuestion,
    PlusCircle,
} from "lucide-react";
import { Category, Language } from "@/types/movie";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { RequestMovieDialog } from "@/components/dashboard/RequestMovieDialog";

interface AppSidebarProps {
    categories: Category[];
    languages: Language[];
}

export function AppSidebar({ categories, languages }: AppSidebarProps) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const { isMobile, setOpenMobile } = useSidebar();

    // Collapsible states - default closed
    const [isGenresOpen, setIsGenresOpen] = useState(false);
    const [isLanguagesOpen, setIsLanguagesOpen] = useState(false);

    return (
        <Sidebar className="border-r border-zinc-800 bg-[#09090b]">
            {/* Header Section */}
            <SidebarHeader className="h-16 flex flex-row items-center w-full px-7 border-b border-zinc-800/50">
                {/* Main Flex Container to control alignment */}
                <div className="flex w-full items-center justify-between">

                    {/* Left Side: Logo & Name */}
                    <Link href="/" className="flex items-center gap-3 group">
                        {/* Logo Icon */}
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg">
                            <Image
                                src="/logo.svg"
                                alt="CinemaNest Logo"
                                width={42}
                                height={42}
                                className="object-contain"
                            />
                        </div>

                        {/* Text Details */}
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-white tracking-tight leading-none">
                                CinemaNest
                            </span>
                            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mt-0.5 group-hover:text-zinc-400 transition-colors">
                                Streaming v2.0
                            </span>
                        </div>
                    </Link>

                    {/* Right Side: Mobile Close Button */}
                    {isMobile && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpenMobile(false);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all"
                            aria-label="Close menu"
                            type="button"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}
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
                            {session?.user && (
                                <NavItem
                                    href="/account"
                                    icon={Popcorn}
                                    title="My Requests"
                                    active={pathname?.startsWith("/account") ?? false}
                                />
                            )}
                            <RequestMovieDialog>
                                <SidebarMenuButton
                                    tooltip="Request Movie"
                                    className="h-10 text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-all rounded-md mb-1"
                                >
                                    <PlusCircle className="h-4.5 w-4.5 text-zinc-500" />
                                    <span>Movies Request & Find</span>
                                </SidebarMenuButton>
                            </RequestMovieDialog>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator className="bg-zinc-800/50 my-4 mx-2" />

                {/* Categories Group */}
                <SidebarGroup>
                    <SidebarGroupLabel
                        className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-2 mb-2 flex items-center justify-between cursor-pointer hover:text-zinc-300 transition-colors"
                        onClick={() => setIsGenresOpen(!isGenresOpen)}
                    >
                        <div className="flex items-center gap-2">
                            <Film className="h-3.5 w-3.5" />
                            Genres
                        </div>
                        <ChevronDown
                            className={cn(
                                "h-4 w-4 transition-transform duration-200",
                                isGenresOpen ? "rotate-0" : "-rotate-90"
                            )}
                        />
                    </SidebarGroupLabel>

                    {isGenresOpen && (
                        <SidebarGroupContent>
                            {/* Tree View Line Adjustment */}
                            <SidebarMenu className="space-y-0.5 border-l-2 border-zinc-800 ml-3.5 pl-3 animate-in slide-in-from-top-2 duration-200">
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
                    )}
                </SidebarGroup>

                {/* Languages Group */}
                <SidebarGroup>
                    <SidebarGroupLabel
                        className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-2 mb-2 flex items-center justify-between cursor-pointer hover:text-zinc-300 transition-colors"
                        onClick={() => setIsLanguagesOpen(!isLanguagesOpen)}
                    >
                        <div className="flex items-center gap-2">
                            <Globe className="h-3.5 w-3.5" />
                            Languages
                        </div>
                        <ChevronDown
                            className={cn(
                                "h-4 w-4 transition-transform duration-200",
                                isLanguagesOpen ? "rotate-0" : "-rotate-90"
                            )}
                        />
                    </SidebarGroupLabel>

                    {isLanguagesOpen && (
                        <SidebarGroupContent>
                            {/* Tree View Line Adjustment */}
                            <SidebarMenu className="space-y-0.5 border-l-2 border-zinc-800 ml-3.5 pl-3 animate-in slide-in-from-top-2 duration-200">
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
                    )}
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