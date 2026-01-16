import { NextRequest, NextResponse } from 'next/server';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type') || 'movie';

    if (!id) {
        return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    if (!TMDB_API_KEY) {
        return NextResponse.json({ error: 'TMDB API key not configured' }, { status: 500 });
    }

    try {
        const response = await fetch(`${TMDB_BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}`, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) {
            return NextResponse.json({ posterUrl: null });
        }

        const data = await response.json();

        if (data.poster_path) {
            return NextResponse.json({
                posterUrl: `${TMDB_POSTER_BASE_URL}${data.poster_path}`
            });
        }

        return NextResponse.json({ posterUrl: null });
    } catch (error) {
        console.error('Error fetching TMDB poster:', error);
        return NextResponse.json({ posterUrl: null });
    }
}
