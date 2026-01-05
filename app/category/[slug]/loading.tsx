import { ContentGrid } from "@/components/ContentGrid";
import { MediaCardSkeleton } from "@/components/MediaCardSkeleton";

export default function CategoryLoading() {
  return (
    <main className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Category Header Skeleton */}
        <div className="mb-12 text-center">
          <div className="h-10 bg-zinc-700 rounded w-64 mx-auto mb-4"></div>
          <div className="h-4 bg-zinc-700 rounded w-96 mx-auto mb-6"></div>
          <div className="h-1 bg-zinc-700 rounded w-24 mx-auto"></div>
        </div>

        {/* Category Content Grid Skeleton */}
        <ContentGrid title="Loading...">
          {Array.from({ length: 10 }).map((_, index) => (
            <MediaCardSkeleton key={index} />
          ))}
        </ContentGrid>
      </div>
    </main>
  );
}