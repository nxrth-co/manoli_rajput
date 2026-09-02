import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        beige: '#CAA290',
        taupe: '#B5A091',
        cream: '#FDE4D0',
        ivory: '#E4DCD1',
        sage: '#959E96',
        text: '#3A332F',
        'text-muted': '#6B5E56'
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'serif'],
        sans: ['var(--font-sans)', 'sans-serif']
      }
    }
  },
  plugins: []
};

export default config;
