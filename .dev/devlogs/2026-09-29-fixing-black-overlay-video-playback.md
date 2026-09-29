# Devlog: Banishing the Phantom Black Video Overlay ☕🎬

**Date:** September 29, 2026  
**Author:** Pair Programming Agent & Frontend Media Specialist  
**Mood:** Fresh espresso, smooth 60fps streaming, zero stuck overlays  

---

### The Mystery of the Invisible Frame 🔍

Picture this: You click play on an editorial video in the gallery. The sleek peach progress bar begins advancing, the pause button pops up, the audio starts playing cleanly... but right in the center of the iPhone mockup, a dark placeholder with the number `01` and category name stays firmly plastered over the screen like an immovable black curtain!

The user caught it in action:
> *"The video starts playing but this black overlay doesn't go away sometimes. It happens in many videos other then the moments. Can you please fix this>"*

---

### Digging Under the Hood 🛠️

When we dissected `VideoCard.tsx`, the illusion fell apart immediately. The "black overlay" wasn't actually an overlay element trapped in an active state—it was the bottom-most layer (`z-0`) watermark placeholder!

Here's why it was showing through:
1. **The HTML5 ReadyState Trap:** The `<video>` component had `transition-opacity duration-700 ${hasVideoFrame ? 'opacity-100' : 'opacity-0'}`. `hasVideoFrame` was only ever set to `true` inside `onCanPlay` and `onLoadedData`. But when switching categories or when the browser preloaded/cached the Cloudinary MP4, `canplay` and `loadeddata` had *already* fired before the component mounted!
2. **Missing Playback State Link:** Even when `video.play()` succeeded and `timeupdate` began ticking, `hasVideoFrame` stayed `false`. The video decoded frames at `opacity: 0`, leaving the dark watermark behind it completely exposed.
3. **The 700ms Lag:** A 700ms transition delay caused an artificial latency before the video became visible even on successful transitions.

---

### The Cure 🚀

We locked down the entire video lifecycle in `VideoCard.tsx`:
- **Mount & Prop Check:** Added an effect that checks `if (video.readyState >= 2) setHasVideoFrame(true)`. If the browser already has the frame buffered, it reveals immediately without waiting for events that already passed.
- **Fail-Safe Visibility:** Updated video opacity to `hasVideoFrame || isPlaying || progress > 0 ? 'opacity-100' : 'opacity-0'`, with a snappy `duration-300` transition.
- **Playback & Timeupdate Sync:** `onPlay`, `onPlaying`, and `handleTimeUpdate` now all enforce `hasVideoFrame = true` and clear transient `isLoading` flags if `currentTime > 0`.
- **Watermark Layer Fade:** The underlying watermark letter placeholder now cleanly fades to `opacity-0` whenever playback or frames are active.

Recompiled with `tsc --noEmit`—zero errors, instant Fast Refresh, and every video across Moments, Mindful, and Making now bursts smoothly into full view the moment you hit play. 🥂
