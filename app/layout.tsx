import type { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";
// මෙතන DM_Sans වෙනුවට Poppins දාන්න
import { Poppins, Noto_Sans_Sinhala } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";
import { CookieBanner } from "@/components/CookieBanner";
import { ReactQueryProvider } from '@/components/ReactQueryProvider';
import { GlobalRequestNotifications } from "@/components/GlobalRequestNotifications";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap', // Prevents Flash of Invisible Text (FOIT)
});

const notoSansSinhala = Noto_Sans_Sinhala({
  subsets: ["sinhala", "latin"],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sinhala',
  display: 'swap', // Prevents Flash of Invisible Text (FOIT)
});

export const metadata: Metadata = {
  title: {
    default: "CinemaNest - Stream Movies & TV Shows Online",
    template: "%s | CinemaNest"
  },
  description: "Watch the latest movies and TV shows online in HD quality. Stream thousands of titles across all genres on CinemaNest - Your premium streaming platform.",
  keywords: ["watch movies online", "stream tv shows", "online streaming", "HD movies", "TV series streaming", "CinemaNest"],
  authors: [{ name: "CinemaNest" }],
  creator: "CinemaNest",
  publisher: "CinemaNest",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'CinemaNest',
    title: 'CinemaNest - Stream Movies & TV Shows Online',
    description: 'Watch the latest movies and TV shows online in HD quality. Stream thousands of titles across all genres.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CinemaNest - Stream Movies & TV Shows Online',
    description: 'Watch the latest movies and TV shows online in HD quality.',
    creator: '@cinemanest',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google98b062135c89cbb3',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Preconnect to critical third-party origins for faster loading */}
        <link rel="preconnect" href="https://cdn.sanity.io" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://image.tmdb.org" />
        <link rel="preconnect" href="https://lh3.googleusercontent.com" />
        {/* DNS prefetch for additional speed optimization */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://accounts.google.com" />
      </head>
      <body className={`${poppins.variable} ${notoSansSinhala.variable} font-sans antialiased`}>
        {/* Skip to Content Link for Accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Skip to content
        </a>
        <ReactQueryProvider>
          <SessionProvider>
            <div id="main-content">
              {children}
            </div>
            <GlobalRequestNotifications />
            <CookieBanner />
          </SessionProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}