import "i18next";
import ns from "public/locales/en-US/translation.json";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "ns";
    resources: {
      ns: typeof ns;
    };
  }
}
