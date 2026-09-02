# Cloudinary Video Migration & Next.js App Router Architecture

## Overview
This document details the architectural migration of the **Manoli - Frame Artist** video portfolio from a vanilla HTML/CSS/JS stack with local HLS files to a modern **Next.js App Router** application powered by **Cloudinary** and **pnpm**.

---

## 1. Batch Upload Architecture (`scripts/upload-videos.mjs`)

### Problem Statement
Large raw and edited video assets (notably `edited1.mp4` at ~155MB) easily breach default web dashboard upload thresholds and single-request HTTP timeouts.

### Solution: Chunked `upload_large`
The standalone Node.js upload script processes local videos in sequence using Cloudinary's chunked upload mechanism:
- **Direct Environment Parsing:** Reads `CLOUDINARY_URL` directly from `.env` (without external dependencies if needed) using regular expressions and URL parsing.
- **Dynamic File Resolution:** Detects files across `assets/videos/edited/`, `assets/videos/raw/`, and root directories.
- **Chunk Size Specification:** Configured to `20 * 1024 * 1024` (20 MB chunks), ensuring resilient streaming over flaky networks.
- **Target Assets Handled:**
  - `edited1.mp4` through `edited6.mp4` -> `portfolio/edited/editedX`
  - `raw1.mp4` through `raw3.mp4` -> `portfolio/raw/rawX`
- **Cloudinary Asset Limit & High-Fidelity Compression:** Cloudinary enforces a 100MB (104,857,600 bytes) hard ceiling on single video uploads for free-tier accounts. `edited1.mp4` was compressed from ~155MB to ~87.7MB using constrained high-bitrate VBR (`13.15 Mbps` video, `192 kbps` AAC audio, `libx264 -preset fast`, `+faststart`), ensuring pristine 4K 60fps quality without visible compression loss while safely clearing the upload threshold.
- **Machine-Readable Export & Resume:** Dumps a `cloudinary-videos.json` map containing `public_id`, `secure_url`, `duration`, `bytes`, and dimensions. The script checks this file on subsequent runs to avoid re-uploading already verified assets.

---

## 2. Next.js Frontend Architecture

### Core Design Principles
1. **Zero Eager Video Buffering:** The site does not download video streams on initial page load. Instead, it relies on lightweight Cloudinary auto-generated posters.
2. **Auto-Generated Posters (`f_auto,q_auto,so_auto`):** Cloudinary's video transformation pipeline produces optimized WebP/AVIF stills at a specific frame (`so_auto` or `so_1`).
- **Adaptive Streaming vs Direct Cloudinary Stream:** For large video assets (like `edited1.mp4` at ~87MB), Cloudinary returns an `HTTP 423 Locked: Resource is too large to process synchronously, processing in background` response when on-the-fly `f_auto,q_auto` transformation paths are requested on un-transcoded media. `VideoCard` serves the direct, web-optimized MP4 stream URL directly (`https://res.cloudinary.com/<cloud>/video/upload/<publicId>.mp4`), ensuring instantaneous `HTTP 200 OK` byte-range streaming without server locks.
- **Asynchronous Video Readiness (Zero Playback Stalls):** Because the `<video>` element mounts its `src` lazily upon the first interaction, playback is coordinated via `shouldPlayRef` and `onCanPlay`/`onLoadedData`. This prevents the browser from rejecting `video.play()` during the React re-render tick when `video.src` is first attached.
- **Global Playback Concurrency (`VideoPlaybackContext`):** Only one video can be active and streaming at any given time across both the edited and raw video galleries. Activating or clicking any video immediately sends a pause and defocus signal to all other cards, stopping their stream packet downloads and returning their center filter to the **"Resume"** state.
- **Interactive Play/Resume Filter & Buffering Spinner:**
  - A high-visibility frosted backdrop overlay (`z-30`, `bg-black/45 backdrop-blur-[2px]`) sits directly on top of the thumbnail by default with a glowing circular gold play button (`shadow-[0_0_30px_rgba(202,162,144,0.6)]`), urging user interaction.
  - When triggered, an animated circular `Loader2` buffering spinner indicates video load progress.
  - As soon as the video frames buffer and playback starts, the overlay smoothly fades away.
  - When focus shifts to another video or playback pauses, the overlay immediately returns displaying **"Resume"**.
  - Responsive interaction: **Hover to play on desktop** (`onMouseEnter` / `onMouseLeave`) and **Click/Tap to play on mobile** (touch capability detection).

---

## 3. Component Hierarchy

```
src/
├── app/
│   ├── layout.tsx         # Root layout with Cormorant Garamond & DM Sans Google fonts
│   ├── page.tsx           # Assembles Hero, Content Gallery, Concept, Story, Contact
│   └── globals.css        # Warm palette tokens, film grain keyframes, smooth scrolling
├── components/
│   ├── FilmGrain.tsx      # Fixed SVG fractal noise overlay for film aesthetic
│   ├── Navbar.tsx         # Fixed glassmorphic navigation with scroll blur & mobile drawer
│   ├── Hero.tsx           # Typographic headline & 3:4 profile card with fallback
│   ├── VideoGallery.tsx   # Responsive 3x2 and 3x1 grids for edited & raw videos
│   ├── VideoCard.tsx      # Phone mockup with lazy poster, deferred video, and custom controls
│   ├── Story.tsx          # "What's the puzzling part?" narrative section
│   └── Contact.tsx        # Glass contact card and footer
├── data/
│   └── portfolio-data.ts  # Structured catalog of videos with titles, letters, and public IDs
└── types/
    └── portfolio.ts       # Type definitions for video items and player state
```

---

## 4. Setup & Running Instructions

### 1. Install Dependencies
```bash
pnpm add next-cloudinary cloudinary lucide-react clsx tailwind-merge
pnpm add -D tailwindcss postcss autoprefixer typescript @types/node @types/react @types/react-dom
```

### 2. Environment Configuration
Ensure `.env.local` contains:
```env
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<cloud_name>
```

### 3. Execute Batch Video Upload
```bash
node scripts/upload-videos.mjs
```

### 4. Run Development Server
```bash
pnpm run dev
```
