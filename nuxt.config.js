export default {
  // Target: https://go.nuxtjs.dev/config-target
  target: "static",

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: "Realtime Playground | Appwrite",
    htmlAttrs: {
      lang: "en",
    },
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content:
          "Showcase of realtime cursor movement using Appwrite. Alone or with your friends, you can move the cursor on the website and lunch confetti by left-clicking.",
      },
      {
        name: "og:description",
        content:
          "Showcase of realtime cursor movement using Appwrite. Alone or with your friends, you can move the cursor on the website and lunch confetti by left-clicking.",
      },
      {
        name: "twitter:description",
        content:
          "Showcase of realtime cursor movement using Appwrite. Alone or with your friends, you can move the cursor on the website and lunch confetti by left-clicking.",
      },
      { name: "format-detection", content: "telephone=no" },
      {
        name: "twitter:image",
        content: "https://realtime-playground-appwrite.vercel.app/cover.png",
      },
      {
        name: "og:image",
        content: "https://realtime-playground-appwrite.vercel.app/cover.png",
      },
      { name: "og:title", content: "Realtime Playground | Appwrite" },
      { name: "twitter:title", content: "Realtime Playground | Appwrite" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:domain",
        content: "realtime-playground-appwrite.vercel.app",
      },
      {
        name: "twitter:url",
        content: "https://realtime-playground-appwrite.vercel.app/",
      },
      {
        name: "og:url",
        content: "https://realtime-playground-appwrite.vercel.app/",
      },
      { name: "og:type", content: "website" },
    ],
    link: [{ rel: "icon", type: "image/png", href: "/favicon.png" }],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: ["assets/main.css"],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    "@nuxt/typescript-build",
    // https://go.nuxtjs.dev/tailwindcss
    "@nuxtjs/tailwindcss",
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [],

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {},
};
