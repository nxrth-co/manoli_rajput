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

Enter `cloudinary.uploader.upload_large` and smart bitrate targeting.

When we first blasted `edited1.mp4` across the pipe, Cloudinary fired back:
`File size too large. Got 125829120. Maximum is 104857600.`
Classic! Cloudinary free tier accounts enforce a hard 100MB cap per video asset.

To solve this without sacrificing a single drop of visual quality:
1. **Pristine 4K VBR Encode:** We calculated the exact bitrate needed for a 56.4s video to land under 90MB: `13.15 Mbps` video + `192 kbps` high-fidelity AAC audio, encoded with `libx264 -preset fast` and `+faststart`. The file shrank from 155MB down to **87.7 MB (83.68 MiB)** while preserving razor-sharp 4K 60fps clarity.
2. **Chunked Upload Success:** The script uploaded `edited1.mp4` in 20MB chunks in 62.3 seconds with 100% success!
3. **Smart Resume Capability:** We upgraded `upload-videos.mjs` to check `cloudinary-videos.json` before uploading, skipping already-uploaded assets unless `--force` is provided.

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

### The Plot Twist: Cloudinary's Sneaky "HTTP 423 Locked"

Just when you think you're done, `edited1` decided to play hard to get in the browser. While thumbnails showed up fine, hovering or clicking wouldn't play the video!

We dug into the network headers and found Cloudinary returning:
`HTTP 423 Locked: Resource is too large to process synchronously, processing in background`

Turns out, asking Cloudinary to dynamically transcode an 87MB video on-the-fly with `f_auto,q_auto` causes it to lock the file for background processing instead of streaming it immediately. Since our file is already an ultra-compatible H.264 MP4 with web `+faststart`, switching to the direct stream URL bypassed the lock and returned instant `HTTP 200 OK` byte-range streaming. Pair that with coordinating the lazy `src` mounting via `onCanPlay` so `video.play()` doesn't fire before React finishes mounting the source, and `edited1` now starts playing the millisecond your cursor touches the card!

### The Polish: Play/Resume Filter & Buffering Spinner

To give viewers a high-end, tactile experience:
- We built a dark frosted overlay with an inviting circular Play button on top of every video thumbnail.
- While the video buffers, it switches to a sleek, animated gold spinner (`Buffering...`).
- When playback starts, the overlay effortlessly disappears.
- When the viewer leaves or moves to another video, the overlay gracefully returns with the Play icon now reading **"Resume"**!
- On Desktop: Hovering previews and leaves pause; clicking toggles.
- On Mobile: Tapping cleanly activates and pauses with zero accidental scroll triggers.

---

### What's Under the Hood

- **Package Manager:** `pnpm` exclusively.
- **Framework:** Next.js 15.5+ (App Router, Server & Client Components).
- **Styling:** Tailwind CSS + custom Warm Cinematic palette tokens (`#CAA290`, `#B5A091`, `#FDE4D0`, `#E4DCD1`).
- **Media Engine:** `cloudinary` (upload CLI) & `next-cloudinary` (frontend delivery).
- **Build Status:** 100% clean production build, static generation passing with zero errors!

Now all you have to do is run `pnpm upload:videos`, watch those chunked uploads fly, and enjoy that buttery 60fps smooth portfolio! 🎬✨
