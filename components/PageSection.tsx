import { client } from "@/sanity/lib/client";
import { pageShowcaseQuery } from "@/sanity/queries";
import PageSlider from "./PageSlider";

interface Page {
    _id: string;
    title: string;
    slug?: string;
    description?: string;
    mainImage?: { asset?: { _ref: string } };
}

export default async function PageSection() {
    const pages: Page[] = await client.fetch(pageShowcaseQuery);

    // Mock Data Fallback so the user can see the UI immediately
    let validPages = pages;

    if (!validPages || validPages.length < 4) {
        const MOCK_PAGES: Page[] = [
            {
                _id: "mock-1",
                title: "Home",
                description: "Discover the latest hits",
                mainImage: {
                    asset: {
                        _ref: "image-tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg" // using a fake ref or we need to handle null image in slider
                    }
                }
            },
            {
                _id: "mock-2",
                title: "TV Shows",
                description: "Binge-worthy series",
                mainImage: {
                    asset: {
                        // Placing a dummy image object so urlFor doesn't crash requires a valid-looking ref
                        // or we update PageSlider to handle missing images better.
                        // Ideally we want real images. 
                        // Let's use a flag or just empty images if we can't get real ones.
                        _ref: "image-mock-id"
                    }
                }
            },
            {
                _id: "mock-3",
                title: "Categories",
                description: "Browse by genre",
                mainImage: { asset: { _ref: "image-mock-id" } }
            },
            {
                _id: "mock-4",
                title: "Languages",
                description: "Explore global content",
                mainImage: { asset: { _ref: "image-mock-id" } }
            }
        ];
        // Since we don't have real sanity image refs, we need to handle this in PageSlider 
        // OR we just assume the user will overlook broken images for a second while looking at the slider.
        // BETTER: Let's pass a "isMock" flag or handle the image URL generation safely in PageSlider.

        // Actually, let's just use the MOCK_PAGES but we need to ensure urlFor doesn't explode.
        // The current PageSlider uses urlFor(page.mainImage).url(). 
        // This will error if we pass fake refs that the SDK tries to parse.
        // We should fallback to placeholders in PageSlider if image url generation fails or return a static URL.

        // Changing approach: Update PageSlider to handle missing/mock images.
        validPages = MOCK_PAGES;
    }

    const desiredOrder = ["Home", "TV Shows", "Categories", "Languages"];
    const sortedPages = validPages.sort((a, b) => {
        return desiredOrder.indexOf(a.title) - desiredOrder.indexOf(b.title);
    });

    return (
        <section>
            <PageSlider pages={sortedPages} />
        </section>
    );
}
