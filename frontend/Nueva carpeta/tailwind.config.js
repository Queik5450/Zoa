/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    screens: {
      mq260: {
        raw: "screen and (max-width: 260px)",
      },
      mq348: {
        raw: "screen and (min-width: 261px) and (max-width: 348px)",
      },
      mq385: {
        raw: "screen and (min-width: 349px) and (max-width: 385px)",
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
};
