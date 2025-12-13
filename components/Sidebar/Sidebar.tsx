'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Home, Tv, Grid3x3, ChevronUp, Menu, X, Search, ChevronLeft, Languages } from 'lucide-react'
import { urlFor } from '@/lib/sanity'
import styles from './Sidebar.module.css'

interface Category {
  _id: string
  title: string
  slug: {
    current: string
  }
  description?: string
  movieCount?: number
}

interface Language {
  _id: string
  title: string
  slug: {
    current: string
  }
}

export default function Sidebar() {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [languages, setLanguages] = useState<Language[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState<{
    categories: boolean
    languages: boolean
  }>({
    categories: true,
    languages: true,
  })

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Array<{
    _id: string;
    title: string;
    slug: { current: string } | string;
    posterImage?: { asset?: { _ref: string } };
    contentType?: string;
    releaseYear?: number;
    rating?: number;
  }>>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)


  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth >= 1024) {
        setIsOpen(false)
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Update CSS variable for collapsed state
  useEffect(() => {
    if (!isMobile) {
      document.documentElement.style.setProperty(
        '--sidebar-width',
        isCollapsed ? '80px' : '260px'
      )
    } else {
      document.documentElement.style.setProperty('--sidebar-width', '0px')
    }
    return () => {
      document.documentElement.style.removeProperty('--sidebar-width')
    }
  }, [isCollapsed, isMobile])

  // Fetch categories and languages
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [categoriesRes, languagesRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/languages'),
        ])

        if (categoriesRes.ok) {
          const cats = await categoriesRes.json()
          setCategories(cats || [])
        }

        if (languagesRes.ok) {
          const langs = await languagesRes.json()
          setLanguages(langs || [])
        }
      } catch (error) {
        console.error('Error fetching sidebar data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true)
        setShowSearchResults(true)
        try {
          const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`)
          if (response.ok) {
            const data = await response.json()
            setSearchResults(data || [])
          }
        } catch (error) {
          console.error('Search error:', error)
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      } else {
        setSearchResults([])
        setShowSearchResults(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest(`.${styles.searchSection}`)) {
        setShowSearchResults(false)
      }
    }

    if (showSearchResults) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSearchResults])

  const toggleSection = (section: 'categories' | 'languages') => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const isActive = (path: string) => pathname === path
  const isCategoryActive = (slug: string) => pathname === `/category/${slug}`
  const isLanguageActive = (slug: string) => pathname === `/language/${slug}`

  const sidebarClasses = `${styles.sidebar} ${isMobile ? styles.mobile : styles.desktop} ${isMobile && isOpen ? styles.open : ''} ${!isMobile && isCollapsed ? styles.collapsed : ''}`

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          className={styles.mobileToggle}
          onClick={() => setIsOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Backdrop for mobile */}
      {isMobile && isOpen && (
        <div className={styles.backdrop} onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={sidebarClasses}>
        {/* Header */}
        <div className={styles.sidebarHeader}>
          {!isMobile && !isCollapsed && (
            <Link href="/" className={styles.logo}>
              <Image
                src="/logo1.png"
                alt="CinemaNest"
                width={40}
                height={40}
                className={styles.logoImage}
                priority
              />
              <span className={styles.logoText}>CinemaNest</span>
            </Link>
          )}
          {!isMobile && isCollapsed && (
            <Link href="/" className={styles.logoCollapsed}>
              <Image
                src="/logo1.png"
                alt="CinemaNest"
                width={36}
                height={36}
                className={styles.logoImage}
                priority
              />
            </Link>
          )}
          {isMobile && (
            <>
              <Link href="/" className={styles.logo}>
                <Image
                  src="/logo1.png"
                  alt="CinemaNest"
                  width={32}
                  height={32}
                  className={styles.logoImage}
                  priority
                />
                <span className={styles.logoText}>CinemaNest</span>
              </Link>
              <button
                className={styles.closeBtn}
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </>
          )}
        </div>

        {/* Toggle button - always visible for desktop */}
        {!isMobile && (
          <button
            className={styles.toggleBtn}
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft
              size={20}
              style={{
                transform: isCollapsed ? 'rotate(-180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s',
              }}
            />
          </button>
        )}

        {/* Search Section */}
        {!isCollapsed ? (
          <div className={styles.searchSection}>
            <div className={styles.searchInputWrapper}>
              <Search className={styles.searchIcon} size={18} />
              <input
                type="text"
                placeholder="Search movies & TV shows..."
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
              />
              {searchQuery && (
                <button
                  className={styles.clearSearch}
                  onClick={() => {
                    setSearchQuery('')
                    setShowSearchResults(false)
                  }}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && (
              <div className={styles.searchResults}>
                {isSearching ? (
                  <div className={styles.searchLoading}>
                    <div className={styles.searchLoadingSpinner} />
                    <span>Searching...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <Link
                      key={result._id}
                      href={`/watch/${typeof result.slug === 'string' ? result.slug : result.slug?.current || result.slug}`}
                      className={styles.searchResultItem}
                      onClick={() => {
                        setSearchQuery('');
                        setShowSearchResults(false);
                        if (isMobile) setIsOpen(false);
                      }}
                    >
                      <div className={styles.resultPoster}>
                        {result.posterImage?.asset ? (
                          <Image
                            src={urlFor(result.posterImage).width(100).height(150).url()}
                            alt={result.title}
                            width={56}
                            height={80}
                            className={styles.resultPosterImage}
                          />
                        ) : (
                          <div className={styles.resultPosterPlaceholder}>🎬</div>
                        )}
                      </div>
                      <div className={styles.resultInfo}>
                        <div className={styles.resultTitle}>{result.title}</div>
                        <div className={styles.resultMeta}>
                          <span className={styles.resultType}>
                            {result.contentType === 'tvshow' ? 'TV Show' : 'Movie'}
                          </span>
                          {result.releaseYear && (
                            <span className={styles.resultYear}> · {result.releaseYear}</span>
                          )}
                          {result.rating && (
                            <span className={styles.resultRating}> · ⭐ {result.rating.toFixed(1)}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className={styles.searchEmpty}>
                    <Search size={32} />
                    <p>No results found for &quot;{searchQuery}&quot;</p>
                    <span>Try different keywords</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className={styles.searchIconOnly}>
            <button
              className={styles.searchIconBtn}
              onClick={() => setIsCollapsed(false)}
              aria-label="Search"
              title="Search"
            >
              <Search size={20} />
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className={styles.nav}>
          {/* Home */}
          <Link
            href="/"
            className={`${styles.navItem} ${isActive('/') ? styles.navItemActive : ''}`}
            onClick={() => isMobile && setIsOpen(false)}
          >
            <span className={styles.icon}>
              <Home size={20} />
            </span>
            <span className={styles.label}>Home</span>
          </Link>

          {/* TV Shows */}
          <Link
            href="/tv-shows"
            className={`${styles.navItem} ${isActive('/tv-shows') ? styles.navItemActive : ''}`}
            onClick={() => isMobile && setIsOpen(false)}
          >
            <span className={styles.icon}>
              <Tv size={20} />
            </span>
            <span className={styles.label}>TV Shows</span>
          </Link>

          {/* Divider */}
          <div className={styles.navDivider} />

          {/* Categories Section */}
          <div>
            <button
              className={styles.navItem}
              onClick={() => toggleSection('categories')}
            >
              <span className={styles.icon}>
                <Grid3x3 size={20} />
              </span>
              <span className={styles.label}>Categories</span>
              <span className={`${styles.chevron} ${expandedSections.categories ? styles.chevronOpen : ''}`}>
                <ChevronUp size={16} />
              </span>
            </button>

            {expandedSections.categories && (
              <div className={`${styles.subMenu} ${styles.subMenuOpen}`}>
                <div className={styles.subMenuContent}>
                  {loading ? (
                    <div className={styles.skeletonContainer}>
                      {[
                        { key: 1, width: '65%' },
                        { key: 2, width: '80%' },
                        { key: 3, width: '55%' },
                        { key: 4, width: '70%' },
                        { key: 5, width: '60%' }
                      ].map((item) => (
                        <div key={item.key} className={styles.skeletonItem}>
                          <div className={styles.skeletonDot} />
                          <div className={styles.skeletonText} style={{ width: item.width }} />
                        </div>
                      ))}
                    </div>
                  ) : categories.length > 0 ? (
                    categories.map((category) => (
                      <Link
                        key={category._id}
                        href={`/category/${category.slug.current}`}
                        className={`${styles.subMenuItem} ${isCategoryActive(category.slug.current) ? styles.subMenuItemActive : ''}`}
                        onClick={() => isMobile && setIsOpen(false)}
                      >
                        <span className={styles.dot} />
                        <span>{category.title}</span>
                        {category.movieCount !== undefined && (
                          <span className={styles.count}>{category.movieCount}</span>
                        )}
                      </Link>
                    ))
                  ) : (
                    <div className={styles.subMenuEmpty}>No categories available</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Languages Section */}
          < div >
            <button
              className={styles.navItem}
              onClick={() => toggleSection('languages')}
            >
              <span className={styles.icon}>
                <Languages size={20} />
              </span>
              <span className={styles.label}>Languages</span>
              <span className={`${styles.chevron} ${expandedSections.languages ? styles.chevronOpen : ''}`}>
                <ChevronUp size={16} />
              </span>
            </button>

            {
              expandedSections.languages && (
                <div className={`${styles.subMenu} ${styles.subMenuOpen}`}>
                  <div className={styles.subMenuContent}>
                    {loading ? (
                      <div className={styles.skeletonContainer}>
                        {[
                          { key: 1, width: '50%' },
                          { key: 2, width: '65%' },
                          { key: 3, width: '58%' },
                          { key: 4, width: '72%' }
                        ].map((item) => (
                          <div key={item.key} className={styles.skeletonItem}>
                            <div className={styles.skeletonDot} />
                            <div className={styles.skeletonText} style={{ width: item.width }} />
                          </div>
                        ))}
                      </div>
                    ) : languages.length > 0 ? (
                      languages.map((language) => (
                        <Link
                          key={language._id}
                          href={`/language/${language.slug.current}`}
                          className={`${styles.subMenuItem} ${isLanguageActive(language.slug.current) ? styles.subMenuItemActive : ''}`}
                          onClick={() => isMobile && setIsOpen(false)}
                        >
                          <span className={styles.dot} />
                          <span>{language.title}</span>
                        </Link>
                      ))
                    ) : (
                      <div className={styles.subMenuEmpty}>No languages available</div>
                    )}
                  </div>
                </div>
              )
            }
          </div >
        </nav >
      </aside >
    </>
  )
}

