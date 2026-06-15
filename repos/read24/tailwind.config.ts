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
        sans: ["'IBM Plex Sans Thai'", 'system-ui', 'sans-serif'],
        serif: ["'Trirong'", 'serif'],
        'ibm-plex-sans-thai': ["'IBM Plex Sans Thai'", 'system-ui', 'sans-serif'],
        trirong: ["'Trirong'", 'serif'],
      },
      colors: {
        // Design token palette
        'r24-paper':        '#ECE3D2',
        'r24-paper-2':      '#EEECE4',
        'r24-surface':      '#FBF6EC',
        'r24-surface-3':    '#FBF9F2',
        'r24-card':         '#FFFFFF',

        'r24-ink':          '#2A241C',
        'r24-ink-soft':     '#4A4234',
        'r24-muted':        '#6B6253',
        'r24-muted-2':      '#8A7F68',
        'r24-hairline':     '#E0D5BE',
        'r24-hairline-2':   '#DDD1B8',
        'r24-hairline-3':   '#F0EBDE',

        'r24-terra':        '#BF5A2B',
        'r24-terra-tint':   '#F7E4D5',
        'r24-terra-tint-2': '#FBEFE3',
        'r24-terra-border': '#EAC9B3',

        'r24-forest':       '#2F5D50',
        'r24-forest-2':     '#264A40',
        'r24-admin':        '#1E3329',
        'r24-admin-accent': '#2F6E54',
        'r24-admin-soft':   '#93A99E',
        'r24-admin-text':   '#EDF4EF',

        'r24-coin':         '#C99A3F',
        'r24-coin-light':   '#F0CE73',
        'r24-coin-bg':      '#FBEFD6',
        'r24-coin-ink':     '#7A5A16',

        // Legacy aliases kept for backward compat
        'forest-dark':      '#2F5D50',
        'forest-deeper':    '#1E3329',
        'ink-dark':         '#25303A',
        'cream':            '#ECE3D2',
        'cream-light':      '#FBF6EC',
        'cream-warm':       '#FBF1E2',
        'text-dark':        '#2A241C',
        'text-mid':         '#4A4234',
        'text-muted':       '#6B6253',
        'text-forest-inactive': '#93A99E',
        'orange-red':       '#BF5A2B',
        'orange-light':     '#F0A878',
        'gold':             '#C99A3F',
        'gold-mid':         '#D9A441',
        'gold-light':       '#E0B45C',
        'green-mid':        '#2F6E54',
        'green-muted':      '#9FCBB3',
        'border-cream':     '#DDD1B8',
        'border-warm':      '#E0D5BE',
      },
      borderRadius: {
        'pill': '30px',
        '2xl': '22px',
      },
    },
  },
  plugins: [],
}
export default config
