/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#f7f9fb',
          dim: '#d8dadc',
          bright: '#f7f9fb',
          canvas: '#F8FAFC',
          card: '#FFFFFF',
          variant: '#e0e3e5',
          container: {
            lowest: '#ffffff',
            low: '#f2f4f6',
            DEFAULT: '#eceef0',
            high: '#e6e8ea',
            highest: '#e0e3e5',
          }
        },
        'on-surface': {
          DEFAULT: '#191c1e',
          variant: '#5c3f40',
        },
        'inverse-surface': '#2d3133',
        'inverse-on-surface': '#eff1f3',
        outline: {
          DEFAULT: '#906f70',
          variant: '#e5bdbe',
        },
        'border-subtle': '#E2E8F0',
        'text-primary': '#0F172A',
        'text-muted': '#64748B',
        primary: {
          DEFAULT: '#b80035',
          container: '#e11d48',
          'on-container': '#fffaf9',
          'fixed': '#ffdada',
          'fixed-dim': '#ffb3b6',
          'on-fixed': '#40000c',
          'on-fixed-variant': '#920028',
          inverse: '#ffb3b6',
        },
        'on-primary': '#ffffff',
        crimson: {
          active: '#BE123C',
          subtle: '#FFE4E6',
          brand: '#E11D48',
        },
        secondary: {
          DEFAULT: '#565e74',
          container: '#dae2fd',
          'on-container': '#5c647a',
          'fixed': '#dae2fd',
          'fixed-dim': '#bec6e0',
          'on-fixed': '#131b2e',
          'on-fixed-variant': '#3f465c',
        },
        'on-secondary': '#ffffff',
        tertiary: {
          DEFAULT: '#4d5c72',
          container: '#65758c',
          'on-container': '#fcfbff',
          'fixed': '#d3e4fe',
          'fixed-dim': '#b7c8e1',
          'on-fixed': '#0b1c30',
          'on-fixed-variant': '#38485d',
        },
        'on-tertiary': '#ffffff',
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
          'on-container': '#93000a',
        },
        'on-error': '#ffffff',
        background: '#f7f9fb',
        'on-background': '#191c1e',
      },
      fontFamily: {
        sans: ['Geist', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'dock': '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
        'modal': '0 10px 25px -5px rgba(15, 23, 42, 0.08)',
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.02), 0 1px 2px -1px rgba(0, 0, 0, 0.02)',
      },
      borderRadius: {
        'bubble': '0.75rem',
      }
    },
  },
  plugins: [],
}
