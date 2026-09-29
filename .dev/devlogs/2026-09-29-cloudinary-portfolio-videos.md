# Devlog: Cloudinary Portfolio Video Migration (Moments, Mindful, Making)

**Date:** 2026-09-29  
**Vibe:** ☕ High speed media pipeline running smooth!

### What We Did Today
We cleaned house on Cloudinary and moved all the actual portfolio videos up to the cloud! 

Previously, the Cloudinary account still held older test videos (`portfolio/edited/*` and `portfolio/raw/*`). Meanwhile, the application had evolved to three categories: **Moments**, **Mindful**, and **Making**, each with 6 videos (18 total, including high-res 4K/60fps clips and QuickTime `.mov` captures reaching up to 118MB each).

### How It Works Under The Hood
1. **Purging Old Assets:** Ran `cloudinary.api.delete_resources` against the old 9 video IDs to free up storage and avoid any stale namespace conflicts.
2. **Chunked Pipeline (`upload-portfolio-videos.mjs`):** Videos over 100MB fail on standard uploads without chunking. We wired `cloudinary.uploader.upload_large` with 20MB chunk sizes and structured the target public IDs cleanly under `portfolio/{category}/{number}_{filename}`.
3. **Format & Codec Optimization:** Mobile `.mov` files can be notoriously finicky on desktop browsers like Chrome on Windows. By generating Cloudinary delivery URLs with `f_auto,q_auto` and normalizing extensions to `.mp4`, Cloudinary handles automatic transcoding and adaptive bitrate streaming on the fly.
4. **Preserving Video Arrangement:** Everything maps 1:1 with the original grid order in `src/data/portfolio-data.ts`, referencing `src/data/cloudinary-videos.json` with fallback resilience.
5. **Moments 04 Stream Fix:** An initial chunk collision during encoding caused a NAL unit parsing error on `Moments 04` (`2 line 1.MP4`). We restored the pristine original, encoded a clean 1080p/4K-compatible H.264 stream with fast-start headers, verified stream integrity with ffmpeg, and re-uploaded it to Cloudinary. It now serves HTTP 200 OK.
6. **UX Psychology Polish:** Replaced the clinical and technical "Buffering..." copy with the warm, patient "Just a moment...". It feels natural, polite, and doesn't make visitors feel like something went wrong with their connection.
7. **Custom Favicon:** Wired up the transparent `manoli-rajput-favicon-removebg-preview.png` into Next.js App Router route icons (`icon.png`, `apple-icon.png`) and generated a 32x32 transparent `public/favicon.ico` alongside `metadata.icons` in `src/app/layout.tsx`.

Everything is rolling nicely! 🎬✨
