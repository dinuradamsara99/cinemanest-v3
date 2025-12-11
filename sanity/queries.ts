import { groq } from "next-sanity";

export const pageShowcaseQuery = groq`*[_type == "page" && title in ["Home", "TV Shows", "Categories", "Languages"]] {
  _id,
  title,
  "slug": slug.current,
  description,
  mainImage
}`;
