import type { ReactNode } from 'react';
import SidebarLayout from "../sidebar-layout";

export default function MainLayout({
    children,
}: {
    children: ReactNode;
}) {
    return <SidebarLayout>{children}</SidebarLayout>;
}
