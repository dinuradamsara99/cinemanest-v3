"use server";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';

/**
 * Fetches the poster path for a movie or TV show from TMDB
 * Returns the full image URL or null if not found
 */
export async function getTMDBPosterPath(tmdbId: number, type: 'movie' | 'tv' = 'movie'): Promise<string | null> {
    if (!TMDB_API_KEY) {
        console.warn('TMDB_API_KEY is not set');
        return null;
    }

    if (!tmdbId) {
        return null;
    }

    try {
        const response = await fetch(`${TMDB_BASE_URL}/${type}/${tmdbId}?api_key=${TMDB_API_KEY}`, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) {
            console.error(`Failed to fetch TMDB poster for ID ${tmdbId}: ${response.status}`);
            return null;
        }

        const data = await response.json();

        if (data.poster_path) {
            return `${TMDB_POSTER_BASE_URL}${data.poster_path}`;
        }

        return null;
    } catch (error) {
        console.error('Error fetching TMDB poster:', error);
        return null;
    }
}

/**
 * Fetches the backdrop path for a movie or TV show from TMDB
 * Returns the full image URL or null if not found
 */
export async function getTMDBBackdropPath(tmdbId: number, type: 'movie' | 'tv' = 'movie'): Promise<string | null> {
    if (!TMDB_API_KEY) {
        console.warn('TMDB_API_KEY is not set');
        return null;
    }

    if (!tmdbId) {
        return null;
    }

    try {
        const response = await fetch(`${TMDB_BASE_URL}/${type}/${tmdbId}?api_key=${TMDB_API_KEY}`, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) {
            console.error(`Failed to fetch TMDB backdrop for ID ${tmdbId}: ${response.status}`);
            return null;
        }

        const data = await response.json();

        if (data.backdrop_path) {
            // Use original size for banners
            return `https://image.tmdb.org/t/p/original${data.backdrop_path}`;
        }

        return null;
    } catch (error) {
        console.error('Error fetching TMDB backdrop:', error);
        return null;
    }
}

/**
 * Fetches the runtime (duration) for a movie or TV show episode from TMDB
 * Returns duration in minutes or null if not found
 */
export async function getTMDBRuntime(tmdbId: number, type: 'movie' | 'tv' = 'movie'): Promise<number | null> {
    if (!TMDB_API_KEY) {
        console.warn('TMDB_API_KEY is not set');
        return null;
    }

    if (!tmdbId) {
        return null;
    }

    try {
        const response = await fetch(`${TMDB_BASE_URL}/${type}/${tmdbId}?api_key=${TMDB_API_KEY}`, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) {
            console.error(`Failed to fetch TMDB details for ID ${tmdbId}: ${response.status}`);
            return null;
        }

        const data = await response.json();

        if (type === 'movie') {
            return data.runtime || null;
        } else if (type === 'tv') {
            // For TV shows, we usually look for episode_run_time which is an array of runtimes
            // We'll take the average or the first one if available
            if (data.episode_run_time && data.episode_run_time.length > 0) {
                const sum = data.episode_run_time.reduce((a: number, b: number) => a + b, 0);
                return Math.round(sum / data.episode_run_time.length);
            }
        }

        return null;
    } catch (error) {
        console.error('Error fetching TMDB runtime:', error);
        return null;
    }
}
