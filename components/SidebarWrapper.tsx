"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import type { Language, Category } from "@/types/movie";

export default function SidebarWrapper() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching sidebar data...");

        // Fetch from API routes instead of direct Sanity queries
        const [languagesResponse, categoriesResponse] = await Promise.all([
          fetch("/api/languages"),
          fetch("/api/categories"),
        ]);

        if (!languagesResponse.ok || !categoriesResponse.ok) {
          throw new Error("Failed to fetch data from API");
        }

        const [fetchedLanguages, fetchedCategories] = await Promise.all([
          languagesResponse.json(),
          categoriesResponse.json(),
        ]);

        console.log("Languages fetched:", fetchedLanguages);
        console.log("Categories fetched:", fetchedCategories);
        setLanguages(fetchedLanguages || []);
        setCategories(fetchedCategories || []);
      } catch (error) {
        console.error("Failed to fetch sidebar data:", error);
        // Better error handling for different error types
        if (error instanceof Error) {
          console.error("Sidebar data fetch error details:", {
            message: error.message,
            stack: error.stack,
            name: error.name,
          });
        } else if (typeof error === "object" && error !== null) {
          console.error(
            "Sidebar data fetch error object:",
            JSON.stringify(error)
          );
        } else {
          console.error("Sidebar data fetch unknown error:", error);
        }
        // Set empty arrays as fallback to prevent UI crashes
        setLanguages([]);
        setCategories([]);
      }
    };

    fetchData();
  }, []);

  return <Sidebar languages={languages} categories={categories} />;
}
