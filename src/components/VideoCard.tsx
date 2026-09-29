'use client';

import React, { useRef, useState, useEffect } from 'react';
import { VideoItem } from '@/types/portfolio';
import { useVideoPlayback } from '@/context/VideoPlaybackContext';
import { Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react';

interface VideoCardProps {
  item: VideoItem;
}

export const VideoCard: React.FC<VideoCardProps> = ({ item }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const shouldPlayRef = useRef<boolean>(false);

  // Global video concurrency context
  const { activeVideoId, requestPlay, pauseActive } = useVideoPlayback();
  const isFocused = activeVideoId === item.id;

  // Local card state
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayedBefore, setHasPlayedBefore] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [hasVideoFrame, setHasVideoFrame] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Detect touch device for mobile vs desktop interaction
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Concurrency monitor: if this card is no longer the active video, stop it immediately
  useEffect(() => {
    if (!isFocused) {
      const video = videoRef.current;
      if (video && !video.paused) {
        video.pause();
      }
      setIsPlaying(false);
      setIsLoading(false);
      shouldPlayRef.current = false;
    }
  }, [isFocused]);

  useEffect(() => () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  }, []);

  // Activate and play: claims sole active focus across the page
  const activateAndPlay = () => {
    const video = videoRef.current;
    if (!video) return;

    shouldPlayRef.current = true;
    requestPlay(item.id);

    const startPlayback = () => {
      video
        .play()
        .then(() => {
          setIsLoading(false);
          setIsPlaying(true);
          setHasPlayedBefore(true);
        })
        .catch((err) => {
          console.warn('Playback attempt prevented:', err);
          setIsLoading(false);
          shouldPlayRef.current = false;
        });
    };

    if (video.readyState >= 2) {
      startPlayback();
      return;
    }

    setIsLoading(true);
    startPlayback();
  };

  const pauseVideo = () => {
    shouldPlayRef.current = false;
    setIsLoading(false);
    const video = videoRef.current;
    if (video) {
      video.pause();
      setIsPlaying(false);
    }
    pauseActive(item.id);
  };

  const togglePlayPause = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isFocused || !isPlaying) {
      activateAndPlay();
    } else {
      pauseVideo();
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
    }
  };

  // Called when video element receives source and is ready to buffer/play
  const handleReadyToPlay = () => {
    setHasVideoFrame(true);
    setIsLoading(false);

    if (shouldPlayRef.current && isFocused && videoRef.current) {
      videoRef.current
        .play()
        .then(() => {
          setIsLoading(false);
          setIsPlaying(true);
          setHasPlayedBefore(true);
        })
        .catch((err) => {
          console.warn('Autoplay prevented:', err);
          setIsLoading(false);
        });
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video && video.duration) {
      setProgress((video.currentTime / video.duration) * 100);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const video = videoRef.current;
    const progressContainer = progressRef.current;
    if (video && progressContainer && video.duration) {
      const rect = progressContainer.getBoundingClientRect();
      const clickPosition = (e.clientX - rect.left) / rect.width;
      video.currentTime = Math.max(0, Math.min(1, clickPosition)) * video.duration;
    }
  };

  return (
    <div className="video-card-container flex flex-col items-center space-y-4 w-full">
      {/* Phone Frame Mockup */}
      <div
        className="relative w-full max-w-[280px] aspect-[9/19] border-[6px] rounded-[2.5rem] border-[#3A332F]/90 overflow-hidden shadow-lg bg-black group select-none"
      >
        {/* Dynamic Speaker Notch */}
        <div
          className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-[#3A332F]/80 rounded-full z-40 pointer-events-none"
        />

        {/* Dynamic Watermark Letter Placeholder */}
        <div className="absolute inset-0 flex flex-col p-6 justify-center items-center z-0 pointer-events-none bg-gradient-to-b from-[#E4DCD1]/10 to-black">
          <span className="font-serif text-5xl italic opacity-35 text-[#E4DCD1]">
            {item.letter}
          </span>
          <span className="text-[9px] tracking-[0.25em] uppercase opacity-60 mt-3 font-semibold text-[#E4DCD1]">
            {item.category}
          </span>
        </div>

        {/* Local video source, with metadata-only preload for the active category. */}
        <video
          ref={videoRef}
          src={item.videoUrl}
          preload="auto"
          loop
          muted={isMuted}
          playsInline
          aria-label={`${item.title} video`}
          onCanPlay={handleReadyToPlay}
          onLoadedData={handleReadyToPlay}
          onWaiting={() => {
            if (isFocused && shouldPlayRef.current) {
              setIsLoading(true);
            }
          }}
          onStalled={() => {
            if (isFocused && shouldPlayRef.current) {
              setIsLoading(true);
            }
          }}
          onPlaying={() => {
            setIsLoading(false);
            setIsPlaying(true);
            setHasPlayedBefore(true);
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onError={(e) => {
            console.warn(`Video playback error on ${item.id}:`, e);
            setIsLoading(false);
          }}
          className={`w-full h-full object-cover relative z-10 transition-opacity duration-700 ${hasVideoFrame ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* 3. Center Filter Overlay (Guaranteed top of thumbnail via z-30) */}
        <div
          className={`absolute inset-0 z-30 flex flex-col items-center justify-center p-4 transition-all duration-300 ${
            isFocused && isPlaying && !isLoading
              ? 'opacity-0 pointer-events-none'
              : 'opacity-100 bg-black/45 backdrop-blur-[2px] pointer-events-auto'
          }`}
        >
          {isLoading && isFocused ? (
            /* Loading Spinner State */
            <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-black/75 backdrop-blur-md border border-[#CAA290] flex items-center justify-center shadow-2xl">
                <Loader2 className="w-8 h-8 text-[#CAA290] animate-spin" />
              </div>
              <span className="text-[11px] uppercase tracking-[0.25em] text-white font-medium font-sans animate-pulse">
                Just a moment...
              </span>
            </div>
          ) : (
            /* Play / Resume CTA Button */
            <button
              type="button"
              onClick={togglePlayPause}
              aria-label={hasPlayedBefore ? `Resume ${item.title}` : `Play ${item.title}`}
              className="flex flex-col items-center justify-center space-y-3 transform transition-transform duration-300 hover:scale-105"
            >
              <div className="w-16 h-16 rounded-full bg-[#CAA290] hover:bg-[#b88f7d] text-white flex items-center justify-center shadow-[0_0_30px_rgba(202,162,144,0.6)] border-2 border-white/50 transition-all duration-300">
                <Play className="w-7 h-7 fill-white ml-1" />
              </div>
              <div className="bg-black/75 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 shadow-lg">
                <span className="text-xs font-sans tracking-widest uppercase font-semibold text-white">
                  {hasPlayedBefore ? 'Resume' : isTouchDevice ? 'Tap to Play' : 'Click to Play'}
                </span>
              </div>
            </button>
          )}
        </div>

        {/* 4. Custom Glassmorphic Bottom Controls Overlay (z-40) */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-40 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto bg-black/60 backdrop-blur-md py-1.5 px-3 rounded-full text-white text-xs">
          {/* Play / Pause Toggle */}
          <button
            onClick={togglePlayPause}
            className="p-1 hover:text-[#CAA290] transition-colors focus:outline-none"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
          </button>

          {/* Scrubbable Progress Bar */}
          <div
            ref={progressRef}
            onClick={handleSeek}
            onKeyDown={(event) => {
              if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                event.preventDefault();
                const video = videoRef.current;
                if (video) video.currentTime += event.key === 'ArrowRight' ? 5 : -5;
              }
            }}
            role="slider"
            aria-label={`Seek ${item.title}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            tabIndex={0}
            className="flex-grow mx-2 h-1 bg-white/30 rounded-full overflow-hidden relative cursor-pointer"
          >
            <div
              className="h-full bg-[#CAA290] transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Mute / Unmute Toggle */}
          <button
            onClick={toggleMute}
            className="p-1 hover:text-[#CAA290] transition-colors focus:outline-none"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

    </div>
  );
};
