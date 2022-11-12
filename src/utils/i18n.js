import i18n from "i18next";
import languageDetector from "i18next-browser-languagedetector";
import backend from "i18next-http-backend";
import cache from "i18next-localstorage-cache";
import { languageCode } from "../constants/language.constants";
i18n
  .use(languageDetector)
  .use(cache)
  .use(backend)
  .init({
    lng: localStorage.getItem("i18nextLng") ?? `${languageCode.en}`,
    debug: false,
    fallbackLng: `${languageCode.vi}`,
    ns: ["translations"],
    defaultNS: "translations",
    preload: [`${languageCode.en}`, `${languageCode.vi}`],
    keySeparator: ".",
    backend: {
      crossDomain: true,
      loadPath: `${
        process.env.REACT_APP_ROOT_DOMAIN
      }language/web/{{lng}}.json?v=${new Date().getTime()}`,
      init: {
        mode: "cors",
        credentials: "include",
        cache: "default",
      },
    },
    cache: {
      enabled: true,
      prefix: "i18next_translations_",
      expirationTime: 24 * 60 * 60 * 1000, //one day
    },
    detection: {
      order: ["localStorage", "cookie"],
      lookupCookie: "i18nextLng",
      lookupLocalStorage: "i18nextLng",
      caches: ["localStorage"],
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
