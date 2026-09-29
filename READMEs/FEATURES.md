# Features & Architectural Updates

This document tracks all features, modules, and migrations implemented in this codebase.

## Implemented Features

- [Cloudinary Video Migration & Next.js App Router Architecture](../docs/cloudinary-video-migration.md) - Batch chunked upload script (`upload_large`) for large video assets (>140MB), Next.js App Router modular component migration (`VideoGallery`, `VideoCard`), and lazy-loading with auto-generated thumbnails (`f_auto,q_auto`).
- [Cloudinary Portfolio Video Migration (Moments, Mindful, Making)](../docs/cloudinary-portfolio-videos-migration.md) - Purged legacy Cloudinary video assets, uploaded all 18 portfolio videos across Moments, Mindful, and Making via chunked uploader, and updated data provider with optimized delivery URLs.
- [Video Playback Frame State & Black Overlay Fix](../docs/fix-video-playback-overlay.md) - Resolved stuck dark placeholder overlays by inspecting `readyState` on mount, binding frame presence to playback and timeupdate events, and dynamically fading out underlying watermark layers upon playback.
- [Hydration Mismatch Resolution (Browser Extensions)](../docs/hydration-mismatch-fix.md) - Applied `suppressHydrationWarning` to root layout `<html>` and `<body>` elements to suppress false-positive mismatch warnings from browser extension attribute injections (`cz-shortcut-listen`).
