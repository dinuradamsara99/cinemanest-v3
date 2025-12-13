# CinemaNest Watch Page Redesign Specification

## Overview

This document presents a comprehensive redesign of the WatchPageClient for CinemaNest, transforming it into a premium streaming platform experience that rivals Netflix and YouTube. The redesign focuses on responsive design, enhanced user experience, and modern UI patterns while maintaining all existing functionality.

## Visual Wireframes

### Desktop Layout (1024px+)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│  ← Back to Library    [TV Series]                                                   [User] │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                             │
│  ████████████████████████████████████ Video Player █████████████████████████████████████   │
│  █                                                                                        █   │
│  █  [Controls Overlay]                                                                    █   │
│  █                                                                                        █   │
│  █                                                                                        █   │
│  █                                                                                        █   │
│  █                                                                                        █   │
│  █                                                                                        █   │
│  █                                                                                        █   │
│  █                                                                                        █   │
│  █                                                                                        █   │
│  █                                                                                        █   │
│  █                                                                                        █   │
│  ████████████████████████████████████████████████████████████████████████████████████████   │
│                                                                                             │
│  ┌───────────────────────────────────────────────┐  ┌────────────────────────────────────┐  │
│  │           Movie Title (Large)                 │  │           Episode List             │  │
│  │                                               │  │                                    │  │
│  │  ★ 8.7   2023   120 min   English            │  │  Season 1 ▼                        │  │
│  │                                               │  │  ┌──────────────────────────────┐  │  │
│  │  [Action] [Comedy] [Drama]                    │  │  │ E1 · Pilot                   │  │  │
│  │                                               │  │  │ E2 · The Journey Begins      │  │  │
│  │  Lorem ipsum dolor sit amet, consectetur      │  │  │ E3 · New Challenges          │  │  │
│  │  adipiscing elit. Sed do eiusmod tempor       │  │  │ ...                          │  │  │
│  │  incididunt ut labore et dolore magna aliqua. │  │  └──────────────────────────────┘  │  │
│  │  Ut enim ad minim veniam, quis nostrud        │  │                                    │  │
│  │  exercitation ullamco laboris nisi ut aliquip │  │  [Related Content Grid]            │  │
│  │  ex ea commodo consequat.                     │  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐      │  │
│  │                                               │  │  │ M1 │ │ M2 │ │ M3 │ │ M4 │      │  │
│  │  [ ▶ Watch Now ] [ ⓘ Info ]                  │  │  └────┘ └────┘ └────┘ └────┘      │  │
│  │                                               │  │                                    │  │
│  │                                               │  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐      │  │
│  │                                               │  │  │ M5 │ │ M6 │ │ M7 │ │ M8 │      │  │
│  │                                               │  │  └────┘ └────┘ └────┘ └────┘      │  │
│  └───────────────────────────────────────────────┘  └────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Tablet Layout (768px-1023px)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  ← Back to Library    [TV Series]                                     [User]   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ███████████████████████████████ Video Player ███████████████████████████████   │
│  █                                                                            █   │
│  █  [Controls Overlay]                                                        █   │
│  █                                                                            █   │
│  █                                                                            █   │
│  █                                                                            █   │
│  █                                                                            █   │
│  █                                                                            █   │
│  █                                                                            █   │
│  █                                                                            █   │
│  █                                                                            █   │
│  █                                                                            █   │
│  █████████████████████████████████████████████████████████████████████████████   │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                      Movie Title (Medium)                                 │  │
│  │                                                                           │  │
│  │  ★ 8.7   2023   120 min   English                                        │  │
│  │                                                                           │  │
│  │  [Action] [Comedy] [Drama]                                                │  │
│  │                                                                           │  │
│  │  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod   │  │
│  │  tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim     │  │
│  │  veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea  │  │
│  │  commodo consequat.                                                       │  │
│  │                                                                           │  │
│  │  [ ▶ Watch Now ] [ ⓘ Info ]                                              │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                           Episode List                                    │  │
│  │                                                                           │  │
│  │  Season 1 ▼                                                               │  │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │  │
│  │  │ E1 · Pilot                                                          │  │  │
│  │  │ E2 · The Journey Begins                                             │  │  │
│  │  │ E3 · New Challenges                                                 │  │  │
│  │  │ ...                                                                 │  │  │
│  │  └─────────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                         Related Content                                 │  │
│  │                                                                         │  │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                              │  │
│  │  │ M1 │ │ M2 │ │ M3 │ │ M4 │ │ M5 │ │ M6 │                              │  │
│  │  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘                              │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Mobile Layout (<768px)

