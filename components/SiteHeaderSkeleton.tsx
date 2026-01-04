import { Skeleton } from "@/components/ui/skeleton";

export function SiteHeaderSkeleton() {
    return (
        <header className="sticky top-0 z-50 flex h-16 items-center gap-4 px-6 md:px-8 bg-transparent backdrop-blur-md border-b border-zinc-800/50">
            {/* Sidebar Trigger Skeleton */}
            <Skeleton className="h-8 w-8 rounded-md bg-zinc-800" />

            {/* Divider */}
            <div className="h-6 w-[1px] bg-zinc-800" />

            {/* Title Skeleton (Empty for now, matches actual layout) */}
            <div className="h-4 w-0" />

            {/* Search Bar Skeleton */}
            <div className="ml-auto w-full max-w-xs md:max-w-sm flex items-center justify-end">
                {/* Mobile: Search Icon Skeleton */}
                <Skeleton className="h-6 w-6 rounded-full bg-zinc-800 md:hidden" />

                {/* Desktop: Full Search Input Skeleton */}
                <Skeleton className="hidden md:block h-10 w-full rounded-full bg-zinc-800" />
            </div>

            {/* Auth/UserNav Skeleton */}
            <div className="flex items-center gap-2 ml-4">
                <Skeleton className="h-9 w-20 rounded-md bg-zinc-800" /> {/* Login/SignUp or Avatar */}
            </div>
        </header>
    );
}
