import type { NextConfig } from "next";

// Bundle analyzer for production optimization (run with ANALYZE=true npm run build)
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  // ============================================================================
  // IMAGE OPTIMIZATION (Enhanced for Performance)
  // ============================================================================
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io', pathname: '/**' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: 'image.tmdb.org', pathname: '/**' },
    ],
    formats: ['image/avif', 'image/webp'],
    // Device responsive breakpoints for optimal image sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    // Smaller image sizes for icons, thumbnails
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache optimized images for 30 days
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  // ============================================================================
  // PRODUCTION COMPILER OPTIMIZATIONS
  // ============================================================================
  compiler: {
    styledComponents: true,
    // Remove console.log in production for smaller bundle
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  async headers() {
    const cspDirectives = [
      "default-src 'self'",
      // SECURITY: CSP protects against XSS while maintaining Next.js compatibility
      // Note: 'unsafe-inline' is required for Next.js hydration scripts
      // For stricter CSP, implement nonce-based approach with middleware
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://accounts.google.com https://www.google.com",
      // Note: 'unsafe-inline' for styles is required by Tailwind CSS and styled-components
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https: http:",

      // SECURITY FIX: ඔයාගේ Video Source domains මෙතනට අනිවාර්යයෙන්ම ඇතුළත් කළ යුතුයි
      "media-src 'self' https: blob: https://video.cinemanest-watch.workers.dev",

      // SECURITY FIX: API සහ WebSocket ආරක්ෂාව
      "connect-src 'self' blob: https://*.googleapis.com https://*.sanity.io https://*.vercel.app https://accounts.google.com wss: https://*.video.cinemanest-watch.workers.dev https://registry.npmjs.org https://api.themoviedb.org https://image.tmdb.org https://raw.githubusercontent.com",

      "frame-src 'self' https://accounts.google.com https://www.google.com https://www.youtube.com https://www.youtube-nocookie.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://accounts.google.com",

      // SECURITY FIX: Clickjacking වැළැක්වීමට (X-Frame-Options හා සමානයි)
      "frame-ancestors 'self'",

      "upgrade-insecure-requests", // Production වලදී HTTPS අනිවාර්ය කරයි
    ];

    const cspHeader = cspDirectives.join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
          { key: 'Content-Security-Policy', value: cspHeader },
        ],
      },
      {
        // Sanity Studio ආරක්ෂාව සඳහා (Finding 18)
        source: '/studio/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        // API සඟවා තැබීමට සහ Cache පාලනයට (Finding 10)
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
    ];
  },
};

// Export wrapped with bundle analyzer
export default withBundleAnalyzer(nextConfig);