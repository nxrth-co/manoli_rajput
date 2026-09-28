'use client';

import React, { useRef, useState } from 'react';
import { VIDEO_CATEGORIES, VIDEOS_BY_CATEGORY } from '@/data/portfolio-data';
import { VideoCard } from './VideoCard';
import { VideoPlaybackProvider } from '@/context/VideoPlaybackContext';
import { VideoCategory } from '@/types/portfolio';

const ROW_CAPTIONS: Record<VideoCategory, string[]> = {
  Moments: ['MAGICAL • DRAMATIC • CINEMATIC', 'CHERISHED • NOURISHED • FLOURISHED'],
  Mindful: ['CLICK • WATCH • ENGAGE', 'TREND • TALK • TRANSFORM'],
  Making: ['LIGHTS • CAMERA • ACTION', 'PREP • SET • ROLL']
};

export const VideoGallery: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory>('Moments');
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const selectCategory = (category: VideoCategory) => {
    setSelectedCategory(category);
  };

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | undefined;

    if (event.key === 'ArrowRight') nextIndex = (index + 1) % VIDEO_CATEGORIES.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + VIDEO_CATEGORIES.length) % VIDEO_CATEGORIES.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = VIDEO_CATEGORIES.length - 1;

    if (nextIndex !== undefined) {
      event.preventDefault();
      const category = VIDEO_CATEGORIES[nextIndex];
      tabRefs.current[nextIndex]?.focus();
      selectCategory(category);
    }
  };

  return (
    <VideoPlaybackProvider key={selectedCategory}>
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

          <div
            className="mb-10 flex gap-2 overflow-x-auto border-b border-[#3A332F]/15"
            role="tablist"
            aria-label="Video categories"
          >
            {VIDEO_CATEGORIES.map((category, index) => (
              <button
                key={category}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                id={`tab-${category.toLowerCase()}`}
                type="button"
                role="tab"
                aria-selected={selectedCategory === category}
                aria-controls="video-gallery-panel"
                tabIndex={selectedCategory === category ? 0 : -1}
                onClick={() => selectCategory(category)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                className={`shrink-0 border-b-2 px-5 py-3 text-sm uppercase tracking-[0.2em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#CAA290] md:px-8 ${
                  selectedCategory === category
                    ? 'border-[#CAA290] bg-[#CAA290]/15 font-semibold text-[#8F6653]'
                    : 'border-transparent text-[#6B5E56] hover:text-[#3A332F]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div
            id="video-gallery-panel"
            role="tabpanel"
            aria-labelledby={`tab-${selectedCategory.toLowerCase()}`}
            className="relative z-10 space-y-12"
          >
            {ROW_CAPTIONS[selectedCategory].map((caption, rowIndex) => {
              const rowItems = VIDEOS_BY_CATEGORY[selectedCategory].slice(rowIndex * 3, rowIndex * 3 + 3);

              return (
                <div key={`${selectedCategory}-row-${rowIndex}`}>
                  <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-14">
                    {rowItems.map((item) => (
                      <VideoCard key={item.id} item={item} />
                    ))}
                  </div>
                  <p className="mt-8 text-center font-sans text-base font-medium uppercase leading-relaxed tracking-[0.18em] text-[#B5A091] sm:text-lg md:text-xl md:tracking-[0.2em]">
                    {caption.split('•').map((part, index) => (
                      <React.Fragment key={`${selectedCategory}-caption-${rowIndex}-${index}`}>
                        {index > 0 && <span className="text-[#CAA290]">•</span>}
                        {part}
                      </React.Fragment>
                    ))}
                  </p>
                </div>
              );
            })}
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
