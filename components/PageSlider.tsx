"use client";

import { motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { Home, Tv, Layers, Globe, ArrowRight } from "lucide-react";
import styles from "./PageSlider.module.css";

interface Page {
    _id: string;
    title: string;
    slug?: string;
    description?: string;
    mainImage?: any;
}

interface PageSliderProps {
    pages: Page[];
}

const iconMap: Record<string, any> = {
    "Home": Home,
    "TV Shows": Tv,
    "Categories": Layers,
    "Languages": Globe
};

const gradientMap: Record<string, string> = {
    "Home": "linear-gradient(135deg, #FF512F 0%, #DD2476 100%)",
    "TV Shows": "linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)",
    "Categories": "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    "Languages": "linear-gradient(135deg, #FC466B 0%, #3F5EFB 100%)"
};

const getSlug = (page: Page) => {
    // If slug is missing from Sanity/Mock, derive it from title
    if (page.slug) return page.slug;
    if (page.title === "Home") return "/";
    return `/${page.title.toLowerCase().replace(/\s+/g, '-')}`;
};

const PageSlider: React.FC<PageSliderProps> = ({ pages }) => {
    const [width, setWidth] = useState(0);
    const sliderRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (sliderRef.current) {
            setWidth(sliderRef.current.scrollWidth - sliderRef.current.offsetWidth);
        }
    }, [pages]);

    if (!pages || pages.length === 0) {
        return null;
    }

    return (
        <div className={styles.sliderContainer}>


            <motion.div
                ref={sliderRef}
                className={styles.sliderWrapper}
                whileTap={{ cursor: "grabbing" }}
            >
                <motion.div
                    drag="x"
                    dragConstraints={{ right: 0, left: -width }}
                    className={styles.sliderTrack}
                >
                    {pages.map((page) => {
                        const Icon = iconMap[page.title] || Layers;
                        const background = gradientMap[page.title] || "linear-gradient(135deg, #232526 0%, #414345 100%)";
                        const linkHref = getSlug(page);

                        return (
                            <Link href={linkHref} key={page._id} draggable={false} className={styles.cardLink}>
                                <motion.div
                                    className={styles.sliderCard}
                                    style={{ background }}
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                >
                                    <div className={styles.iconWrapper}>
                                        <Icon size={48} color="white" strokeWidth={1.5} />
                                    </div>

                                    <div className={styles.cardContent}>
                                        <h3 className={styles.cardTitle}>{page.title}</h3>
                                        {page.description && <p className={styles.cardDesc}>{page.description}</p>}
                                        <div className={styles.cardAction}>
                                            <span>Explore</span>
                                            <ArrowRight size={16} />
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        );
                    })}
                </motion.div>
            </motion.div>
        </div>
    );
};

export default PageSlider;
