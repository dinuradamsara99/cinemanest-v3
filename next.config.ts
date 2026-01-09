import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix isomorphic-dompurify ESM/CJS compatibility on Vercel
  serverExternalPackages: ['isomorphic-dompurify', 'jsdom'],

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io', pathname: '/**' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: 'image.tmdb.org', pathname: '/**' }, // TMDB Posters සඳහා
    ],
    formats: ['image/avif', 'image/webp'],
  },

  async headers() {
    const cspDirectives = [
      "default-src 'self'",
      // SECURITY FIX: 'unsafe-eval' ඉවත් කර ඇත. අවශ්‍ය නම් පමණක් එක් කරන්න
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://accounts.google.com https://www.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https: http:",

      // SECURITY FIX: ඔයාගේ Video Source domains මෙතනට අනිවාර්යයෙන්ම ඇතුළත් කළ යුතුයි
      "media-src 'self' https: blob: https://video.cinemanest-watch.workers.dev",

      // SECURITY FIX: API සහ WebSocket ආරක්ෂාව
      "connect-src 'self' https://*.googleapis.com https://*.sanity.io https://*.vercel.app https://accounts.google.com wss: https://*.video.cinemanest-watch.workers.dev",

      "frame-src 'self' https://accounts.google.com https://www.google.com",
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
          // HSTS: වසර 2ක් පුරා HTTPS අනිවාර්ය කරයි
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

export default nextConfig;