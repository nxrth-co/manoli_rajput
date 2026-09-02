'use client';

import React, { useState, useEffect } from 'react';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav
        id="navbar"
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 px-6 md:px-12 flex justify-between items-center ${
          isScrolled
            ? 'bg-[#E4DCD1]/85 backdrop-blur-xl py-4 border-b border-[#3A332F]/5'
            : 'bg-transparent py-6'
        }`}
      >
        <a
          href="#home"
          className="font-serif text-2xl md:text-3xl tracking-widest hover:opacity-85 transition-opacity"
        >
          MANOLI
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8">
          <a href="#home" className="nav-link">
            home
          </a>
          <a href="#content" className="nav-link">
            <span className="text-[#CAA290] font-bold tracking-normal font-sans">CONTENT</span>
          </a>
          <a href="#concept" className="nav-link">
            concept
          </a>
          <a href="#story" className="nav-link">
            story
          </a>
          <a href="#contact" className="nav-link">
            contact
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex flex-col justify-between w-6 h-4 z-50 relative focus:outline-none"
          aria-label="Toggle Menu"
        >
          <span
            className={`w-full h-[1.5px] bg-[#3A332F] transition-all duration-300 origin-top-left ${
              mobileMenuOpen ? 'rotate-45 translate-y-1' : ''
            }`}
          />
          <span
            className={`w-full h-[1.5px] bg-[#3A332F] transition-all duration-300 ${
              mobileMenuOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`w-full h-[1.5px] bg-[#3A332F] transition-all duration-300 origin-bottom-left ${
              mobileMenuOpen ? '-rotate-45 -translate-y-1' : ''
            }`}
          />
        </button>
      </nav>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 bg-[#FDE4D0]/95 backdrop-blur-xl z-40 flex flex-col items-center justify-center space-y-8 transition-all duration-500 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <a
          href="#home"
          onClick={() => setMobileMenuOpen(false)}
          className="font-serif text-3xl hover:text-[#CAA290] transition-colors"
        >
          home
        </a>
        <a
          href="#content"
          onClick={() => setMobileMenuOpen(false)}
          className="font-serif text-3xl hover:text-[#CAA290] transition-colors"
        >
          <span className="text-[#CAA290] font-bold font-sans">CONTENT</span>
        </a>
        <a
          href="#concept"
          onClick={() => setMobileMenuOpen(false)}
          className="font-serif text-3xl hover:text-[#CAA290] transition-colors"
        >
          concept
        </a>
        <a
          href="#story"
          onClick={() => setMobileMenuOpen(false)}
          className="font-serif text-3xl hover:text-[#CAA290] transition-colors"
        >
          story
        </a>
        <a
          href="#contact"
          onClick={() => setMobileMenuOpen(false)}
          className="font-serif text-3xl hover:text-[#CAA290] transition-colors"
        >
          contact
        </a>
      </div>
    </>
  );
};
