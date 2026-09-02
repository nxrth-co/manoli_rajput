import React from 'react';
import { EDITED_VIDEOS, RAW_VIDEOS } from '@/data/portfolio-data';
import { VideoCard } from './VideoCard';
import { VideoPlaybackProvider } from '@/context/VideoPlaybackContext';

export const VideoGallery: React.FC = () => {
  return (
    <VideoPlaybackProvider>
      {/* 1. EDITED VIDEOS SECTION (C.O.N.T.E.N.T) */}
      <section
        id="content"
        className="py-24 md:py-36 px-6 md:px-12 lg:px-24 bg-[#E4DCD1] relative overflow-hidden"
      >
        <div className="container mx-auto">
          {/* Section Header */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 md:mb-24 items-end">
            <div className="lg:col-span-4 border-r border-[#3A332F]/10 pr-6">
              <h2 className="text-6xl md:text-7xl font-serif tracking-tight leading-none text-[#3A332F] uppercase">
                c.o.n.t.e.n.t
              </h2>
            </div>
            <div className="lg:col-span-8">
              <h3 className="text-3xl md:text-4xl tracking-tight text-[#B5A091]">
                showcasing creative{' '}
                <span className="text-[#CAA290] font-bold font-sans">CONTENT</span> through the lens
              </h3>
            </div>
          </div>

          {/* 6-Video Phone Frame Grid (3x2 Desktop Layout) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14 relative z-10">
            {EDITED_VIDEOS.map((item) => (
              <VideoCard key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Wave Divider to Concept */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-10">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="relative block w-full h-[40px] md:h-[60px] fill-[#FDE4D0]/40"
          >
            <path d="M0,40 C350,110 850,30 1200,90 L1200,120 L0,120 Z" />
          </svg>
        </div>
      </section>

      {/* 2. CONCEPT & RAW TAKES SECTION */}
      <section
        id="concept"
        className="pt-24 pb-36 md:pt-36 md:pb-48 px-6 md:px-12 bg-[#FDE4D0]/40 relative overflow-hidden"
      >
        {/* Faded Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none z-0">
          <span className="text-[15vw] font-bold tracking-widest text-[#CAA290] opacity-[0.04]">
            CONTENT
          </span>
        </div>

        <div className="container mx-auto max-w-5xl relative z-10 space-y-16">
          {/* Statement */}
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-5xl tracking-tight font-medium leading-snug">
              the concept of <span className="text-[#CAA290] font-bold">CONTENT</span>
            </h2>
            <p className="text-lg md:text-2xl font-serif italic text-[#3A332F]/80 leading-relaxed">
              Every piece of <span className="text-[#CAA290] not-italic">CONTENT</span> begins with an
              idea and evolves into a story. It&apos;s not just about recording moments; it&apos;s
              about creating experiences that feel authentic, engaging, and memorable. From concepts
              to final cuts, every frame is designed to leave an impression.
            </p>
          </div>

          {/* 3 Raw Videos Row */}
          <div className="space-y-8 pt-8 border-t border-[#3A332F]/10">
            <div className="text-center max-w-md mx-auto">
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#B5A091] font-bold">
                behind the scenes
              </span>
              <h3 className="text-2xl md:text-3xl font-serif mt-1">raw takes</h3>
              <p className="text-xs text-[#6B5E56] mt-1">visual proof from camera source</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
              {RAW_VIDEOS.map((item) => (
                <VideoCard key={item.id} item={item} isCompact />
              ))}
            </div>
          </div>
        </div>

        {/* Wave Divider to Story */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-10">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="relative block w-full h-[40px] md:h-[60px] fill-[#FDE4D0]/35"
          >
            <path d="M0,50 C400,100 800,10 1200,70 L1200,120 L0,120 Z" />
          </svg>
        </div>
      </section>
    </VideoPlaybackProvider>
  );
};
