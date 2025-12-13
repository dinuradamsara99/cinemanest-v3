'use client'

import React, { useState, useMemo } from 'react'
import Image from 'next/image'
import { Play, ChevronDown, Search, X } from 'lucide-react'
import { urlFor } from '@/lib/sanity'
import type { Season, Episode } from '@/types/movie'
import styles from './EpisodeList.module.css'

interface EpisodeListProps {
    seasons: Season[]
    currentSeasonIndex: number
    currentEpisodeIndex: number
    onEpisodeSelect: (seasonIndex: number, episodeIndex: number) => void
}

interface SearchResult {
    seasonIndex: number
    episodeIndex: number
    episode: Episode
    seasonNumber: number
}

export default function EpisodeList({
    seasons,
    currentSeasonIndex,
    currentEpisodeIndex,
    onEpisodeSelect,
}: EpisodeListProps) {
    const [selectedSeasonIndex, setSelectedSeasonIndex] = useState(currentSeasonIndex)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [isSearchOpen, setIsSearchOpen] = useState(false)

    const currentSeason = seasons[selectedSeasonIndex]
    const episodes = currentSeason?.episodes || []

    // Search across all seasons and episodes
    const searchResults = useMemo((): SearchResult[] => {
        if (!searchQuery.trim()) return []

        const query = searchQuery.toLowerCase().trim()
        const results: SearchResult[] = []

        seasons.forEach((season, seasonIndex) => {
            season.episodes?.forEach((episode, episodeIndex) => {
                const titleMatch = episode.title.toLowerCase().includes(query)
                const episodeNumMatch = `episode ${episode.episodeNumber}`.includes(query)
                const eNumMatch = `e${episode.episodeNumber}`.toLowerCase() === query
                const seasonEpisodeMatch = `s${season.seasonNumber}e${episode.episodeNumber}`.toLowerCase().includes(query)

                if (titleMatch || episodeNumMatch || eNumMatch || seasonEpisodeMatch) {
                    results.push({
                        seasonIndex,
                        episodeIndex,
                        episode,
                        seasonNumber: season.seasonNumber
                    })
                }
            })
        })

        return results
    }, [searchQuery, seasons])

    const handleSeasonChange = (index: number) => {
        setSelectedSeasonIndex(index)
        setIsDropdownOpen(false)
        setSearchQuery('')
        setIsSearchOpen(false)
    }

    const handleEpisodeClick = (seasonIndex: number, episodeIndex: number) => {
        onEpisodeSelect(seasonIndex, episodeIndex)
        setSearchQuery('')
        setIsSearchOpen(false)
    }

    const handleSearchResultClick = (result: SearchResult) => {
        setSelectedSeasonIndex(result.seasonIndex)
        onEpisodeSelect(result.seasonIndex, result.episodeIndex)
        setSearchQuery('')
        setIsSearchOpen(false)
    }

    const clearSearch = () => {
        setSearchQuery('')
    }

    const toggleSearch = () => {
        setIsSearchOpen(!isSearchOpen)
        if (isSearchOpen) {
            setSearchQuery('')
        }
    }

    const formatDuration = (minutes: number | undefined) => {
        if (!minutes) return ''
        const hrs = Math.floor(minutes / 60)
        const mins = minutes % 60
        if (hrs > 0) {
            return `${hrs}h ${mins}m`
        }
        return `${mins}m`
    }

    if (!seasons || seasons.length === 0) {
        return null
    }

    const showSearchResults = searchQuery.trim().length > 0

    return (
        <div className={styles.container}>
            {/* Header with Season Selector and Search */}
            <div className={styles.header}>
                {/* Season Selector */}
                <div className={`${styles.seasonSelector} ${isSearchOpen ? styles.seasonSelectorHidden : ''}`}>
                    <button
                        className={styles.seasonDropdown}
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        aria-expanded={isDropdownOpen}
                    >
                        <span className={styles.seasonLabel}>
                            S{currentSeason?.seasonNumber}
                            {currentSeason?.title && `: ${currentSeason.title}`}
                        </span>
                        <ChevronDown
                            size={20}
                            className={`${styles.chevron} ${isDropdownOpen ? styles.chevronOpen : ''}`}
                        />
                    </button>

                    {isDropdownOpen && (
                        <div className={styles.dropdownMenu}>
                            {seasons.map((season, index) => (
                                <button
                                    key={season._key}
                                    className={`${styles.dropdownItem} ${index === selectedSeasonIndex ? styles.dropdownItemActive : ''}`}
                                    onClick={() => handleSeasonChange(index)}
                                >
                                    <span>Season {season.seasonNumber}</span>
                                    {season.title && (
                                        <span className={styles.seasonTitle}>{season.title}</span>
                                    )}
                                    <span className={styles.episodeCount}>
                                        {season.episodes?.length || 0} episodes
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Search Toggle Button */}
                <button
                    className={`${styles.searchToggle} ${isSearchOpen ? styles.searchToggleHidden : ''}`}
                    onClick={toggleSearch}
                    aria-label="Search episodes"
                >
                    <Search size={18} />
                </button>

                {/* Search Input - Expanded */}
                <div className={`${styles.searchWrapper} ${isSearchOpen ? styles.searchOpen : ''}`}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search episodes..."
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus={isSearchOpen}
                    />
                    {searchQuery && (
                        <button className={styles.clearBtn} onClick={clearSearch} aria-label="Clear search">
                            <X size={16} />
                        </button>
                    )}
                    <button className={styles.closeSearchBtn} onClick={toggleSearch}>
                        Cancel
                    </button>
                </div>
            </div>

            {/* Search Results */}
            {showSearchResults && (
                <div className={styles.searchResults}>
                    {searchResults.length > 0 ? (
                        <>
                            <div className={styles.searchResultsHeader}>
                                Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                            </div>
                            <div className={styles.searchResultsList}>
                                {searchResults.map((result) => {
                                    const isPlaying =
                                        result.seasonIndex === currentSeasonIndex &&
                                        result.episodeIndex === currentEpisodeIndex

                                    return (
                                        <button
                                            key={`${result.seasonIndex}-${result.episodeIndex}`}
                                            className={`${styles.episodeItem} ${isPlaying ? styles.episodePlaying : ''}`}
                                            onClick={() => handleSearchResultClick(result)}
                                        >
                                            <div className={styles.episodeThumbnail}>
                                                {result.episode.thumbnail?.asset ? (
                                                    <Image
                                                        src={urlFor(result.episode.thumbnail).width(200).height(112).url()}
                                                        alt={result.episode.title}
                                                        fill
                                                        className={styles.thumbnailImage}
                                                        sizes="120px"
                                                    />
                                                ) : (
                                                    <div className={styles.thumbnailPlaceholder}>
                                                        <Play size={20} />
                                                    </div>
                                                )}
                                                {isPlaying && (
                                                    <div className={styles.playingBadge}>
                                                        <Play size={12} fill="currentColor" />
                                                        <span>Playing</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className={styles.episodeInfo}>
                                                <div className={styles.searchResultMeta}>
                                                    S{result.seasonNumber} E{result.episode.episodeNumber}
                                                </div>
                                                <div className={styles.episodeTitle}>{result.episode.title}</div>
                                                {result.episode.duration && (
                                                    <div className={styles.episodeDuration}>
                                                        {formatDuration(result.episode.duration)}
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </>
                    ) : (
                        <div className={styles.noResults}>
                            <Search size={28} />
                            <p>No episodes found for &quot;{searchQuery}&quot;</p>
                            <span>Try searching by episode title or number</span>
                        </div>
                    )}
                </div>
            )}

            {/* Episode List - Show only when not searching */}
            {!showSearchResults && (
                <div className={styles.episodeList}>
                    {episodes.map((episode, index) => {
                        const isPlaying =
                            selectedSeasonIndex === currentSeasonIndex &&
                            index === currentEpisodeIndex

                        return (
                            <button
                                key={episode._key}
                                className={`${styles.episodeItem} ${isPlaying ? styles.episodePlaying : ''}`}
                                onClick={() => handleEpisodeClick(selectedSeasonIndex, index)}
                            >
                                <div className={styles.episodeThumbnail}>
                                    {episode.thumbnail?.asset ? (
                                        <Image
                                            src={urlFor(episode.thumbnail).width(200).height(112).url()}
                                            alt={episode.title}
                                            fill
                                            className={styles.thumbnailImage}
                                            sizes="120px"
                                        />
                                    ) : (
                                        <div className={styles.thumbnailPlaceholder}>
                                            <Play size={20} />
                                        </div>
                                    )}
                                    {isPlaying && (
                                        <div className={styles.playingBadge}>
                                            <Play size={12} fill="currentColor" />
                                            <span>Playing</span>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.episodeInfo}>
                                    <div className={styles.episodeNumber}>
                                        Episode {episode.episodeNumber}
                                    </div>
                                    <div className={styles.episodeTitle}>{episode.title}</div>
                                    {episode.duration && (
                                        <div className={styles.episodeDuration}>
                                            {formatDuration(episode.duration)}
                                        </div>
                                    )}
                                </div>
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
