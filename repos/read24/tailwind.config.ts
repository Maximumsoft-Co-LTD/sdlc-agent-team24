import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['IBM Plex Sans Thai', 'sans-serif'],
        serif: ['Trirong', 'serif'],
        'ibm-plex': ['IBM Plex Sans Thai', 'sans-serif'],
        trirong: ['Trirong', 'serif'],
      },
      colors: {
        // Backgrounds
        'forest-dark': '#2F5D50',
        'forest-deeper': '#1E3329',
        'ink-dark': '#25303A',
        'cream': '#EFE6D2',
        'cream-light': '#FBF6EC',
        'cream-warm': '#FBF1E2',
        // Text
        'text-dark': '#2A241C',
        'text-mid': '#5a5142',
        'text-muted': '#6B6253',
        'text-forest-inactive': '#b3a88f',
        // Accent
        'orange-red': '#BF5A2B',
        'orange-light': '#F0A878',
        // Gold
        'gold': '#C99A3F',
        'gold-mid': '#D9A441',
        'gold-light': '#E0B45C',
        // Green tones
        'green-mid': '#2F6E54',
        'green-muted': '#9FCBB3',
        // Borders
        'border-cream': '#DDD1B8',
        'border-warm': '#E0D5BE',
      },
    },
  },
  plugins: [],
}
export default config
