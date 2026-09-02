import React from 'react';
import { Mail, Phone } from 'lucide-react';

export const Contact: React.FC = () => {
  return (
    <section
      id="contact"
      className="relative flex items-center py-24 px-6 md:px-12 lg:px-24 overflow-hidden bg-[#FDE4D0]"
    >
      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Headline */}
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs tracking-[0.25em] uppercase text-[#B5A091] font-semibold">
              get in touch
            </span>
            <h2 className="text-5xl md:text-7xl font-serif tracking-tight leading-none text-[#3A332F]">
              Let’s create something meaningful
            </h2>
            <p className="text-lg md:text-xl text-[#6B5E56] font-light leading-relaxed max-w-lg">
              whether it’s a campaign, collaboration, or visual story &mdash; let’s build something
              memorable.
            </p>
          </div>

          {/* Contact Box */}
          <div className="lg:col-span-5">
            <div className="bg-[#E4DCD1]/60 backdrop-blur-md rounded-2xl p-8 md:p-10 space-y-8 shadow-sm border border-[#3A332F]/5">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-[#FDE4D0] flex items-center justify-center text-[#CAA290] border border-[#CAA290]/20">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-widest text-[#B5A091] block">
                      Email
                    </span>
                    <a
                      href="mailto:rajputmanoli21@gmail.com"
                      className="text-lg hover:text-[#CAA290] transition-colors"
                    >
                      rajputmanoli21@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-[#FDE4D0] flex items-center justify-center text-[#CAA290] border border-[#CAA290]/20">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-widest text-[#B5A091] block">
                      Phone
                    </span>
                    <a
                      href="tel:+917778917399"
                      className="text-lg hover:text-[#CAA290] transition-colors"
                    >
                      +91 7778917399
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#3A332F]/10 mt-20 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-[#6B5E56] gap-4">
          <p>&copy; Manoli &mdash; All Rights Reserved</p>
          <div className="flex space-x-6">
            <a href="#home" className="hover:text-[#CAA290] transition-colors">
              Back to top &uarr;
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
