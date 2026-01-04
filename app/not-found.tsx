import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '404 - Page Not Found | CinemaNest',
    description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-5 text-center bg-[#121212] text-white">
            <h1 className="text-6xl md:text-8xl font-bold mb-4">404</h1>
            <h2 className="text-2xl md:text-4xl font-semibold mb-4">Page Not Found</h2>
            <p className="text-lg md:text-xl text-zinc-400 mb-8">
                Sorry, the page you're looking for doesn't exist.
            </p>
            <Link
                href="/"
                className="mt-8 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
            >
                Go Home
            </Link>
        </div>
    );
}
