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
- **Machine-Readable Export:** Dumps a `cloudinary-videos.json` map containing `public_id`, `secure_url`, `duration`, `bytes`, and dimensions for direct consumption by the frontend.

---

## 2. Next.js Frontend Architecture

### Core Design Principles
1. **Zero Eager Video Buffering:** The site does not download video streams on initial page load. Instead, it relies on lightweight Cloudinary auto-generated posters.
2. **Auto-Generated Posters (`f_auto,q_auto,so_auto`):** Cloudinary's video transformation pipeline produces optimized WebP/AVIF stills at a specific frame (`so_auto` or `so_1`).
3. **Hover & Click Activation:** Video elements only mount their media stream and begin buffering when triggered by user hover (`onMouseEnter`) or tap/click.
4. **Adaptive Streaming & Delivery (`f_auto,q_auto`):** Video streams are dynamically delivered in modern formats (AV1, VP9, or H.264) tailored to the requesting browser's codecs and network conditions.
5. **Faithful Visual Parity:** Preserves the bespoke phone mockup container, custom play/pause/mute controls, time scrub progress bar, film grain noise canvas, and warm cinematic palette (`#CAA290`, `#B5A091`, `#FDE4D0`, `#E4DCD1`).

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
