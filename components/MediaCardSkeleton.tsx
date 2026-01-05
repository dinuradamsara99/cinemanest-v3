import { Skeleton } from "@/components/ui/skeleton";
interface MediaCardSkeletonProps {
    aspectRatio?: string;
}

export function MediaCardSkeleton({ aspectRatio = "2/3" }: MediaCardSkeletonProps) {
    return (
        <div className="group block">
            <div
                className="relative w-full rounded-2xl overflow-hidden bg-zinc-900 shadow-md ring-1 ring-white/5" style={{ aspectRatio }}
            >
                <Skeleton className="absolute inset-0 w-full h-full rounded-none opacity-20" />
            </div>
            <div className="mt-2 space-y-1">
                <Skeleton className="h-4 w-3/4 " />
                <Skeleton className="h-3 w-1/2" />
            </div>
        </div>
    );
}
