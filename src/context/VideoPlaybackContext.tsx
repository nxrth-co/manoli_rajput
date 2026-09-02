'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface VideoPlaybackContextType {
  activeVideoId: string | null;
  requestPlay: (id: string) => void;
  pauseActive: (id?: string) => void;
  stopAll: () => void;
}

const VideoPlaybackContext = createContext<VideoPlaybackContextType>({
  activeVideoId: null,
  requestPlay: () => {},
  pauseActive: () => {},
  stopAll: () => {}
});

export const VideoPlaybackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  // Request to activate and play a specific video; automatically defocuses any other playing video
  const requestPlay = useCallback((id: string) => {
    setActiveVideoId(id);
  }, []);

  // Pause the current active video if it matches the id
  const pauseActive = useCallback((id?: string) => {
    setActiveVideoId((prev) => (id === undefined || prev === id ? null : prev));
  }, []);

  // Defocus all videos
  const stopAll = useCallback(() => {
    setActiveVideoId(null);
  }, []);

  return (
    <VideoPlaybackContext.Provider value={{ activeVideoId, requestPlay, pauseActive, stopAll }}>
      {children}
    </VideoPlaybackContext.Provider>
  );
};

export const useVideoPlayback = () => useContext(VideoPlaybackContext);
