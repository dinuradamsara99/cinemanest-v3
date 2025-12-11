"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { WatchProgressProvider } from "@/context/WatchProgressContext";
import SidebarWrapper from "@/components/SidebarWrapper";
import Navbar from "@/components/Navbar/Navbar";
import styles from "./ClientLayout.module.css";

interface ClientLayoutProps {
  children: React.ReactNode;
}

function MainContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed, hasMounted } = useSidebar();
  const pathname = usePathname();
  const isStudio = pathname?.startsWith('/studio');

  if (isStudio) {
    return <main className={styles.mainContentStudio}>{children}</main>;
  }

  // Use consistent value during SSR/hydration, only apply dynamic margin after mount
  const marginLeft = hasMounted ? (isCollapsed ? '80px' : '260px') : '260px';

  return (
    <main
      className={styles.mainContent}
      style={{
        marginLeft,
        transition: 'margin-left 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {children}
    </main>
  );
}

function ContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStudio = pathname?.startsWith('/studio');

  if (isStudio) {
    return <main className={styles.mainContentStudio}>{children}</main>;
  }

  return (
    <>
      <Navbar />
      {/* Sidebar එක layoutContainer එකෙන් එළියට ගත්තා */}
      <SidebarWrapper />
      
      <div className={styles.layoutContainer}>
        <MainContent>{children}</MainContent>
      </div>
    </>
  );
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <WatchProgressProvider>
      <WishlistProvider>
        <SidebarProvider>
          <ContentWrapper>{children}</ContentWrapper>
        </SidebarProvider>
      </WishlistProvider>
    </WatchProgressProvider>
  );
}
