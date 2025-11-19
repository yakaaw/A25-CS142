module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx,html}',
    './public/index.html'
  ],
  theme: {
    extend: {
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: true,
  },
};
