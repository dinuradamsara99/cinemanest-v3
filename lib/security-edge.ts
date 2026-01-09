import { NextResponse } from 'next/server';

/**
 * Edge Runtime Compatible Security Utilities - Hardened Version
 * Based on Security Audit Reports (January 2026)
 */

export const securityHeaders = {
    // Prevent clickjacking - Denies framing of the site
    'X-Frame-Options': 'DENY',

    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',

    // SECURITY FIX: Removed 'X-XSS-Protection' as it is deprecated

    // Referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Permissions policy
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',

    // Content Security Policy (Hardened)
    'Content-Security-Policy': [
        "default-src 'self'",
        // Note: In production, consider using nonces instead of 'unsafe-inline'
        "script-src 'self' https://www.googletagmanager.com https://accounts.google.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", 
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:", // Added blob for video posters/thumbnails
        "media-src 'self' https: blob:", // Critical for CinemaNest streaming
        "connect-src 'self' https://www.googleapis.com https://*.sanity.io https://*.vercel.app wss:",
        "frame-src 'self' https://accounts.google.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'", // Matches X-Frame-Options: DENY
        "upgrade-insecure-requests", // Forces HTTPS
    ].join('; '),
};

/**
 * Add security headers to response
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
    Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
    });
    
    // Add HSTS header for production
    if (process.env.NODE_ENV === 'production') {
        response.headers.set(
            'Strict-Transport-Security',
            'max-age=63072000; includeSubDomains; preload'
        );
    }
    
    return response;
}