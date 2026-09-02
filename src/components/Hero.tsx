import React from 'react';
import Image from 'next/image';

export const Hero: React.FC = () => {
  return (
    <section
      id="home"
      className="min-h-screen relative flex items-center pt-32 pb-24 px-6 md:px-12 lg:px-24 overflow-hidden bg-[#E4DCD1]"
    >
      <div className="absolute inset-0 ambient-glow pointer-events-none" />

      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
        {/* Left: Headline & Bio */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-8 md:space-y-10">
          <div className="space-y-4">
            <h1 className="text-7xl md:text-9xl tracking-tight leading-none text-[#3A332F] font-serif">
              Frame Artist
            </h1>
            <p className="font-serif italic text-3xl md:text-4xl text-[#B5A091] leading-relaxed tracking-wide">
              Transforming ideas into visuals that stay in memory
            </p>
          </div>

          <div className="border-t border-[#3A332F]/10 pt-8 space-y-6">
            <p className="text-xl md:text-2xl font-light text-[#6B5E56] leading-loose max-w-2xl">
              The person behind the camera is rarely seen, yet constantly present &mdash; searching for the perfect angle to bring every frame to life. I&apos;m Manoli; perhaps not a common name, but certainly one you&apos;ll remember. Just like my name, my ideas are unique, transforming visions into visuals. From Instagram to Facebook, YouTube and beyond, I capture stories that connect. Here&apos;s a glimpse into the work that caught attention through the lens.
            </p>
            <p className="text-xs md:text-sm tracking-[0.2em] uppercase text-[#B5A091] font-semibold pt-4">
              creator &bull; storyteller &bull; visual strategist
            </p>
          </div>
        </div>

        {/* Right: Portrait */}
        <div className="lg:col-span-5 relative">
          <div className="relative w-full aspect-[3/4] max-w-md mx-auto rounded-2xl overflow-hidden shadow-sm border border-[#3A332F]/5 bg-[#B5A091]/10">
            <Image
              src="/assets/profile_pic.jpeg"
              alt="Manoli Portrait"
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover object-top hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
