import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarSeparator,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export function AppSidebarSkeleton() {
    return (
        <Sidebar className="border-r border-zinc-800 bg-[#09090b]">
            {/* Header Section Skeleton */}
            <SidebarHeader className="py-4 px-4">
                <div className="flex items-center gap-3 px-2">
                    {/* Logo Skeleton */}
                    <Skeleton className="h-8 w-8 rounded-lg bg-zinc-800" />
                    <div className="flex flex-col gap-1">
                        {/* Brand Name Skeleton */}
                        <Skeleton className="h-4 w-24 bg-zinc-800" />
                        {/* Version Skeleton */}
                        <Skeleton className="h-2 w-12 bg-zinc-800/50" />
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="px-2">
                {/* Main Navigation Skeleton */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs font-medium text-zinc-500 px-2 py-2">
                        <Skeleton className="h-3 w-16 bg-zinc-800" />
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-1">
                            {/* 3 Navigation Items */}
                            {[1, 2, 3].map((i) => (
                                <SidebarMenuItem key={i}>
                                    <div className="flex items-center gap-3 px-3 py-2.5 h-10">
                                        <Skeleton className="h-9 w-9 rounded-lg bg-zinc-800" />
                                        <Skeleton className="h-4 w-20 bg-zinc-800" />
                                    </div>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator className="bg-zinc-800/50 my-2 mx-2" />

                {/* Categories Skeleton */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-lg font-medium mb-2 text-zinc-500 px-2 py-2 flex items-center gap-2">
                        <Skeleton className="h-3.5 w-3.5 bg-zinc-800" />
                        <Skeleton className="h-4 w-24 bg-zinc-800" />
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-0.5 border-l border-zinc-800 ml-3.5 pl-2">
                            {/* 5 Category Items */}
                            {[1, 2, 3, 4, 5].map((i) => (
                                <SidebarMenuItem key={i}>
                                    <div className="flex items-center gap-3 px-3 py-2 h-8">
                                        <Skeleton className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
                                        <Skeleton className="h-3 w-24 bg-zinc-800/70" />
                                    </div>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator className="bg-zinc-800/50 my-2 mx-2" />

                {/* Languages Skeleton */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-lg font-medium text-zinc-500 mb-2 px-2 py-2 flex items-center gap-2">
                        <Skeleton className="h-3.5 w-3.5 bg-zinc-800" />
                        <Skeleton className="h-4 w-24 bg-zinc-800" />
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-0.5 border-l border-zinc-800 ml-3.5 pl-2">
                            {/* 4 Language Items */}
                            {[1, 2, 3, 4].map((i) => (
                                <SidebarMenuItem key={i}>
                                    <div className="flex items-center gap-3 px-3 py-2 h-8">
                                        <Skeleton className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
                                        <Skeleton className="h-3 w-20 bg-zinc-800/70" />
                                    </div>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
