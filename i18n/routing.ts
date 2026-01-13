import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["en", "pl", "ru"],

  // Used when no locale matches
  defaultLocale: "pl",

  pathnames: {
    // Исключаем ВСЕ API-роуты из локализации
    "/api": "/api",
    "/api/[...rest]": "/api/[...rest]",

    // Если у тебя есть другие публичные роуты без локали — тоже сюда
    // "/sitemap.xml": "/sitemap.xml",
    // "/robots.txt": "/robots.txt",
  },
});
