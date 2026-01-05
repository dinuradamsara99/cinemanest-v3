import type { ReactNode } from 'react';
import SidebarLayout from "@/app/sidebar-layout";

export default function CategoryLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <SidebarLayout>{children}</SidebarLayout>;
}