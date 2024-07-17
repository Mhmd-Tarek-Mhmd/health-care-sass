import { mode } from "@chakra-ui/theme-tools";
import { extendTheme } from "@chakra-ui/react";

const styles = {
  global: (props: Record<string, any>) => ({
    // Scrollbar
    "*, *::before, *::after": {
      scrollbarWidth: "thin",
      scrollbarColor: `${mode("#888", "#555")(props)} ${mode(
        "#f1f1f1",
        "#2D3748"
      )(props)}`,
    },
    "::-webkit-scrollbar": {
      width: "12px",
      height: "12px",
    },
    "::-webkit-scrollbar-thumb": {
      backgroundColor: mode("#888", "#555")(props),
      borderRadius: "10px",
      border: "3px solid transparent",
      backgroundClip: "padding-box",
    },
    "::-webkit-scrollbar-thumb:hover": {
      backgroundColor: mode("#555", "#888")(props),
    },
    "::-webkit-scrollbar-track": {
      backgroundColor: mode("#f1f1f1", "#2D3748")(props),
    },
  }),
};

const theme = extendTheme({
  styles,
  direction: localStorage?.i18nextLng?.includes("ar") ? "rtl" : "ltr",
});

export default theme;
