// Sanity image type definitions
export interface SanityImageAsset {
    _ref: string;
    _type: 'reference';
}

export interface SanityImageAssetFull {
    _id: string;
    _type: 'sanity.imageAsset';
    url: string;
}

export interface SanityImage {
    _type: 'image';
    asset: SanityImageAsset | SanityImageAssetFull;
    alt?: string;
}

export interface SanityImageWithHotspot extends SanityImage {
    hotspot?: {
        x: number;
        y: number;
        height: number;
        width: number;
    };
    crop?: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
}

// Generic Sanity reference type
export interface SanityReference<T = string> {
    _ref: string;
    _type: 'reference';
    _key?: string;
}

// Sanity slug type
export interface SanitySlug {
    _type: 'slug';
    current: string;
}
