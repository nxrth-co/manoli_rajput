# Cloudinary Portfolio Video Migration

## Overview
This document details the migration of portfolio videos from local filesystem assets (`/public/videos/`) to Cloudinary remote media hosting for the three core categories: **Moments**, **Mindful**, and **Making**.

## Key Objectives Completed
1. **Cloudinary Cleanup**: Purged all deprecated video resources (`portfolio/edited/*`, `portfolio/raw/*`) from the Cloudinary account (`xo4kifry`).
2. **Chunked Large Video Uploads**: Created and executed `scripts/upload-portfolio-videos.mjs` using `cloudinary.uploader.upload_large` with 20MB chunking to upload high-definition video files safely without network timeouts.
3. **Preserved Video Arrangement**: Retained the exact original sequence and categorization of all 18 videos across the three categories (6 videos per category):
   - **Moments**: 1 line 1.mp4, 1 line 2.mp4, 1 line 3.mp4, 2 line 1.MP4, 2 line 2.MOV, 2 line 3.mp4
   - **Mindful**: 1 line 1.MOV, 1 line 2.MP4, 1 line 3.MP4, 2 line 1.MOV, 2 line 2.MP4, 2 line 3.MP4
   - **Making**: IMG_0708.mov, IMG_0863.mov, IMG_1039.mov, IMG_1884.mov, IMG_7917.MOV, IMG_8021.mov
4. **Universal Delivery Optimization**: Generated Cloudinary delivery URLs with `f_auto,q_auto` and `.mp4` transcoding to guarantee universal cross-browser playback for QuickTime `.mov` and Apple HEVC files.
5. **Dynamic Data Fetching**: Updated `src/data/portfolio-data.ts` to consume Cloudinary URLs from `cloudinary-videos.json` with fallback support for local paths.
6. **Moments 04 Stream Validation**: Repaired and re-uploaded `Moments 04` (`2 line 1.MP4`) with standard H.264 + AAC encoding, resolving a corrupt NAL stream issue and achieving clean HTTP 200 delivery.
7. **UX Microcopy Polish**: Replaced the technical and error-implying `"Buffering..."` loader with the warm, psychological microcopy `"Just a moment..."` in [VideoCard.tsx](file:///c:/Users/SIS/Documents/VSCode/manoli_rajput1/src/components/VideoCard.tsx).
8. **Custom Favicon Integration**: Configured `manoli-rajput-favicon-removebg-preview.png` across Next.js App Router icon conventions (`src/app/icon.png`, `src/app/apple-icon.png`, `public/favicon.ico`, and `metadata.icons` in `src/app/layout.tsx`), preserving full alpha transparency.

## Script Usage
To rerun or force re-upload:
```bash
pnpm upload:portfolio
# or with force flag
node scripts/upload-portfolio-videos.mjs --force
```
