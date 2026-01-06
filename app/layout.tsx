import type { Metadata } from "next";
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
});

const notoSansSinhala = Noto_Sans_Sinhala({
  subsets: ["sinhala", "latin"],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sinhala',
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
  metadataBase: new URL('https://cinemanest.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://cinemanest.com',
    siteName: 'CinemaNest',
    title: 'CinemaNest - Stream Movies & TV Shows Online',
    description: 'Watch the latest movies and TV shows online in HD quality. Stream thousands of titles across all genres.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CinemaNest - Streaming Platform',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CinemaNest - Stream Movies & TV Shows Online',
    description: 'Watch the latest movies and TV shows online in HD quality.',
    creator: '@cinemanest',
    images: ['/og-image.png'],
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
      <body className={`${poppins.variable} ${notoSansSinhala.variable} font-sans antialiased`}>
        <ReactQueryProvider>
          <SessionProvider>
            {children}
            <GlobalRequestNotifications />
            <CookieBanner />
          </SessionProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}