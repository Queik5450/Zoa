/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.{html,js}", "./!(build|dist|.*)/**/*.{html,js}"],
  theme: {
    screens: {
      mq366: {
        raw: "screen and (min-width: 367px) and (max-width: 366px)",
      },
      mq382: {
        raw: "screen and (min-width: 383px) and (max-width: 382px)",
      },
      md: {
        raw: "screen and (min-width: 383px) and (max-width: 960px)",
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
};
