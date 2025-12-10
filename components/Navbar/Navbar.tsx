"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Heart, Menu, Loader2, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { useWishlist } from "@/context/WishlistContext";
import { urlFor } from "@/lib/sanity";
import type { Movie } from "@/types/movie";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { toggleSidebar } = useSidebar();
  const { wishlistCount } = useWishlist();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      setShowResults(false);
      setIsLoading(false);
      return;
    }

    if (searchQuery.trim().length < 2) {
      return;
    }

    setIsLoading(true);

    debounceTimer.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`);

        if (!response.ok) {
          throw new Error("Failed to search");
        }

        const results = await response.json();
        setSearchResults(results || []);
        setShowResults(true);
      } catch (error) {
        console.error("Search error:", error);
        // Handle the case where error might be an Event object
        if (error instanceof Error) {
          console.error("Search error details:", error.message);
        } else if (typeof error === "object" && error !== null) {
          console.error("Search error object:", JSON.stringify(error));
        } else {
          console.error("Search error unknown:", error);
        }
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery]);

  // Click outside to close - improved for mobile
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const dropdownElement = document.querySelector(
        '[class*="searchDropdown"]'
      );

      // Don't close if clicking on the dropdown itself
      if (dropdownElement?.contains(target)) {
        return;
      }

      if (searchRef.current && !searchRef.current.contains(target)) {
        if (window.innerWidth > 768) {
          setShowResults(false);
        } else if (isMobileSearchOpen) {
          // On mobile, only close if clicking outside the entire search area
          setShowResults(false);
          setIsMobileSearchOpen(false);
          setSearchQuery("");
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileSearchOpen]);

  const handleResultClick = (slug: string) => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
    setIsMobileSearchOpen(false);
    router.push(`/watch/${slug}`);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
    inputRef.current?.focus();
  };

  const toggleMobileSearch = () => {
    setIsMobileSearchOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <nav className={styles.navbar}>
      {/* Mobile Menu Button */}
      <button
        className={styles.mobileMenuButton}
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <Menu size={24} />
      </button>

      {/* Logo */}
      <Link href="/" className={styles.logo}>
        Cinema<span className={styles.logoAccent}>Nest</span>
      </Link>

      {/* Search Bar with Dropdown */}
      <div
        className={`${styles.searchWrapper} ${isMobileSearchOpen ? styles.mobileSearchOpen : ""}`}
        ref={searchRef}
      >
        {/* Mobile Search Toggle (Visible only when closed on mobile) */}
        <button
          className={styles.mobileSearchToggle}
          onClick={toggleMobileSearch}
          aria-label="Open search"
        >
          <Search size={22} />
        </button>

        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} size={20} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search movies, TV shows..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (window.innerWidth <= 768) setIsMobileSearchOpen(true);
              if (searchResults.length > 0) setShowResults(true);
            }}
          />

          <div className={styles.inputControls}>
            {isLoading && <Loader2 className={styles.loadingIcon} size={18} />}
            {searchQuery && !isLoading && (
              <button
                className={styles.clearButton}
                onClick={clearSearch}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Mobile Close Button */}
        </div>

        {/* Search Results Dropdown */}
        {showResults && (
          <div className={styles.searchDropdown}>
            {searchResults.length > 0 ? (
              <>
                <div className={styles.resultsHeader}>
                  Found {searchResults.length} result
                  {searchResults.length !== 1 ? "s" : ""}
                </div>
                <div className={styles.resultsList}>
                  {searchResults.map((movie) => (
                    <button
                      key={movie._id}
                      className={styles.resultItem}
                      onClick={() => handleResultClick(movie.slug.current)}
                    >
                      <div className={styles.resultPoster}>
                        {movie.posterImage?.asset ? (
                          <Image
                            src={urlFor(movie.posterImage).width(100).url()}
                            alt={movie.title}
                            fill
                            className={styles.resultImage}
                            sizes="60px"
                          />
                        ) : (
                          <div className={styles.resultPlaceholder}>
                            <Search size={20} />
                          </div>
                        )}
                      </div>
                      <div className={styles.resultInfo}>
                        <div className={styles.resultTitle}>{movie.title}</div>
                        <div className={styles.resultMeta}>
                          {movie.releaseYear && (
                            <span>{movie.releaseYear}</span>
                          )}
                          {movie.rating && (
                            <>
                              <span className={styles.dot}>•</span>
                              <span className={styles.rating}>
                                ⭐ {movie.rating.toFixed(1)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>
                <Search size={32} />
                <p>No results found for &quot;{searchQuery}&quot;</p>
                <span>Try different keywords</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Side Actions */}
      <div className={styles.actions}>
        <Link
          href="/wishlist"
          className={styles.iconButton}
          aria-label="Wishlist"
        >
          <Heart size={24} />
          {wishlistCount > 0 && (
            <span className={styles.badge}>{wishlistCount}</span>
          )}
        </Link>
      </div>
    </nav>
  );
}
