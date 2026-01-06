import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DynamicSidebar } from "@/components/DynamicSidebar";
import { LayoutSkeleton } from "@/components/LayoutSkeleton";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteHeaderContent } from "@/components/SiteHeaderContent";
import { SiteFooter } from "@/components/SiteFooter";


export default function SidebarLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded"
      >
        Skip to content
      </a>

      <Suspense fallback={<LayoutSkeleton />}>
        <SidebarProvider>
          <DynamicSidebar />

          <SidebarInset className="flex flex-col min-h-screen">
            <SiteHeader>
              <SiteHeaderContent />
            </SiteHeader>

            <main id="main-content" className="flex-1">
              {children}
            </main>

            <SiteFooter />
          </SidebarInset>
        </SidebarProvider>
      </Suspense>
    </>
  );
}
