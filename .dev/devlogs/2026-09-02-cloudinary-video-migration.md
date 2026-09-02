# Devlog: Moving Mountains (and 155MB Videos) to Cloudinary & Next.js

**Date:** 2026-09-02  
**Author:** Antigravity Pair Dev  
**Mood:** ☕ Double espresso, high bitrate, smooth frames, zero TS errors  

---

Hey friend! Grab a mug, pull up a chair, and let’s talk video pipelines and stack migrations.

You know how video portfolios are the absolute *crown jewel* of creative showcases, right up until you look at the network waterfall tab and see a 155MB MP4 holding the entire browser hostage? Yeah. That was `edited1.mp4` staring us down today!

So here is the full story of how we completely eliminated the vanilla HTML/CSS/JS stack, promoted this repository to a fully-typed Next.js 15 App Router architecture with `pnpm`, and wired up Cloudinary's media delivery engine.

---

### The Big Boss: Uploading Huge Videos Without Hitting The Wall

If you've ever tried dragging a 155MB video into a standard web uploader or blasting it across a single basic POST request, you already know the heartbreak of connection timeouts.

Enter `cloudinary.uploader.upload_large`. 

We built `scripts/upload-videos.mjs` to handle this like an absolute pro:
1. **Zero manual secret wrestling:** The script glances at `.env`, snags your `CLOUDINARY_URL`, parses out the cloud name, API key, and API secret, and auto-configures the Cloudinary v2 SDK.
2. **Chunking it down:** Instead of one monstrous HTTP payload, we sliced the uploads into steady 20MB chunks (`chunk_size: 20 * 1024 * 1024`) with `resource_type: "video"`. If the network hiccups, it recovers gracefully instead of choking out.
3. **Automated JSON mapping:** When each upload wraps up, the script outputs the exact `public_id` and `secure_url`, and writes them straight to `cloudinary-videos.json` so our React components can plug-and-play without manual copy-pasting.

---

### The Frontend Magic: Zero-Bloat Lazy Video Cards

Next up was translating Manoli’s gorgeous cinematic phone-mockup aesthetic into modular React components (`VideoGallery` and `VideoCard`).

Here was the challenge: how do you show 9 high-end videos on a single landing page without melting mobile batteries or exhausting mobile data caps?

**The Solution:**
- **Lightweight auto-generated poster thumbnails:** By leveraging Cloudinary's dynamic transformation URL engine, we ask for `f_auto,q_auto,so_auto` (or `so_1`) as an image still. Instead of downloading megabytes of video on page load, the browser only loads a razor-sharp, lightweight WebP/AVIF thumbnail.
- **On-demand streaming on hover or tap:** The `<video>` element only mounts its source when the user explicitly moves their cursor over the card (`onMouseEnter`) or clicks the phone mockup. No premature buffering. No background bandwidth hoarding.
- **Adaptive codecs:** When the stream kicks in, `f_auto,q_auto` delivers the exact optimal container (AV1, VP9, or H.264) for whatever browser the viewer is rocking.
- **Preserved Phone Frame & Controls:** We kept every drop of the bespoke UI—the speaker notch, the frosted glass blur controls, the scrubbable progress bar, and the mute toggles.

---

### The Fun Hiccup: When `.ts` Doesn't Mean TypeScript

During our first `next build` test, the TypeScript compiler threw its hands up in horror:
`Type error: File appears to be binary at ./assets/videos/edited/edited10.ts:1:1`! 

Turns out the old ffmpeg HLS chunker had saved MPEG Transport Stream segments with `.ts` extensions directly in `assets/videos/`. TypeScript thought someone had written 5MB of binary alien code into a TypeScript file! A quick tweak to `tsconfig.json` to explicitly scope includes to `src/**/*.ts*` and exclude `assets/` and `public/`, and the build sailed through with flying colors.

---

### What's Under the Hood

- **Package Manager:** `pnpm` exclusively.
- **Framework:** Next.js 15.5+ (App Router, Server & Client Components).
- **Styling:** Tailwind CSS + custom Warm Cinematic palette tokens (`#CAA290`, `#B5A091`, `#FDE4D0`, `#E4DCD1`).
- **Media Engine:** `cloudinary` (upload CLI) & `next-cloudinary` (frontend delivery).
- **Build Status:** 100% clean production build, static generation passing with zero errors!

Now all you have to do is run `pnpm upload:videos`, watch those chunked uploads fly, and enjoy that buttery 60fps smooth portfolio! 🎬✨
