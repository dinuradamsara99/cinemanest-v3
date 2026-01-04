import { getCategories, getLanguages } from "@/lib/data";
import { SidebarContent } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

export async function DynamicSidebar() {
  const [categories, languages] = await Promise.all([
    getCategories(),
    getLanguages(),
  ]);

  return <AppSidebar categories={categories} languages={languages} />;
}