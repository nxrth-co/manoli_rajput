# Video Playback Frame State & Black Overlay Fix

## Problem
In `VideoCard.tsx`, when users initiated video playback on certain portfolio videos (specifically upon switching categories such as Mindful or Making, or when streaming preloaded/cached media), the video would begin playing in the background (progress bar advancing and audio/playback active), but the video element remained transparent (`opacity: 0`), leaving the dark watermark letter placeholder ("01 MOMENTS", "01 MINDFUL", etc.) visible like a stuck black overlay.

## Root Cause
1. **Unchecked ReadyState on Mount:** `hasVideoFrame` was initialized to `false` and only updated via `onCanPlay` and `onLoadedData`. When browsers preloaded or cached the media asset, these events would fire prior to event handler registration or component mounting, meaning `hasVideoFrame` never transitioned to `true`.
2. **Missing Frame State Updates on Playback:** Neither `activateAndPlay()`, `startPlayback()`, `onPlay()`, `onPlaying()`, nor `onTimeUpdate()` set `hasVideoFrame(true)`. Thus, if `onCanPlay` failed to trigger, the video played while trapped in `opacity-0`.
3. **Persistent Watermark Layer:** The underlying watermark placeholder div (`z-0`) lacked conditional opacity transitions and remained opaque at all times behind the transparent video frame.
4. **Buffering State Clearing:** If temporary network buffering triggered `onWaiting` during active playback, `isLoading` could linger without being cleared during continuous `timeupdate` playback.

## Solution
1. **ReadyState Lifecycle Check:** Added a `useEffect` on `[item.videoUrl]` that inspects `video.readyState >= 2` upon mounting and immediately sets `hasVideoFrame(true)`.
2. **Guaranteed Playback Visibility:**
   - In `startPlayback`, `onPlay`, and `onPlaying`, explicitly dispatch `setHasVideoFrame(true)`.
   - In `handleTimeUpdate`, if `video.currentTime > 0` or `video.readyState >= 2`, ensure `hasVideoFrame` is set to `true` and clear any lingering `isLoading` flags.
   - Updated the video class opacity condition to `hasVideoFrame || isPlaying || progress > 0 ? 'opacity-100' : 'opacity-0'`.
   - Reduced transition delay from `duration-700` to `duration-300` for responsive visual feedback.
3. **Watermark Layer Fadeout:** Updated the watermark layer to transition to `opacity-0` whenever `hasVideoFrame || isPlaying || progress > 0`.
