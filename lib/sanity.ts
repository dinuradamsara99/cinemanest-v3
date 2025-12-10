import { createClient, type ClientConfig } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";

// Sanity client configuration
const config: ClientConfig = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  useCdn: true,
  // Add better error handling
  perspective: "published",
  stega: {
    enabled: false,
  },
};

export const client = createClient(config);

// Add a helper function for safer data fetching
export async function safeFetch<T>(
  query: string,
  params: Record<string, any> = {}
): Promise<T | null> {
  try {
    const result = await client.fetch<T>(query, params);
    return result;
  } catch (error) {
    console.error("Sanity fetch error:", error);
    // Better error handling for different error types
    if (error instanceof Error) {
      console.error("Sanity fetch error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    } else if (typeof error === "object" && error !== null) {
      console.error("Sanity fetch error object:", JSON.stringify(error));
    } else {
      console.error("Sanity fetch unknown error:", error);
    }
    // Return null or a default value instead of throwing
    return null;
  }
}

// Image URL builder
const builder = imageUrlBuilder(client);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

// GROQ Queries - Base fields for both movies and TV shows
const BASE_FIELDS = `
  _id,
  _type,
  title,
  slug,
  posterImage {
    asset->,
    alt
  },
  bannerImage {
    asset->,
    alt
  },
  rating,
  isFeatured,
  isTrending,
  description,
  releaseYear,
  genre,
  language-> {
    _id,
    title,
    slug
  }
`;

// Movie specific fields
const MOVIE_FIELDS = `
  ${BASE_FIELDS},
  duration,
  videoUrl
`;

// TV Show specific fields
const TVSHOW_FIELDS = `
  ${BASE_FIELDS},
  seasons[] {
    _key,
    seasonNumber,
    title,
    episodes[] {
      _key,
      episodeNumber,
      title,
      thumbnail {
        asset->
      },
      videoUrl,
      duration
    }
  }
`;

// Fetch all movie and TV show slugs for static generation
export async function getAllMovieSlugs() {
  const query = `*[_type == "movie" || _type == "tvshow"][].slug.current`;
  return safeFetch<string[]>(query) || [];
}

// Fetch all language slugs for static generation
export async function getAllLanguageSlugs() {
  const query = `*[_type == "language"][].slug.current`;
  return safeFetch<string[]>(query) || [];
}

// Fetch all category slugs for static generation
export async function getAllCategorySlugs() {
  const query = `*[_type == "category"][].slug.current`;
  return safeFetch<string[]>(query) || [];
}

// Fetch featured content (movies + tv shows) for hero section
export async function getFeaturedMovies() {
  const query = `*[(_type == "movie" || _type == "tvshow") && isFeatured == true] | order(_createdAt desc) {
    ${BASE_FIELDS},
    duration,
    videoUrl,
    seasons[] {
      _key,
      seasonNumber,
      title,
      episodes[] {
        _key,
        episodeNumber,
        title,
        thumbnail { asset-> },
        videoUrl,
        duration
      }
    }
  }`;

  return safeFetch<any[]>(query) || [];
}

// Fetch all movies with optional limit
export async function getMovies(limit = 50) {
  const query = `*[_type == "movie"] | order(_createdAt desc) [0...${limit}] {
    ${MOVIE_FIELDS}
  }`;

  return safeFetch<any[]>(query) || [];
}

// Fetch all TV shows with optional limit
export async function getTVShows(limit = 50) {
  const query = `*[_type == "tvshow"] | order(_createdAt desc) [0...${limit}] {
    ${TVSHOW_FIELDS}
  }`;

  return safeFetch<any[]>(query) || [];
}

// Fetch a single movie by slug
export async function getMovieBySlug(slug: string) {
  // First try to find as movie
  const movieQuery = `*[_type == "movie" && slug.current == $slug][0] {
    ${MOVIE_FIELDS}
  }`;
  const movie = await safeFetch<any>(movieQuery, { slug });

  if (movie) return { ...movie, contentType: "movie" };

  // If not found, try as TV show
  const tvShowQuery = `*[_type == "tvshow" && slug.current == $slug][0] {
    ${TVSHOW_FIELDS}
  }`;
  const tvShow = await safeFetch<any>(tvShowQuery, { slug });

  if (tvShow) return { ...tvShow, contentType: "tvshow" };

  return null;
}

// Fetch movies by category
export async function getMoviesByCategory(categorySlug: string) {
  const query = `*[_type == "category" && slug.current == $categorySlug][0] {
    title,
    description,
    "movies": movies[]->{
      ${MOVIE_FIELDS}
    }
  }`;

  return safeFetch<any>(query, { categorySlug });
}

// Fetch all categories
export async function getCategories() {
  const query = `*[_type == "category"] | order(title asc) {
    _id,
    title,
    slug,
    description,
    "movieCount": count(movies)
  }`;

  return safeFetch<any[]>(query) || [];
}

// Fetch all languages
export async function getLanguages() {
  const query = `*[_type == "language"] | order(title asc) {
    _id,
    title,
    slug
  }`;

  return safeFetch<any[]>(query) || [];
}

// Fetch movies by language
export async function getMoviesByLanguage(languageSlug: string) {
  const query = `*[_type == "movie" && language->slug.current == $languageSlug] | order(_createdAt desc) {
    ${MOVIE_FIELDS}
  }`;

  return safeFetch<any[]>(query, { languageSlug }) || [];
}

// Fetch trending content (movies + tv shows)
export async function getTrendingMovies(limit = 12) {
  const query = `*[(_type == "movie" || _type == "tvshow") && isTrending == true] | order(_createdAt desc) [0...${limit}] {
    ${BASE_FIELDS},
    duration,
    videoUrl,
    seasons[] {
      _key,
      seasonNumber,
      title,
      episodes[] {
        _key,
        episodeNumber,
        title,
        thumbnail { asset-> },
        videoUrl,
        duration
      }
    }
  }`;

  return safeFetch<any[]>(query) || [];
}

// Fetch recently added content (movies + tv shows)
export async function getRecentlyAddedMovies(limit = 12) {
  const query = `*[_type == "movie" || _type == "tvshow"] | order(_createdAt desc) [0...${limit}] {
    ${BASE_FIELDS},
    duration,
    videoUrl,
    seasons[] {
      _key,
      seasonNumber,
      title,
      episodes[] {
        _key,
        episodeNumber,
        title,
        thumbnail { asset-> },
        videoUrl,
        duration
      }
    }
  }`;

  return safeFetch<any[]>(query) || [];
}

// Search movies and TV shows by title
export async function searchMovies(searchQuery: string) {
  const query = `*[(_type == "movie" || _type == "tvshow") && title match $searchQuery + "*"] | order(isFeatured desc, _createdAt desc) [0...8] {
    _id,
    _type,
    title,
    slug,
    "posterImage": posterImage {
      asset -> {
        _id,
        url
      },
      alt
    },
    rating,
    releaseYear
  }`;

  return safeFetch<any[]>(query, { searchQuery }) || [];
}
