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
          dark: '#1e2939',
          muted: '#6a7282',
          label: '#364153',
          placeholder: '#99a1af',
          secondary: '#4a5565',
        },
        border: '#f3f4f6',
        surface: '#f9fafb',
        input: '#e5e7eb',
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
