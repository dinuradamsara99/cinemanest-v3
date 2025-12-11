"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { WatchProgressProvider } from "@/context/WatchProgressContext";
import Sidebar from "@/components/Sidebar/Sidebar";
import styles from "./ClientLayout.module.css";

interface ClientLayoutProps {
  children: React.ReactNode;
}

// Wrapper handles studio layout vs standard layout
function ContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStudio = pathname?.startsWith("/studio");

  if (isStudio) {
    return <main className={styles.mainContentStudio}>{children}</main>;
  }

  return (
    <>
      <Sidebar />
      <main className={styles.mainContent}>{children}</main>
    </>
  );
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <WatchProgressProvider>
      <ContentWrapper>{children}</ContentWrapper>
    </WatchProgressProvider>
  );
}
