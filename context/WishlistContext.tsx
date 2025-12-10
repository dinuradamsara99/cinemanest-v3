'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface WishlistContextType {
    wishlist: string[]
    addToWishlist: (movieId: string) => void
    removeFromWishlist: (movieId: string) => void
    isInWishlist: (movieId: string) => boolean
    wishlistCount: number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
    const [wishlist, setWishlist] = useState<string[]>([])

    // Load wishlist from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('cinemanest-wishlist')
        if (saved) {
            setWishlist(JSON.parse(saved))
        }
    }, [])

    // Save wishlist to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('cinemanest-wishlist', JSON.stringify(wishlist))
    }, [wishlist])

    const addToWishlist = (movieId: string) => {
        setWishlist(prev => {
            if (!prev.includes(movieId)) {
                return [...prev, movieId]
            }
            return prev
        })
    }

    const removeFromWishlist = (movieId: string) => {
        setWishlist(prev => prev.filter(id => id !== movieId))
    }

    const isInWishlist = (movieId: string) => {
        return wishlist.includes(movieId)
    }

    return (
        <WishlistContext.Provider
            value={{
                wishlist,
                addToWishlist,
                removeFromWishlist,
                isInWishlist,
                wishlistCount: wishlist.length,
            }}
        >
            {children}
        </WishlistContext.Provider>
    )
}

export function useWishlist() {
    const context = useContext(WishlistContext)
    if (!context) {
        throw new Error('useWishlist must be used within WishlistProvider')
    }
    return context
}
