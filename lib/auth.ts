import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";
import { logger } from "./security";

// ============================================================================
// ENVIRONMENT VALIDATION
// ============================================================================

if (!process.env.NEXTAUTH_SECRET) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('CRITICAL: NEXTAUTH_SECRET environment variable is not configured');
    }
    console.warn('[AUTH] NEXTAUTH_SECRET not set - using default for development only');
}

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('CRITICAL: Google OAuth credentials are not configured');
    }
    console.warn('[AUTH] Google OAuth credentials not set');
}

// ============================================================================
// ALLOWED REDIRECT DOMAINS (Whitelist for OAuth callbacks)
// ============================================================================

const ALLOWED_REDIRECT_DOMAINS = [
    process.env.NEXTAUTH_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    'http://localhost:3000',
    'http://localhost:3001',
].filter(Boolean) as string[];

/**
 * Validate redirect URL against whitelist
 */
function isAllowedRedirect(url: string, baseUrl: string): boolean {
    // Allow relative URLs
    if (url.startsWith('/')) {
        return true;
    }

    try {
        const parsedUrl = new URL(url);
        const parsedBase = new URL(baseUrl);

        // Check if same origin as base URL
        if (parsedUrl.origin === parsedBase.origin) {
            return true;
        }

        // Check against whitelist
        return ALLOWED_REDIRECT_DOMAINS.some(domain => {
            try {
                const allowedUrl = new URL(domain);
                return parsedUrl.origin === allowedUrl.origin;
            } catch {
                return false;
            }
        });
    } catch {
        return false;
    }
}

// ============================================================================
// AUTH OPTIONS
// ============================================================================

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as NextAuthOptions['adapter'],
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        }),
    ],
    callbacks: {
        async signIn({ account, profile }) {
            // Google OAuth sign-in handling
            if (account?.provider === 'google' && profile?.email) {
                try {
                    const existingUser = await prisma.user.findUnique({
                        where: { email: profile.email as string },
                    });

                    // Update user image if Google provides one
                    if (existingUser && !existingUser.image && (profile as { picture?: string })?.picture) {
                        await prisma.user.update({
                            where: { id: existingUser.id },
                            data: { image: (profile as { picture: string }).picture }
                        });
                    }

                    logger.info('User signed in', {
                        provider: account.provider,
                        email: profile.email
                    });
                } catch (error) {
                    logger.error('Sign in callback error', { error: String(error) });
                }
            }
            return true;
        },

        async redirect({ url, baseUrl }) {
            // Security: Validate redirect URL against whitelist
            if (isAllowedRedirect(url, baseUrl)) {
                // For relative URLs, prepend baseUrl
                if (url.startsWith('/')) {
                    return `${baseUrl}${url}`;
                }
                return url;
            }

            // Log suspicious redirect attempts
            logger.warn('Blocked suspicious redirect', { url, baseUrl });
            return baseUrl;
        },

        async session({ token, session }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.name = token.name;
                session.user.email = token.email;
                session.user.image = token.picture as string | undefined;
            }

            return session;
        },

        async jwt({ token, user, account }) {
            // Initial sign in
            if (user && account) {
                // For new users via OAuth, save user info to token
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    picture: user.image,
                    iat: Math.floor(Date.now() / 1000),
                    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // Explicit expiration (24h)
                };
            }

            // Return existing token
            return token;
        },
    },

    // ========================================================================
    // SESSION CONFIGURATION (Fixed: Explicit expiration)
    // ========================================================================
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60,      // 24 hours - session expires after this
        updateAge: 60 * 60,        // 1 hour - session is refreshed if older than this
    },

    // ========================================================================
    // JWT CONFIGURATION
    // ========================================================================
    jwt: {
        maxAge: 24 * 60 * 60,      // 24 hours - matches session maxAge
    },

    // ========================================================================
    // PAGES CONFIGURATION
    // ========================================================================
    pages: {
        signIn: '/',               // Use home page for sign in
        error: '/',                // Redirect errors to home
    },

    // ========================================================================
    // SECURITY SETTINGS
    // ========================================================================
    // SECURITY SETTINGS
    // ========================================================================
    // Explicitly disable debug in production to prevent leaking sensitive info
    debug: process.env.NODE_ENV === "development",
    secret: process.env.NEXTAUTH_SECRET,

    // Cookie settings for enhanced security
    cookies: {
        sessionToken: {
            name: process.env.NODE_ENV === 'production'
                ? '__Secure-next-auth.session-token'
                : 'next-auth.session-token',
            options: {
                httpOnly: true,
                // Strengthen SameSite policy in production if possible (may affect OAuth redirects)
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
            },
        },
    },

    // Events for security logging
    events: {
        async signIn({ user }) {
            logger.info('Auth event: signIn', { userId: user.id });
        },
        async signOut({ token }) {
            logger.info('Auth event: signOut', { userId: token?.id });
        },
    },
};
