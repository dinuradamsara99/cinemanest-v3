import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function MediaCardSkeleton() {
    return (
        <div className="group block">
            <Card className="overflow-hidden border-0 bg-card">
                <CardContent className="p-0 relative aspect-[2/3]">
                    <Skeleton className="w-full h-full" />
                </CardContent>
            </Card>
            <div className="mt-2 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        </div>
    );
}
