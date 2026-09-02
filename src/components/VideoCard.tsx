'use client';

import React, { useRef, useState, useEffect } from 'react';
import { VideoItem } from '@/types/portfolio';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

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

  // Lazy loading state: video src is unmounted/unbuffered until interaction
  const [isActivated, setIsActivated] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // 1. Auto-Generated Lightweight Thumbnail (capture still frame at 1s)
  const posterUrl = `https://res.cloudinary.com/${cloudName}/video/upload/so_1.0,w_${
    isCompact ? 480 : 560
  },c_fill/${item.publicId}.jpg`;

  // 2. Direct Cloudinary Video Stream URL
  // Note: We deliberately use the direct clean stream URL without on-the-fly transformations (f_auto,q_auto)
  // because Cloudinary returns "HTTP 423 Locked" for on-demand transcoding of large video assets.
  const videoUrl = `https://res.cloudinary.com/${cloudName}/video/upload/${item.publicId}.mp4`;

  // Trigger buffering and playback upon user interaction
  const activateAndPlay = () => {
    shouldPlayRef.current = true;
    if (!isActivated) {
      setIsActivated(true);
    } else {
      const video = videoRef.current;
      if (video) {
        video
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn('Playback attempt prevented:', err);
          });
      }
    }
  };

  const pauseVideo = () => {
    shouldPlayRef.current = false;
    const video = videoRef.current;
    if (video) {
      video.pause();
      setIsPlaying(false);
    }
  };

  const togglePlayPause = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isActivated) {
      activateAndPlay();
      return;
    }
    const video = videoRef.current;
    if (video) {
      if (video.paused) {
        shouldPlayRef.current = true;
        video
          .play()
          .then(() => setIsPlaying(true))
          .catch(console.warn);
      } else {
        shouldPlayRef.current = false;
        video.pause();
        setIsPlaying(false);
      }
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
    if (shouldPlayRef.current && videoRef.current) {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.warn('Autoplay prevented:', err));
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
        onMouseEnter={activateAndPlay}
        onMouseLeave={pauseVideo}
        onClick={() => togglePlayPause()}
      >
        {/* Dynamic Speaker Notch */}
        <div
          className={`absolute top-2 left-1/2 -translate-x-1/2 ${
            isCompact ? 'w-14 h-3' : 'w-16 h-3.5'
          } bg-[#3A332F]/80 rounded-full z-30 pointer-events-none`}
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
            isVideoLoaded && isPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          loading="lazy"
        />

        {/* 2. Deferred Lazy-Loaded Video Element (Only assigned src on hover/click) */}
        <video
          ref={videoRef}
          src={isActivated ? videoUrl : undefined}
          preload={isActivated ? 'auto' : 'none'}
          loop
          muted={isMuted}
          playsInline
          onCanPlay={handleReadyToPlay}
          onLoadedData={handleReadyToPlay}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onError={(e) => {
            console.warn(`Video playback error on ${item.id}:`, e);
          }}
          className={`w-full h-full object-cover relative z-10 transition-opacity duration-700 ${
            isVideoLoaded && isPlaying ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Custom Glassmorphic Controls Overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto bg-black/55 backdrop-blur-md py-1.5 px-3 rounded-full text-white text-xs">
          {/* Play / Pause */}
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

          {/* Progress Bar with Seek */}
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

          {/* Mute / Unmute */}
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
