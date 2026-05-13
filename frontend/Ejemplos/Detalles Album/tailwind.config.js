/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.{html,js}", "./!(build|dist|.*)/**/*.{html,js}"],
  theme: {
    screens: {
      mq290: {
        raw: "screen and (min-width: 332px) and (max-width: 363px)",
      },
      mq331: {
        raw: "screen and (min-width: 383px) and (max-width: 382px)",
      },
      mq366: {
        raw: "screen and (min-width: 364px) and (max-width: 366px)",
      },
      mq382: {
        raw: "screen and (min-width: 367px) and (max-width: 382px)",
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
