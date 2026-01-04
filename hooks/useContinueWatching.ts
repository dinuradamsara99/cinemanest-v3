'use client'

import { useMemo } from 'react'
import { useWatchProgress } from '@/context/WatchProgressContext'
import { Movie } from '@/types/movie'
// Utility functions for time and episode formatting
function formatTimeRemaining(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }
  return `${minutes}m remaining`;
}

function formatEpisodeInfo(season: number, episode: number): string {
  return `S${season.toString().padStart(2, '0')}E${episode.toString().padStart(2, '0')}`;
}

interface ContinueWatchingItem {
    movie: Movie
    progress: number
    timeRemaining: string
    episodeInfo?: string
    lastWatched: Date
}

export function useContinueWatching(movies: Movie[]): ContinueWatchingItem[] {
    const { getAllProgress } = useWatchProgress()
    const allProgress = getAllProgress()

    return useMemo(() => {
        const continueWatchingItems: ContinueWatchingItem[] = []

        Object.entries(allProgress).forEach(([contentId, progress]) => {
            // Find the movie that matches this content ID
            const movie = movies.find(m => m._id === contentId)
            
            if (movie && progress.duration > 0) {
                const progressPercentage = (progress.time / progress.duration) * 100
                const timeRemaining = progress.duration - progress.time
                
                // Only include if there's meaningful progress (between 5% and 95%)
                if (progressPercentage > 5 && progressPercentage < 95) {
                    // Determine if it's a TV show episode
                    let episodeInfo: string | undefined
                    
                    if (movie.contentType === 'tvshow' && movie.seasons) {
                        // For TV shows, we'd need to track which episode was watched
                        // For now, we'll show the first episode info
                        const firstSeason = movie.seasons[0]
                        const firstEpisode = firstSeason?.episodes?.[0]
                        if (firstEpisode) {
                            episodeInfo = formatEpisodeInfo(
                                firstSeason.seasonNumber,
                                firstEpisode.episodeNumber
                            )
                        }
                    }

                    continueWatchingItems.push({
                        movie,
                        progress: progressPercentage,
                        timeRemaining: formatTimeRemaining(timeRemaining),
                        episodeInfo,
                        lastWatched: new Date(progress.updatedAt)
                    })
                }
            }
        })

        // Sort by most recently watched
        return continueWatchingItems.sort((a, b) => 
            b.lastWatched.getTime() - a.lastWatched.getTime()
        )
    }, [movies, allProgress])
}

// Helper function to get continue watching data for a specific movie
export function useMovieContinueWatching(movie: Movie) {
    const { getProgress } = useWatchProgress()
    
    return useMemo(() => {
        const progress = getProgress(movie._id)
        
        if (!progress || progress.duration === 0) {
            return null
        }

        const progressPercentage = (progress.time / progress.duration) * 100
        const timeRemaining = progress.duration - progress.time
        
        // Only return if there's meaningful progress
        if (progressPercentage <= 5 || progressPercentage >= 95) {
            return null
        }

        let episodeInfo: string | undefined
        
        if (movie.contentType === 'tvshow' && movie.seasons) {
            const firstSeason = movie.seasons[0]
            const firstEpisode = firstSeason?.episodes?.[0]
            if (firstEpisode) {
                episodeInfo = formatEpisodeInfo(
                    firstSeason.seasonNumber,
                    firstEpisode.episodeNumber
                )
            }
        }

        return {
            progress: progressPercentage,
            timeRemaining: formatTimeRemaining(timeRemaining),
            episodeInfo,
            lastWatched: new Date(progress.updatedAt)
        }
    }, [movie, getProgress])
}
