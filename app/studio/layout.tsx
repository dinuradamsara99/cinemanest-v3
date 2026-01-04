import type { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sanity Studio - CinemaNest',
    description: 'Content Management System',
};

export default function StudioLayout({
    children,
}: {
    children: ReactNode;
}) {
    // No sidebar or header for Studio - just render children directly
    return <>{children}</>;
}
