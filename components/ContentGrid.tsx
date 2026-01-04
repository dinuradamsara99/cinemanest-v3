"use client";

import { ReactNode } from "react";

interface ContentGridProps {
    title: string;
    children: ReactNode;
}

export function ContentGrid({ title, children }: ContentGridProps) {
    return (
        <section className="w-full py-8">
            {/* Hero Section එකේ තිබුණු p-4 md:p-8 එකට ගැලපෙන්න 
               මෙතනත් px-4 md:px-8 දැම්මා. 
               දැන් උඩ Hero එකයි මේ Grid එකයි කෙලින්ම Align වෙනවා.
            */}
            <div className="w-full px-4 pb-4 md:px-8 md:pb-8">
                {/* Section Title */}
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-6">
                    {title}
                </h2>

                {/* Responsive Grid Layout */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
                    {children}
                </div>
            </div>
        </section>
    );
}