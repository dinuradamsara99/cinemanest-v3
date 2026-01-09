import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Next.js Proxy for Centralized Security and Route Protection (Next.js 16+)
 * 
 * This proxy runs on every request and provides:
 * - Authentication checks for protected routes
 * - Security headers on all responses
 * - API endpoint protection for state-changing operations
 */

// ============================================================================
// ROUTE CONFIGURATION
// ============================================================================

/**
 * Routes that are publicly accessible (Whitelist)
 * All other API routes are protected by default (Default Deny)
 */
const PUBLIC_API_ROUTES = [
    '/api/auth',
    '/api/search',
    '/api/categories',
    '/api/languages',
    '/api/movie',
    '/api/tv-shows', // Assuming this exists or might exist
];

/**
 * Page routes that require authentication
 */
const PROTECTED_PAGE_ROUTES = [
    '/account',
    '/studio', // Protected: CMS Access
];

// ============================================================================
// SECURITY HEADERS (Edge-compatible)
// ============================================================================

const SECURITY_HEADERS: Record<string, string> = {
    'X-DNS-Prefetch-Control': 'on',
    'X-Content-Type-Options': 'nosniff',
    // NOTE: X-XSS-Protection removed - deprecated header that can cause issues
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'SAMEORIGIN',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

function addSecurityHeaders(response: NextResponse): NextResponse {
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
        response.headers.set(key, value);
    });
    return response;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function isPublicApiRoute(pathname: string): boolean {
    return PUBLIC_API_ROUTES.some(route => pathname.startsWith(route));
}

function isProtectedPageRoute(pathname: string): boolean {
    return PROTECTED_PAGE_ROUTES.some(route => pathname.startsWith(route));
}

function getClientIP(request: NextRequest): string {
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
    }
    const realIp = request.headers.get('x-real-ip');
    if (realIp) {
        return realIp;
    }
    return 'unknown';
}

// ============================================================================
// PROXY FUNCTION
// ============================================================================

export default async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const method = request.method;

    // Get the user's session token
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    // ========================================================================
    // 1. Handle protected page routes
    // ========================================================================
    if (isProtectedPageRoute(pathname) && !token) {
        const url = request.nextUrl.clone();
        url.pathname = '/';
        url.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(url);
    }

    // ========================================================================
    // 2. Handle API routes (Default Deny Policy)
    // ========================================================================
    // SECURITY FIX: Switch to Default Deny. Block all /api requests unless Public.
    if (pathname.startsWith('/api')) {
        // Allow public routes (Strictly allow only GET or specific methods)
        if (isPublicApiRoute(pathname)) {
            // EXCEPTION: /api/auth endpoints need POST
            if (pathname.startsWith('/api/auth')) {
                // Allow matching methods (GET, POST) - handled by NextAuth
            }
            // All other public API routes should be GET only
            else if (method !== 'GET') {
                console.warn(`[PROXY] Blocked non-GET request to public API: ${method} ${pathname}`, {
                    ip: getClientIP(request),
                });
                return NextResponse.json(
                    { error: 'Method not allowed for public route' },
                    { status: 405 }
                );
            }
        }
        // Allow authenticated requests
        else if (token) {
            // Proceed
        }
        // Block everything else
        else {
            console.warn(`[PROXY] Unauthorized API access blocked (Default Deny): ${method} ${pathname}`, {
                ip: getClientIP(request),
            });

            return NextResponse.json(
                {
                    error: 'Authentication required',
                    code: 'UNAUTHORIZED'
                },
                {
                    status: 401,
                    headers: Object.fromEntries(
                        Object.entries(SECURITY_HEADERS)
                    ),
                }
            );
        }
    }

    // ========================================================================
    // 3. Add user info to request headers for downstream handlers
    // ========================================================================
    if (token) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', token.id as string || '');
        requestHeaders.set('x-user-email', token.email || '');

        const response = NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });

        return addSecurityHeaders(response);
    }

    // ========================================================================
    // 4. Default: Add security headers and continue
    // ========================================================================
    const response = NextResponse.next();
    return addSecurityHeaders(response);
}

// ============================================================================
// CONFIGURATION
// ============================================================================

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - Static assets
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
