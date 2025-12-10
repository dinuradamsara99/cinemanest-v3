import { notFound } from "next/navigation";
import { getMovieBySlug, getAllMovieSlugs } from "@/lib/sanity";
import WatchPageClient from "./WatchPageClient";

type Props = {
  params: Promise<{ slug: string }>;
};

// Add generateStaticParams function for static export
export async function generateStaticParams() {
  const slugs = await getAllMovieSlugs();
  return slugs.map((slug: string) => ({
    slug,
  }));
}

export default async function WatchPage({ params }: Props) {
  const { slug } = await params;

  const movieData = await getMovieBySlug(slug);

  if (!movieData) {
    notFound();
  }

  return (
    <WatchPageClient movie={movieData} />
  );
}
