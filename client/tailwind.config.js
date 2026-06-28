/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './.storybook/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2b7fff',
          light: 'rgb(var(--color-primary-light) / <alpha-value>)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          dark: 'var(--color-text-dark)',
          muted: 'var(--color-text-muted)',
          label: 'var(--color-text-label)',
          placeholder: 'var(--color-text-placeholder)',
          secondary: 'var(--color-text-secondary)',
        },
        border: 'var(--color-border)',
        surface: 'var(--color-surface)',
        card: 'var(--color-card)',
        input: 'var(--color-input)',
        success: '#00bc7d',
      },
      borderRadius: {
        nav: '10px',
        card: '14px',
        logo: '10px',
        'logo-lg': '14px',
        input: '10px',
        'auth-card': '16px',
      },
      boxShadow: {
        logo: '0px 7.273px 5.455px rgba(43,127,255,0.3), 0px 2.909px 2.182px rgba(43,127,255,0.3)',
        'logo-lg': '0px 10px 7.5px rgba(43,127,255,0.3), 0px 4px 3px rgba(43,127,255,0.3)',
        'nav-active': '0px 1px 1.5px rgba(0,0,0,0.1), 0px 1px 1px rgba(0,0,0,0.1)',
        'auth-card': '0px 8px 20px rgba(0,0,0,0.1)',
      },
      letterSpacing: {
        tight: '-0.025em',
      },
    },
  },
  plugins: [],
};
