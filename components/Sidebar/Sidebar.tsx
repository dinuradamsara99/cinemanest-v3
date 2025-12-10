'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom' // 1. Portal import කරන ලදී
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Film, Tv, ChevronLeft, ChevronRight, ChevronDown, X, Grid3X3 } from 'lucide-react'
import { Language, Category } from '@/types/movie'
import { useSidebar } from '@/context/SidebarContext'
import styles from './Sidebar.module.css'

interface SidebarProps {
    languages?: Language[]
    categories?: Category[]
}

// Tooltip State Type Definition
interface TooltipState {
    label: string;
    top: number;
    left: number;
}

export default function Sidebar({ languages = [], categories = [] }: SidebarProps) {
    const [isLanguageOpen, setIsLanguageOpen] = useState(false)
    const [isCategoryOpen, setIsCategoryOpen] = useState(false)

    // 2. Tooltip සදහා අලුත් States
    const [tooltip, setTooltip] = useState<TooltipState | null>(null)

    const pathname = usePathname()
    const { isOpen, isCollapsed, isMobile, hasMounted, closeSidebar, toggleCollapse } = useSidebar()

    // Close mobile sidebar when route changes
    useEffect(() => {
        if (isMobile) {
            closeSidebar()
        }
    }, [pathname, isMobile, closeSidebar])

    // Prevent body scroll when mobile sidebar is open
    useEffect(() => {
        if (isMobile && isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isMobile, isOpen])

    // Toggle dropdowns
    const toggleLanguageAccordion = () => setIsLanguageOpen(!isLanguageOpen)
    const toggleCategoryAccordion = () => setIsCategoryOpen(!isCategoryOpen)

    // 3. Tooltip පෙන්වන Function එක (Mouse Enter)
    const handleMouseEnter = (e: React.MouseEvent, label: string) => {
        // Tooltip පෙන්වන්නේ Desktop එකේ Sidebar එක Collapsed නම් පමණයි
        if (!isMobile && isCollapsed) {
            const rect = e.currentTarget.getBoundingClientRect()
            setTooltip({
                label,
                top: rect.top + (rect.height / 2), // Icon එකේ මැදට
                left: rect.right + 10 // දකුණු පැත්තෙන් පොඩි පරතරයක්
            })
        }
    }

    // Tooltip සැඟවෙන Function එක (Mouse Leave)
    const handleMouseLeave = () => {
        setTooltip(null)
    }

    // Determine sidebar classes
    const sidebarClasses = [
        styles.sidebar,
        isMobile ? styles.mobile : styles.desktop,
        isMobile && isOpen ? styles.open : '',
        !isMobile && isCollapsed ? styles.collapsed : '',
    ].filter(Boolean).join(' ')

    return (
        <>
            {/* Backdrop - Mobile Only */}
            {isMobile && isOpen && (
                <div
                    className={styles.backdrop}
                    onClick={closeSidebar}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside className={sidebarClasses}>
                {/* Header (Logo + Toggle) */}
                <div className={styles.sidebarHeader}>
                    {(!isCollapsed || isMobile) && (
                        <div className={styles.logo}>
                            <span className={styles.logoText}>Discover</span>
                        </div>
                    )}

                    {isMobile ? (
                        <button
                            className={styles.closeBtn}
                            onClick={closeSidebar}
                            aria-label="Close menu"
                        >
                            <X size={20} />
                        </button>
                    ) : (
                        <button
                            className={styles.toggleBtn}
                            onClick={toggleCollapse}
                            aria-label={isCollapsed ? "Expand" : "Collapse"}
                        >
                            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className={styles.nav}>
                    <div className={styles.navGroup}>
                        {/* HOME Link */}
                        <Link
                            href="/"
                            className={`${styles.navItem} ${pathname === '/' ? styles.navItemActive : ''}`}
                            onMouseEnter={(e) => handleMouseEnter(e, 'Home')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <span className={styles.icon}>
                                <Home size={22} strokeWidth={2} />
                            </span>
                            <span className={styles.label}>Home</span>
                            {/* Old tooltip span removed */}
                        </Link>

                        {/* TV SHOWS Link */}
                        <Link
                            href="/tv-shows"
                            className={`${styles.navItem} ${pathname === '/tv-shows' ? styles.navItemActive : ''}`}
                            onMouseEnter={(e) => handleMouseEnter(e, 'TV Shows')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <span className={styles.icon}>
                                <Tv size={22} strokeWidth={2} />
                            </span>
                            <span className={styles.label}>TV Shows</span>
                        </Link>
                    </div>

                    <div className={styles.navDivider} />

                    {/* Categories Dropdown */}
                    <div className={styles.navGroup}>
                        <button
                            className={`${styles.navItem} ${styles.accordionTrigger} ${isCategoryOpen ? styles.accordionOpen : ''}`}
                            onClick={toggleCategoryAccordion}
                            aria-expanded={isCategoryOpen}
                            onMouseEnter={(e) => handleMouseEnter(e, 'Categories')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <span className={styles.icon}>
                                <Grid3X3 size={22} strokeWidth={2} />
                            </span>
                            <span className={styles.label}>Categories</span>
                            {(!isCollapsed || isMobile) && (
                                <ChevronDown
                                    size={16}
                                    className={`${styles.chevron} ${isCategoryOpen ? styles.chevronOpen : ''}`}
                                />
                            )}
                        </button>

                        {/* Categories Expandable Section */}
                        <div
                            className={`${styles.subMenu} ${isCategoryOpen && (!isCollapsed || isMobile) ? styles.subMenuOpen : ''}`}
                        >
                            <div className={styles.subMenuContent}>
                                {categories.length > 0 ? (
                                    categories.map((category) => (
                                        <Link
                                            key={category._id}
                                            href={`/movies/category/${category.slug.current}`}
                                            className={`${styles.subMenuItem} ${pathname === `/movies/category/${category.slug.current}` ? styles.subMenuItemActive : ''}`}
                                        >
                                            <span className={styles.dot} />
                                            <span>{category.title}</span>
                                            {category.movieCount !== undefined && category.movieCount > 0 && (
                                                <span className={styles.count}>{category.movieCount}</span>
                                            )}
                                        </Link>
                                    ))
                                ) : (
                                    <div className={styles.subMenuEmpty}>No categories</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Languages Dropdown */}
                    <div className={styles.navGroup}>
                        <button
                            className={`${styles.navItem} ${styles.accordionTrigger} ${isLanguageOpen ? styles.accordionOpen : ''}`}
                            onClick={toggleLanguageAccordion}
                            aria-expanded={isLanguageOpen}
                            onMouseEnter={(e) => handleMouseEnter(e, 'Languages')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <span className={styles.icon}>
                                <Film size={22} strokeWidth={2} />
                            </span>
                            <span className={styles.label}>Languages</span>
                            {(!isCollapsed || isMobile) && (
                                <ChevronDown
                                    size={16}
                                    className={`${styles.chevron} ${isLanguageOpen ? styles.chevronOpen : ''}`}
                                />
                            )}
                        </button>

                        {/* Languages Expandable Section */}
                        <div
                            className={`${styles.subMenu} ${isLanguageOpen && (!isCollapsed || isMobile) ? styles.subMenuOpen : ''}`}
                        >
                            <div className={styles.subMenuContent}>
                                {languages.length > 0 ? (
                                    languages.map((language) => (
                                        <Link
                                            key={language._id}
                                            href={`/movies/language/${language.slug.current}`}
                                            className={`${styles.subMenuItem} ${pathname === `/movies/language/${language.slug.current}` ? styles.subMenuItemActive : ''}`}
                                        >
                                            <span className={styles.dot} />
                                            <span>{language.title}</span>
                                        </Link>
                                    ))
                                ) : (
                                    <div className={styles.subMenuEmpty}>No languages</div>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>
            </aside>

            {/* 4. Portal Render - Tooltip එක Body එකේ Render වේ */}
            {hasMounted && tooltip && createPortal(
                <div
                    className={styles.fixedTooltip}
                    style={{
                        top: tooltip.top,
                        left: tooltip.left
                    }}
                >
                    {tooltip.label}
                </div>,
                document.body
            )}
        </>
    )
}