/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './.storybook/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2b7fff',
          light: '#eff6ff',
        },
        text: {
          primary: '#101828',
          muted: '#6a7282',
        },
        border: '#f3f4f6',
        surface: '#f9fafb',
      },
      borderRadius: {
        nav: '10px',
        card: '14px',
        logo: '10px',
      },
      boxShadow: {
        logo: '0px 7.273px 5.455px rgba(43,127,255,0.3), 0px 2.909px 2.182px rgba(43,127,255,0.3)',
        'nav-active': '0px 1px 1.5px rgba(0,0,0,0.1), 0px 1px 1px rgba(0,0,0,0.1)',
      },
      letterSpacing: {
        tight: '-0.025em',
      },
    },
  },
  plugins: [],
};
