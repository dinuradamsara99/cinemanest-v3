'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Tv, Grid3x3, Film, ChevronUp, ChevronDown, Menu, X } from 'lucide-react'
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
            <div className={styles.logo}>
              <span className={styles.logoText}>CinemaNest</span>
            </div>
          )}
          {!isMobile && (
            <button
              className={styles.toggleBtn}
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <ChevronDown
                size={20}
                style={{
                  transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s',
                }}
              />
            </button>
          )}
          {isMobile && (
            <button
              className={styles.closeBtn}
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          )}
        </div>

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
                    <div className={styles.loadingState}>
                      <div className={styles.loadingSpinner} />
                      <span>Loading categories...</span>
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
          <div>
            <button
              className={styles.navItem}
              onClick={() => toggleSection('languages')}
            >
              <span className={styles.icon}>
                <Film size={20} />
              </span>
              <span className={styles.label}>Languages</span>
              <span className={`${styles.chevron} ${expandedSections.languages ? styles.chevronOpen : ''}`}>
                <ChevronUp size={16} />
              </span>
            </button>

            {expandedSections.languages && (
              <div className={`${styles.subMenu} ${styles.subMenuOpen}`}>
                <div className={styles.subMenuContent}>
                  {loading ? (
                    <div className={styles.loadingState}>
                      <div className={styles.loadingSpinner} />
                      <span>Loading languages...</span>
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
            )}
          </div>
        </nav>
      </aside>
    </>
  )
}

