import type { ReactNode } from 'react';
import SidebarLayout from "../../../app/sidebar-layout";

export default function LanguageLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <SidebarLayout>{children}</SidebarLayout>;
}