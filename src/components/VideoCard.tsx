'use client';

import React, { useRef, useState, useEffect } from 'react';
import { VideoItem } from '@/types/portfolio';
import { useVideoPlayback } from '@/context/VideoPlaybackContext';
import { Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react';

interface VideoCardProps {
  item: VideoItem;
  cloudName?: string;
  isCompact?: boolean;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  item,
  cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'xo4kifry',
  isCompact = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const shouldPlayRef = useRef<boolean>(false);

  // Global video concurrency context
  const { activeVideoId, requestPlay, pauseActive } = useVideoPlayback();
  const isFocused = activeVideoId === item.id;

  // Local card state
  const [isActivated, setIsActivated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayedBefore, setHasPlayedBefore] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Detect touch device for mobile vs desktop interaction
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Concurrency monitor: If another video is played, immediately stop this video
  useEffect(() => {
    if (!isFocused) {
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
      }
      setIsPlaying(false);
      setIsLoading(false);
      shouldPlayRef.current = false;
    }
  }, [isFocused]);

  // 1. Auto-Generated Lightweight Thumbnail
  const posterUrl = `https://res.cloudinary.com/${cloudName}/video/upload/so_1.0,w_${
    isCompact ? 480 : 560
  },c_fill/${item.publicId}.jpg`;

  // 2. Direct Cloudinary Video Stream URL
  const videoUrl = `https://res.cloudinary.com/${cloudName}/video/upload/${item.publicId}.mp4`;

  // Activate and play: claims sole active focus across the page
  const activateAndPlay = () => {
    shouldPlayRef.current = true;
    requestPlay(item.id); // Claims focus; automatically stops any other currently playing video

    if (!isActivated) {
      setIsLoading(true);
      setIsActivated(true);
    } else {
      const video = videoRef.current;
      if (video) {
        if (video.readyState < 3) {
          setIsLoading(true);
        }
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
          });
      }
    }
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
    setIsVideoLoaded(true);
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
        className={`relative w-full ${
          isCompact
            ? 'max-w-[240px] border-[5px] rounded-[2.2rem]'
            : 'max-w-[280px] border-[6px] rounded-[2.5rem]'
        } aspect-[9/19] border-[#3A332F]/90 overflow-hidden shadow-lg bg-black group cursor-pointer select-none`}
        onMouseEnter={!isTouchDevice ? activateAndPlay : undefined}
        onMouseLeave={!isTouchDevice ? pauseVideo : undefined}
        onClick={() => togglePlayPause()}
      >
        {/* Dynamic Speaker Notch */}
        <div
          className={`absolute top-2 left-1/2 -translate-x-1/2 ${
            isCompact ? 'w-14 h-3' : 'w-16 h-3.5'
          } bg-[#3A332F]/80 rounded-full z-40 pointer-events-none`}
        />

        {/* Dynamic Watermark Letter Placeholder */}
        <div className="absolute inset-0 flex flex-col p-6 justify-center items-center z-0 pointer-events-none bg-gradient-to-b from-[#E4DCD1]/10 to-black">
          <span className="font-serif text-5xl italic opacity-35 text-[#E4DCD1]">
            {item.letter}
          </span>
          <span className="text-[9px] tracking-[0.25em] uppercase opacity-60 mt-3 font-semibold text-[#E4DCD1]">
            {item.category === 'raw' ? 'play raw' : 'play preview'}
          </span>
        </div>

        {/* 1. Lightweight Auto-Generated Poster Thumbnail */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={posterUrl}
          alt={item.title}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 z-10 ${
            isVideoLoaded && isPlaying && isFocused
              ? 'opacity-0 pointer-events-none'
              : 'opacity-100'
          }`}
          loading="lazy"
        />

        {/* 2. Deferred Lazy-Loaded Video Element */}
        <video
          ref={videoRef}
          src={isActivated ? videoUrl : undefined}
          preload={isActivated ? 'auto' : 'none'}
          loop
          muted={isMuted}
          playsInline
          onCanPlay={handleReadyToPlay}
          onLoadedData={handleReadyToPlay}
          onWaiting={() => {
            if (isFocused && shouldPlayRef.current) setIsLoading(true);
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
          className={`w-full h-full object-cover relative z-10 transition-opacity duration-700 ${
            isVideoLoaded && isPlaying && isFocused ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* 3. Center Filter Overlay (Guaranteed top of thumbnail via z-30) */}
        <div
          className={`absolute inset-0 z-30 flex flex-col items-center justify-center p-4 transition-all duration-300 ${
            isFocused && isPlaying && !isLoading
              ? 'opacity-0 pointer-events-none'
              : 'opacity-100 bg-black/45 backdrop-blur-[2px] pointer-events-auto'
          }`}
          onClick={togglePlayPause}
        >
          {isLoading && isFocused ? (
            /* Loading Spinner State */
            <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-black/75 backdrop-blur-md border border-[#CAA290] flex items-center justify-center shadow-2xl">
                <Loader2 className="w-8 h-8 text-[#CAA290] animate-spin" />
              </div>
              <span className="text-[11px] uppercase tracking-[0.25em] text-white font-medium font-sans animate-pulse">
                Buffering...
              </span>
            </div>
          ) : (
            /* Play / Resume CTA Button */
            <div className="flex flex-col items-center justify-center space-y-3 transform transition-transform duration-300 hover:scale-105 cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-[#CAA290] hover:bg-[#b88f7d] text-white flex items-center justify-center shadow-[0_0_30px_rgba(202,162,144,0.6)] border-2 border-white/50 transition-all duration-300">
                <Play className="w-7 h-7 fill-white ml-1" />
              </div>
              <div className="bg-black/75 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 shadow-lg">
                <span className="text-xs font-sans tracking-widest uppercase font-semibold text-white">
                  {hasPlayedBefore ? 'Resume' : isTouchDevice ? 'Tap to Play' : 'Click to Play'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 4. Custom Glassmorphic Bottom Controls Overlay (z-40) */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto bg-black/60 backdrop-blur-md py-1.5 px-3 rounded-full text-white text-xs">
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

      {/* Caption & Metadata */}
      <div className="text-center max-w-[260px]">
        <p className="text-sm font-semibold uppercase tracking-wider text-[#3A332F]">
          <span className="text-[#CAA290] font-bold">{item.title.charAt(0)}</span> &mdash;{' '}
          {item.title}
        </p>
        <p className="text-xs text-[#6B5E56] mt-1 font-light italic leading-normal">
          {item.description}
        </p>
      </div>
    </div>
  );
};
