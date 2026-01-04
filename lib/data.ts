import { client, getCategories as getSanityCategories, getLanguages as getSanityLanguages } from './sanity';

export interface Movie {
    _id: string;
    title: string;
    slug: { current: string };
    posterImage: any;
    bannerImage?: any;
    rating: number;
    releaseYear?: number;
    duration?: number;
    description?: string;
    genre?: string[];
}

export interface TVShow extends Movie {
    seasons?: any[];
}

export interface Category {
    _id: string;
    title: string;
    slug: { current: string };
}

export interface Language {
    _id: string;
    title: string;
    slug: { current: string };
}

export async function getMovies(limit = 12): Promise<Movie[]> {
    const query = `*[_type == "movie"] | order(_createdAt desc) [0...${limit}] {
    _id,
    title,
    slug,
    posterImage,
    bannerImage,
    rating,
    releaseYear,
    duration,
    description,
    genre
  }`;

    return client.fetch(query);
}

export async function getTVShows(limit = 12): Promise<TVShow[]> {
    const query = `*[_type == "tvShow"] | order(_createdAt desc) [0...${limit}] {
    _id,
    title,
    slug,
    posterImage,
    bannerImage,
    rating,
    releaseYear,
    description,
    genre,
    seasons
  }`;

    return client.fetch(query);
}

export async function getFeaturedContent(): Promise<(Movie | TVShow)[]> {
    const query = `*[_type in ["movie", "tvShow"] && rating > 7] | order(rating desc) [0...10] {
    _id,
    _type,
    title,
    slug,
    posterImage,
    bannerImage,
    rating,
    releaseYear,
    description,
    genre
  }`;

    return client.fetch(query);
}

export async function getCategories(): Promise<Category[]> {
    return getSanityCategories();
}

export async function getLanguages(): Promise<Language[]> {
    return getSanityLanguages();
}