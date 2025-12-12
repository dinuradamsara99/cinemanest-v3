import type { Metadata } from "next";
import { Poppins, Noto_Sans_Sinhala } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const notoSansSinhala = Noto_Sans_Sinhala({
  variable: "--font-noto-sans-sinhala",
  subsets: ["sinhala"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CinemaNest - Your Home for Movies & TV Shows",
  description:
    "Stream the latest movies and TV shows on CinemaNest. Discover trending content, watch trailers, and enjoy unlimited entertainment.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${poppins.variable} ${notoSansSinhala.variable} antialiased`}
      >
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
