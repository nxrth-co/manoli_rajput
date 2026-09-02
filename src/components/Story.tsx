import React from 'react';

export const Story: React.FC = () => {
  return (
    <section
      id="story"
      className="pt-24 pb-36 md:pt-32 md:pb-44 px-6 md:px-12 lg:px-24 bg-[#FDE4D0]/35 relative overflow-hidden"
    >
      <div className="container mx-auto max-w-4xl text-center md:text-left">
        <div className="space-y-8">
          <div className="space-y-2">
            <span className="text-xs tracking-[0.2em] uppercase text-[#B5A091] font-semibold">
              beyond the frame artist
            </span>
            <h2 className="text-4xl md:text-5xl font-serif tracking-tight leading-tight">
              what&apos;s the puzzling part?
            </h2>
          </div>

          <div className="space-y-6 text-base md:text-lg text-[#6B5E56] leading-relaxed font-light">
            <p>
              A portfolio often represents the work more than the person behind it. My creations may
              appear minimal rather than extravagant, but they reflect originality. Though I hold a
              Master&apos;s degree in Finance and Business Analytics, passion could never be placed on
              the sidelines. While learning and working professionally, I discovered what truly
              inspired me &mdash; transforming ideas into visuals that aren&apos;t merely AI-generated
              text or videos, but stories that stay in mind and come alive on screen.
            </p>
          </div>

          <div className="pt-6">
            <p className="font-serif italic text-3xl text-[#CAA290]">Thank You.</p>
          </div>
        </div>
      </div>

      {/* Wave Divider to Contact */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-10">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-full h-[40px] md:h-[60px] fill-[#FDE4D0]"
        >
          <path d="M0,90 C350,40 850,100 1200,60 L1200,120 L0,120 Z" />
        </svg>
      </div>
    </section>
  );
};
