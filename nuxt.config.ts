import { defineNuxtConfig } from "nuxt/config";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ["normalize.css", "~/assets/main.css"],
  modules: ["@nuxtjs/google-fonts"],
  googleFonts: {
    families: {
      Roboto: [500, 600],
    },
  },
});
