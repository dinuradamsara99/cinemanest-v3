'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';

/**
 * Hook to manage CSRF tokens for authenticated requests
 * 
 * Usage:
 * const { token, fetchWithCSRF, isLoading } = useCSRF();
 * 
 * // Option 1: Use the token directly
 * fetch('/api/comments', {
 *   method: 'POST',
 *   headers: { 'X-CSRF-Token': token, 'Content-Type': 'application/json' },
 *   body: JSON.stringify(data)
 * });
 * 
 * // Option 2: Use the helper function
 * await fetchWithCSRF('/api/comments', {
 *   method: 'POST',
 *   body: JSON.stringify(data)
 * });
 */
export function useCSRF() {
    const { data: session, status } = useSession();
    const [token, setToken] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch CSRF token when user is authenticated
    const fetchToken = useCallback(async () => {
        if (status !== 'authenticated' || !session?.user?.id) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetch('/api/csrf-token');

            if (!response.ok) {
                throw new Error('Failed to fetch CSRF token');
            }

            const data = await response.json();
            setToken(data.token);
            setError(null);
        } catch (err) {
            console.error('CSRF token fetch error:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch token');
        } finally {
            setIsLoading(false);
        }
    }, [session?.user?.id, status]);

    useEffect(() => {
        fetchToken();
    }, [fetchToken]);

    // Refresh token (useful after token expires)
    const refreshToken = useCallback(async () => {
        await fetchToken();
    }, [fetchToken]);

    // Helper function to make fetch requests with CSRF token
    const fetchWithCSRF = useCallback(
        async (url: string, options: RequestInit = {}): Promise<Response> => {
            if (!token) {
                throw new Error('CSRF token not available');
            }

            const headers = new Headers(options.headers);
            headers.set('X-CSRF-Token', token);

            if (!headers.has('Content-Type') && options.body) {
                headers.set('Content-Type', 'application/json');
            }

            const response = await fetch(url, {
                ...options,
                headers,
            });

            // If CSRF token is invalid/expired, refresh and retry once
            if (response.status === 403) {
                const errorData = await response.json().catch(() => ({}));
                if (errorData.error?.includes('CSRF')) {
                    await refreshToken();
                    // Retry with new token
                    headers.set('X-CSRF-Token', token);
                    return fetch(url, { ...options, headers });
                }
            }

            return response;
        },
        [token, refreshToken]
    );

    return {
        token,
        isLoading,
        error,
        refreshToken,
        fetchWithCSRF,
        isAuthenticated: status === 'authenticated',
    };
}

/**
 * Get CSRF headers for use in React Query mutations
 */
export function getCSRFHeaders(token: string): HeadersInit {
    return {
        'X-CSRF-Token': token,
        'Content-Type': 'application/json',
    };
}