```
┌─────────────────────────────────────────────────────┐
│  ←    Movie Title                       [⋯]       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ███████████████████ Video Player ████████████████  │
│  █                                                █  │
│  █  [Controls Overlay]                            █  │
│  █                                                █  │
│  █                                                █  │
│  █                                                █  │
│  █                                                █  │
│  █                                                █  │
│  █                                                █  │
│  █                                                █  │
│  █                                                █  │
│  ██████████████████████████████████████████████████  │
│                                                     │
│  ┌─────────────────────────────────────────────────┐ │
│  │              Movie Information                 │ │
│  │                                                 │ │
│  │  ★ 8.7   2023   120 min   English              │ │
│  │                                                 │ │
│  │  [Action] [Comedy] [Drama]                      │ │
│  │                                                 │ │
│  │  Lorem ipsum dolor sit amet, consectetur        │ │
│  │  adipiscing elit. Sed do eiusmod tempor         │ │
│  │  incididunt ut labore et dolore magna aliqua.   │ │
│  │                                                 │ │
│  │  [Show More]                                    │ │
│  │                                                 │ │
│  │  [ ▶ Watch Now ] [ ⓘ Info ]                    │ │
│  └─────────────────────────────────────────────────┘ │
│                                                     │
│  ┌─────────────────────────────────────────────────┐ │
│  │              Episode List                       │ │
│  │                                                 │ │
│  │  Season 1 ▼                                     │ │
│  │  ┌───────────────────────────────────────────┐  │ │
│  │  │ E1 · Pilot                                │  │ │
│  │  │ E2 · The Journey Begins                   │  │ │
│  │  │ E3 · New Challenges                       │  │ │
│  │  │ ...                                       │  │ │
│  │  └───────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────┘ │
│                                                     │
│  ┌─────────────────────────────────────────────────┐ │
│  │              Related Content                    │ │
│  │                                                 │ │
│  │  ┌────┐ ┌────┐                                  │ │
│  │  │ M1 │ │ M2 │                                  │ │
│  │  └────┘ └────┘                                  │ │
│  │                                                 │ │
│  │  ┌────┐ ┌────┐                                  │ │
│  │  │ M3 │ │ M4 │                                  │ │
│  │  └────┘ └────┘                                  │ │
│  └─────────────────────────────────────────────────┘ │
│                                                     │
│  [ ▶ ] 01:25:30 / 02:05:10                          │
└─────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Video Player Component

#### Features:

- Fully responsive with fluid scaling
- Maintains 16:9 aspect ratio
- Adaptive controls based on device:
  - Desktop: Full controls with tooltips
  - Mobile: Minimal controls with gesture support
- Advanced playback features:
  - Play/Pause, Seek Bar, Volume Control
  - Captions/Subtitles
  - Playback Speed (0.5x, 1x, 1.25x, 1.5x, 2x)
  - Quality Selection (Auto, 1080p, 720p, 480p)
  - Fullscreen, Picture-in-Picture
- Gesture Support (Mobile):
  - Single tap: Show/hide controls
  - Double tap: Seek +/- 10 seconds
  - Horizontal swipe: Seek
  - Vertical swipe (left/right): Adjust brightness/volume
- Keyboard Shortcuts:
  - Space/Key K: Play/Pause
  - Arrow Keys: Seek (Left/Right 10s, Up/Down Volume)
  - Key F: Fullscreen
  - Key M: Mute
  - Key C: Captions
  - Key I: Picture-in-Picture

### 2. Media Header Component

#### Structure:

- Back Navigation: Prominent back button to library
- Content Type Badge: Clearly identifies Movie/TV Series
- Hero Banner: Large visual element with gradient overlay
- Title: Large, prominent display
- Metadata: Rating, year, duration, language
- Genres: Tag-based display
- Description: Expandable/collapsible with "Show More/Less"
- Action Buttons:
  - Primary: Play/Resume
  - Secondary: Add to Watchlist, Share, More Options

### 3. Primary Content Area

#### Sections:

- Media Details:
  - Detailed description with expand/collapse
  - Cast/Crew information (if available)
  - Awards/Recognition
- Interactive Elements:
  - Like/Dislike buttons
  - Add to playlist/watchlist
  - Share options

### 4. Secondary Content Area

#### Episode List (TV Shows):

- Season Selector: Dropdown with all seasons
- Episode Grid/List:
  - Visual indicator for currently playing episode
  - Episode number, title, duration
  - Thumbnail image
  - Progress indicator for partially watched episodes
- Search/Filter: Ability to search episodes by title or number

#### Related Content:

- Responsive Grid:
  - Desktop: 4 columns
  - Tablet: 3 columns
  - Mobile: 2 columns (scrollable horizontally)
- Content Cards:
  - Poster image
  - Title
  - Year and rating
  - Quick play option on hover

### 5. Mobile Bottom Bar (Mobile Only)

#### Features:

- Mini Player: Collapsed player view with progress
- Quick Actions: Play/Pause, Skip Forward/Backward
- Navigation: Easy access to key sections

## Interaction Notes

### Video Player Interactions:

1. **Desktop Experience:**
   - Mouse hover reveals full controls
   - Click and drag on progress bar to seek
   - Volume slider expands on hover
   - Settings menu accessible via gear icon
   - Tooltips appear on hover for all controls

2. **Mobile Experience:**
   - Single tap toggles control visibility
   - Double tap seeks 10 seconds forward/backward
   - Horizontal swipe anywhere on screen seeks
   - Vertical swipe on left side adjusts brightness
   - Vertical swipe on right side adjusts volume
   - Controls auto-hide after 3 seconds of inactivity

3. **Keyboard Navigation:**
   - Tab key cycles through all interactive elements
   - Enter/Space activates focused element
   - Arrow keys adjust sliders and navigate menus
   - Escape key closes menus and dialogs

### Page Navigation:

1. **Scroll Behavior:**
   - Header becomes sticky on scroll
   - Progress indicator for page completion
   - Smooth scrolling to sections when linked

2. **Focus Management:**
   - Focus trapped within modal dialogs
   - Focus returns to triggering element after closing overlays
   - Visible focus indicators for all interactive elements

3. **Loading States:**
   - Skeleton loaders for all content areas
   - Progress indicators for video buffering
   - Placeholder images with blur-up effect

## Functional Prototype User Flows

### Playback Flow:

1. **Initial Load:**
   - Video player loads with poster image
   - Metadata and controls displayed
   - Related content loads asynchronously

2. **Play Initiation:**
   - User clicks play button or presses spacebar
   - Video begins loading with spinner
   - Controls auto-hide after 3 seconds

3. **During Playback:**
   - User interacts with controls (seek, volume, fullscreen)
   - Progress saved periodically for resume functionality
   - Adaptive bitrate streaming based on connection speed

4. **Playback Completion:**
   - "Next Episode" prompt for TV series
   - "Related Content" suggestions
   - Option to return to library

### Episode Switching Flow (TV Shows):

1. **Navigate to Episode List:**
   - User scrolls to episode section or clicks episode button
   - Season selector expands to show all seasons
   - Episodes for current season displayed

2. **Select Episode:**
   - User clicks on desired episode
   - Previous video stops and unloads
   - New video loads with poster image
   - Metadata updates to reflect new episode

3. **Playback Begins:**
   - Same flow as initial playback
   - Progress tracking for new episode

## Developer-Ready UX Specification

### Component Architecture:

```
WatchPageClient
├── VideoPlayer
│   ├── PlayerControls
│   │   ├── PlayPauseButton
│   │   ├── ProgressSeekBar
│   │   ├── VolumeControl
│   │   ├── CaptionsButton
│   │   ├── SettingsMenu
│   │   ├── FullscreenButton
│   │   └── PipButton
│   └── GesturesHandler (Mobile)
├── MediaHeader
│   ├── BackButton
│   ├── ContentTypeBadge
│   ├── HeroBanner
│   ├── MediaTitle
│   ├── MediaMetadata
│   ├── GenreTags
│   ├── MediaDescription
│   └── ActionButtons
├── PrimaryContentArea
│   ├── MediaDetails
│   └── InteractiveElements
├── SecondaryContentArea
│   ├── EpisodeList
│   │   ├── SeasonSelector
│   │   ├── EpisodeGrid
│   │   └── EpisodeSearch
│   └── RelatedContent
│       └── ContentGrid
└── MobileBottomBar (Mobile Only)
```

### State Management:

1. **Player State:**
   - Playing/Paused status
   - Current time and duration
   - Volume level and mute status
   - Playback speed
   - Quality selection
   - Fullscreen/PiP status

2. **Page State:**
   - Media metadata
   - Episode list data
   - Related content
   - UI visibility states (description expanded, etc.)

3. **User State:**
   - Watch progress
   - Preferences (captions, quality, etc.)
   - Watchlist status

### Responsive Implementation:

1. **Breakpoints:**
   - Mobile: <768px
   - Tablet: 768px-1023px
   - Desktop: 1024px+

2. **Techniques:**
   - CSS Grid for complex layouts
   - Flexbox for simpler arrangements
   - Container queries where supported
   - Component-level responsiveness

### Accessibility Requirements:

1. **Semantic HTML:**
   - Proper heading hierarchy
   - Landmark regions (main, nav, aside)
   - Descriptive link text

2. **ARIA Implementation:**
   - Roles for player controls
   - Live regions for status updates
   - Proper labeling of interactive elements

3. **Keyboard Navigation:**
   - Logical tab order
   - Focus indicators for all interactive elements
   - Shortcut keys for common actions

4. **Screen Reader Support:**
   - ARIA labels for icons
   - Status announcements for player events
   - Descriptive text for visual elements

### Performance Considerations:

1. **Loading Strategies:**
   - Lazy loading for non-critical content
   - Progressive image loading with blur placeholders
   - Code splitting for non-essential features

2. **Video Optimization:**
   - Adaptive bitrate streaming
   - Preload metadata only
   - Efficient caching strategies

3. **DOM Efficiency:**
   - Virtualized lists for episode listings
   - Conditional rendering of non-critical components
   - Memoization for expensive calculations

## Conclusion

This redesign specification provides a comprehensive roadmap for transforming the current watch page into a premium streaming experience. The focus on responsive design, accessibility, and performance ensures a high-quality experience across all devices and user needs. The detailed wireframes and component breakdown provide developers with clear implementation guidelines while the interaction notes ensure a consistent user experience.
