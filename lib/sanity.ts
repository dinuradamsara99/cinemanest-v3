import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";

// Validate environment variables
// Validate environment variables
if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
  console.error("CRITICAL: Missing NEXT_PUBLIC_SANITY_PROJECT_ID environment variable");
}
if (!process.env.NEXT_PUBLIC_SANITY_DATASET) {
  console.error("CRITICAL: Missing NEXT_PUBLIC_SANITY_DATASET environment variable");
}

// Sanity client configuration
export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'missing-id',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  useCdn: true,
});

// Image URL builder
const builder = imageUrlBuilder(client);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

// Helper to get file URL from Sanity asset reference
export function getFileUrl(source: any): string | null {
  if (!source) return null;

  // If it's already a full URL, return it
  if (typeof source === 'string' && source.startsWith('http')) {
    return source;
  }

  // Get the asset reference
  let assetRef: string | undefined;

  if (typeof source === 'string') {
    assetRef = source;
  } else if (source._ref) {
    assetRef = source._ref;
  } else if (source.asset?._ref) {
    assetRef = source.asset._ref;
  } else if (source.asset?.url) {
    return source.asset.url;
  }

  if (!assetRef) return null;

  // Parse the asset reference format: file-<id>-<extension>
  if (!assetRef.startsWith('file-')) return null;

  const parts = assetRef.split('-');
  if (parts.length < 3) return null;

  const extension = parts[parts.length - 1];
  const id = parts.slice(1, -1).join('-'); // Handle IDs that might contain dashes

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;

  return `https://cdn.sanity.io/files/${projectId}/${dataset}/${id}.${extension}`;
}


// GROQ Queries - Base fields for both movies and TV shows
const BASE_FIELDS = `
  _id,
  _type,
  title,
  slug,
  posterImage {
    asset,
    alt
  },
  bannerImage {
    asset,
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
  },
  categories[]-> {
    _id,
    title,
    slug
  },
  trailerUrl,
  credit,
  subtitles[] {
    _key,
    label,
    language,
    file {
      asset-> {
        _ref,
        _type,
        url
      }
    },
    isDefault,
    downloadEnabled
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
        asset
      },
      videoUrl,
      duration,
      subtitles[] {
        _key,
        label,
        language,
        file {
          asset-> {
            _ref,
            _type,
            url
          }
        },
        isDefault,
        downloadEnabled
      }
    }
  }
`;

// Fetch all movie and TV show slugs for static generation
export async function getAllMovieSlugs() {
  const query = `*[_type == "movie" || _type == "tvshow"][].slug.current`;
  return client.fetch(query);
}

// Fetch all language slugs for static generation
export async function getAllLanguageSlugs() {
  const query = `*[_type == "language"][].slug.current`;
  return client.fetch(query);
}

// Fetch all category slugs for static generation
export async function getAllCategorySlugs() {
  const query = `*[_type == "category"][].slug.current`;
  return client.fetch(query);
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

  return client.fetch(query);
}

// Fetch all movies with optional limit
export async function getMovies(limit = 50) {
  const query = `*[_type == "movie"] | order(_createdAt desc) [0...${limit}] {
    ${MOVIE_FIELDS}
  }`;

  return client.fetch(query);
}

// Fetch all TV shows with optional limit
export async function getTVShows(limit = 50) {
  const query = `*[_type == "tvshow"] | order(_createdAt desc) [0...${limit}] {
    ${TVSHOW_FIELDS}
  }`;

  return client.fetch(query);
}

// Fetch a single movie by slug
export async function getMovieBySlug(slug: string) {
  // First try to find as movie
  const movieQuery = `*[_type == "movie" && slug.current == $slug][0] {
    ${MOVIE_FIELDS}
  }`;
  const movie = await client.fetch(movieQuery, { slug });

  if (movie) return { ...movie, contentType: "movie" };

  // If not found, try as TV show
  const tvShowQuery = `*[_type == "tvshow" && slug.current == $slug][0] {
    ${TVSHOW_FIELDS}
  }`;
  const tvShow = await client.fetch(tvShowQuery, { slug });

  if (tvShow) return { ...tvShow, contentType: "tvshow" };

  return null;
}

// Fetch movies by category
export async function getMoviesByCategory(categorySlug: string) {
  // First get the category info
  const categoryQuery = `*[_type == "category" && slug.current == $categorySlug][0] {
    title,
    description
  }`;

  // Then get all movies/tv shows that reference this category
  const moviesQuery = `*[(_type == "movie" || _type == "tvshow") && references(*[_type == "category" && slug.current == $categorySlug][0]._id)] | order(_createdAt desc) {
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

  const [category, movies] = await Promise.all([
    client.fetch(categoryQuery, { categorySlug }),
    client.fetch(moviesQuery, { categorySlug })
  ]);

  return {
    ...category,
    movies
  };
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

  return client.fetch(query);
}

// Fetch all languages
export async function getLanguages() {
  const query = `*[_type == "language"] | order(title asc) {
    _id,
    title,
    slug
  }`;

  return client.fetch(query);
}

// Fetch movies by language
export async function getMoviesByLanguage(languageSlug: string) {
  const query = `*[(_type == "movie" || _type == "tvshow") && language->slug.current == $languageSlug] | order(_createdAt desc) {
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

  return client.fetch(query, { languageSlug });
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

  return client.fetch(query);
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

  return client.fetch(query);
}

// Search movies and TV shows by title
export async function searchMovies(searchQuery: string) {
  // Validate and sanitize search query
  const trimmed = searchQuery?.trim() || '';

  // Return empty for invalid queries
  if (trimmed.length < 2 || trimmed.length > 100) {
    return [];
  }

  // Remove GROQ special characters to prevent query manipulation
  const sanitized = trimmed.replace(/[*?[\]{}|\\^$()]/g, '');

  if (sanitized.length < 2) {
    return [];
  }

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

  return client.fetch(query, { searchQuery: sanitized });
}

