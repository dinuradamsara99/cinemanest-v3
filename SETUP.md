# CinemaNest Setup Guide

Complete setup instructions for the CinemaNest Movie Streaming Web Application.

## Prerequisites

- Node.js 18+ installed
- A Sanity.io account (free tier works great)
- Git (optional, for version control)

## 1. Environment Variables Setup

Your Sanity project credentials are already configured in `.env.local`:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=vny5bdvr
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
```

### Optional: Add API Token for Write Operations

If you need to create/update content programmatically from the Next.js app:

1. Go to https://www.sanity.io/manage/personal/tokens
2. Create a new token with "Editor" or "Administrator" permissions
3. Add to `.env.local`:
   ```env
   SANITY_API_TOKEN=your_token_here
   ```

> **Note:** API tokens are not required for reading public data. Only add if needed.

## 2. CORS Configuration

CORS has been automatically configured for `http://localhost:3000` during setup.

### Add Additional Domains

To add more allowed origins (e.g., for production):

1. Go to https://www.sanity.io/manage
2. Select your project (vny5bdvr)
3. Navigate to **API** → **CORS Origins**
4. Click **Add CORS Origin**
5. Add your domains:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`
6. Check **Allow credentials** if using authenticated requests

## 3. Install Dependencies

Dependencies are already installed. If you need to reinstall:

```bash
npm install --legacy-peer-deps
```

## 4. Start Development Servers

### Start Next.js Development Server

```bash
npm run dev
```

The app will be available at: http://localhost:3000

### Start Sanity Studio (Content Management)

```bash
npm run sanity
```

Sanity Studio will be available at: http://localhost:3333

## 5. Add Sample Movie Data

1. Open Sanity Studio at http://localhost:3333
2. Click **Movie** to create a new movie
3. Fill in the required fields:
   - **Title**: Movie name
   - **Slug**: Auto-generated from title (click "Generate")
   - **Poster Image**: Upload vertical movie poster (recommended: 300x450px)
   - **Banner Image**: Upload horizontal banner (recommended: 1920x1080px)
   - **Rating**: 0-10 rating
   - **Is Featured**: Toggle ON for at least one movie (appears in hero slider)
   - **Description**: Brief overview
   - **Release Year**: e.g., 2024
   - **Duration**: Runtime in minutes
   - **Genre**: Select one or more genres
4. Click **Publish**
5. Create at least 2-3 movies for testing

> **Pro Tip:** Set "Is Featured" to true for 2-3 movies to see the auto-rotating hero slider in action.

## 6. Verify Everything Works

### Checklist:

- [ ] Home page loads at http://localhost:3000
- [ ] Navbar appears at the top with search bar
- [ ] Sidebar shows navigation links
- [ ] Hero section displays featured movie(s)
- [ ] Hero slider auto-rotates (if multiple featured movies)
- [ ] "Continue Watching" section shows movie cards
- [ ] Movie cards display images, titles, and ratings
- [ ] Clicking a movie navigates to watch page
- [ ] Watch page shows movie details
- [ ] No console errors

## 7. Troubleshooting

### "Missing environment variable" Error

Make sure `.env.local` exists in the root directory with all required variables.

### Images Not Loading

1. Check that images are published in Sanity Studio
2. Verify CORS is configured for localhost:3000
3. Check browser console for errors

### Sanity Studio Not Starting

1. Make sure port 3333 is not in use
2. Try: `npm run sanity -- --port 3334` to use a different port

### Build Errors

1. Clear Next.js cache: `rm -rf .next`
2. Reinstall dependencies: `npm install --legacy-peer-deps`
3. Rebuild: `npm run build`

## 8. Project Structure

```
cinemanest/
├── app/
│   ├── api/
│   │   ├── categories/
│   │   │   └── route.ts
│   │   ├── languages/
│   │   │   └── route.ts
│   │   └── search/
│   │       └── route.ts
│   ├── category/[slug]/
│   │   ├── page.module.css
│   │   └── page.tsx
│   ├── language/[slug]/
│   │   ├── page.module.css
│   │   └── page.tsx
│   ├── studio/[[...tool]]/
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── tv-shows/
│   │   ├── page.module.css
│   │   └── page.tsx
│   ├── watch/[slug]/
│   │   ├── WatchPageClient.tsx
│   │   ├── page.module.css
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── not-found.tsx
│   ├── page.module.css
│   └── page.tsx
├── components/
│   ├── Navbar/               # Top navigation bar
│   ├── HeroSection/          # Auto-rotating banner slider
│   ├── MovieCard/            # Individual movie card
│   ├── MovieRow/             # Horizontal movie list
│   └── SkeletonLoader/       # Loading state components
├── lib/
│   └── sanity.ts             # Sanity client & GROQ queries
├── sanity/
│   ├── schemaTypes/          # Content schemas
│   │   ├── movieType.ts      # Movie schema
│   │   └── categoryType.ts   # Category schema
│   └── env.ts                # Sanity environment config
├── types/
│   └── movie.ts              # TypeScript interfaces
└── .env.local                # Environment variables (not in git)
```

## 9. Next Steps

### Add More Content Types

- TV Shows
- Actors/Cast
- Reviews

### Enhance Features

- User authentication
- Watchlists/Favorites
- Search functionality
- Video streaming integration

### Deploy to Production

1. Deploy Sanity Studio to Sanity hosting
2. Deploy Next.js app to Vercel/Netlify
3. Update CORS settings for production domain

## Support

- Sanity Docs: https://www.sanity.io/docs
- Next.js Docs: https://nextjs.org/docs
- Project GitHub: (add your repo URL)

---

**Happy Streaming! 🎬**
