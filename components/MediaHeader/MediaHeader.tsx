"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Star, Clock, Calendar, Play, Tv } from "lucide-react";
import { urlFor } from "@/lib/sanity";
import type { Movie } from "@/types/movie";
import styles from "./MediaHeader.module.css";

interface MediaHeaderProps {
  movie: Movie;
  isTVShow: boolean;
  onBackClick: () => void;
}

export default function MediaHeader({
  movie,
  isTVShow,
  onBackClick,
}: MediaHeaderProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const languageLabel = movie.language?.title;

  // Truncate description for collapsed view
  const truncateDescription = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <section className={styles.heroSection}>
      <div className={styles.bannerContainer}>
        {movie.bannerImage?.asset ? (
          <Image
            src={urlFor(movie.bannerImage).width(1920).height(900).url()}
            alt={movie.bannerImage.alt || movie.title}
            fill
            className={styles.bannerImage}
            priority
          />
        ) : movie.posterImage?.asset ? (
          <Image
            src={urlFor(movie.posterImage).width(1920).height(900).url()}
            alt={movie.posterImage.alt || movie.title}
            fill
            className={styles.bannerImage}
            priority
          />
        ) : (
          <div className={styles.placeholderBanner}>
            <Play size={64} />
          </div>
        )}
        <div className={styles.bannerOverlay} />
      </div>

      <div className={styles.heroContent}>
        <div className={styles.heroTop}>
          <button onClick={onBackClick} className={styles.backLink}>
            <ArrowLeft size={16} />
            Back to library
          </button>
          <div className={styles.contentTypeBadge}>
            {isTVShow ? (
              <>
                <Tv size={16} />
                <span>TV Series</span>
              </>
            ) : (
              <>
                <Play size={16} />
                <span>Movie</span>
              </>
            )}
          </div>
        </div>

        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <h1 className={styles.heroTitle}>{movie.title}</h1>

            <div className={styles.heroMeta}>
              <div className={styles.rating}>
                <Star size={18} fill="var(--color-accent)" strokeWidth={0} />
                <span>{movie.rating.toFixed(1)}</span>
              </div>
              {movie.releaseYear && (
                <span className={styles.metaItem}>
                  <Calendar size={16} />
                  {movie.releaseYear}
                </span>
              )}
              {!isTVShow && movie.duration && (
                <span className={styles.metaItem}>
                  <Clock size={16} />
                  {movie.duration} min
                </span>
              )}
              {isTVShow && movie.seasons && (
                <span className={styles.metaItem}>
                  <Tv size={16} />
                  {movie.seasons.length} Season
                  {movie.seasons.length !== 1 ? "s" : ""}
                </span>
              )}
              {languageLabel && (
                <span className={styles.metaItem}>
                  <span className={styles.metaDot} />
                  {languageLabel}
                </span>
              )}
            </div>

            {movie.genre && movie.genre.length > 0 && (
              <div className={styles.genreSection}>
                {movie.genre.map((genre: string) => (
                  <span key={genre} className={styles.genreTag}>
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {movie.description && (
              <div className={styles.descriptionContainer}>
                <p className={styles.description}>
                  {isDescriptionExpanded
                    ? movie.description
                    : truncateDescription(movie.description)}
                </p>
                {movie.description.length > 200 && (
                  <button
                    className={styles.toggleDescription}
                    onClick={() =>
                      setIsDescriptionExpanded(!isDescriptionExpanded)
                    }
                  >
                    {isDescriptionExpanded ? "Show Less" : "Show More"}
                  </button>
                )}
              </div>
            )}

            <div className={styles.actionRow}>
              <Link href="#watch" className={styles.primaryButton}>
                <Play size={16} />
                Watch now
              </Link>
              {isTVShow && (
                <Link href="#episodes" className={styles.ghostButton}>
                  <Tv size={16} />
                  Episodes
                </Link>
              )}
            </div>
          </div>

          <div className={styles.posterPanel}>
            <div className={styles.posterFrame}>
              {movie.posterImage?.asset ? (
                <Image
                  src={urlFor(movie.posterImage).width(700).height(1000).url()}
                  alt={movie.posterImage.alt || movie.title}
                  fill
                  sizes="320px"
                  className={styles.posterImage}
                />
              ) : (
                <div className={styles.posterPlaceholder}>
                  <Play size={42} />
                </div>
              )}
            </div>

            <div className={styles.statGrid}>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Rating</span>
                <span className={styles.statValue}>
                  {movie.rating.toFixed(1)}
                </span>
              </div>
              {movie.releaseYear && (
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Release</span>
                  <span className={styles.statValue}>{movie.releaseYear}</span>
                </div>
              )}
              {!isTVShow && movie.duration && (
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Duration</span>
                  <span className={styles.statValue}>{movie.duration} min</span>
                </div>
              )}
              {isTVShow && movie.seasons && (
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Seasons</span>
                  <span className={styles.statValue}>
                    {movie.seasons.length}
                  </span>
                </div>
              )}
              {languageLabel && (
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Language</span>
                  <span className={styles.statValue}>{languageLabel}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
