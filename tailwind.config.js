/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1536px',
      },
    },
    extend: {
      screens: {
        desktop: '700px',
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          hover: 'hsl(var(--primary-hover))',
          dark: 'hsl(var(--primary-dark))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
          hover: 'hsl(var(--destructive-hover))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
          hover: 'hsl(var(--muted-hover))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        sgdf: {
          default: 'var(--sgdf-color-default)',
          'default-hover': 'var(--sgdf-color-default-hover)',
          'bg-primary': 'var(--sgdf-color-bg-primary)',
          'bg-primary-hovered': 'var(--sgdf-color-bg-primary-hovered)',
          'bg-neutral': 'var(--sgdf-color-bg-neutral)',
          'bg-neutral-alt': 'var(--sgdf-color-bg-neutral-alt)',
          'text-default': 'var(--sgdf-color-text-default)',
          'text-primary': 'var(--sgdf-color-text-primary)',
          'text-light': 'var(--sgdf-color-text-light)',
          'text-inverted': 'var(--sgdf-color-text-inverted)',
        },
      },
      fontFamily: {
        heading: ['var(--sgdf-font-heading)', 'sans-serif'],
        body: ['var(--sgdf-font-body)', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--sgdf-border-radius-large)',
        md: 'var(--sgdf-border-radius-medium)',
        sm: 'var(--sgdf-border-radius-small)',
        xl: 'var(--sgdf-border-radius-x-large)',
      },
      boxShadow: {
        'sgdf-sm': 'var(--sgdf-shadow-small)',
        'sgdf': 'var(--sgdf-shadow-medium)',
        'sgdf-lg': 'var(--sgdf-shadow-large)',
        'sgdf-xl': 'var(--sgdf-shadow-x-large)',
      },
      transitionDuration: {
        'sgdf-fast': 'var(--sgdf-transition-fast)',
        'sgdf-medium': 'var(--sgdf-transition-medium)',
        'sgdf-slow': 'var(--sgdf-transition-slow)',
      },
      transitionTimingFunction: {
        'sgdf': 'var(--sgdf-transition-easing)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
