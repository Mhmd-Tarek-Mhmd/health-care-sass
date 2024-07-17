import dayjs from "dayjs";
import i18n from "./i18n";

// Locals
import "dayjs/locale/ar";
i18n.on("languageChanged", (lng) => {
  if (lng.includes("ar")) dayjs.locale("ar");
});

// Plugins
