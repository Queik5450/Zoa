/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    screens: {
      mq382: {
        raw: "screen and (max-width: 382px)",
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
};
