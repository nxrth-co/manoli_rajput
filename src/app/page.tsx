import React from 'react';
import { FilmGrain } from '@/components/FilmGrain';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { VideoGallery } from '@/components/VideoGallery';
import { Story } from '@/components/Story';
import { Contact } from '@/components/Contact';

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-[#E4DCD1] text-[#3A332F] selection:bg-[#CAA290] selection:text-white">
      <FilmGrain />
      <Navbar />
      <Hero />
      <VideoGallery />
      <Story />
      <Contact />
    </main>
  );
}
