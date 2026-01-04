import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DynamicSidebar } from "@/components/DynamicSidebar";
import { LayoutSkeleton } from "@/components/LayoutSkeleton";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteHeaderContent } from "@/components/SiteHeaderContent";


export default async function SidebarLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={<LayoutSkeleton />}>
      <SidebarProvider>
        <DynamicSidebar />

        <SidebarInset>
          <SiteHeader>
            <SiteHeaderContent />
          </SiteHeader>

          <main className="flex-1">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </Suspense>
  );
}
