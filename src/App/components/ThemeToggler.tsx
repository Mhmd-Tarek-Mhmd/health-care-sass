import React from "react";
import { useTranslation } from "react-i18next";
import { useColorMode } from "@chakra-ui/react";

import { IoIosSunny, IoIosMoon } from "react-icons/io";
import { DarkMode, IconButton } from "@chakra-ui/react";

const ThemeToggler = () => {
  const { t } = useTranslation();
  const { colorMode, toggleColorMode } = useColorMode();

  React.useEffect(() => {
    if (
      !localStorage?.["chakra-ui-color-mode"] &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      toggleColorMode();
    }
  }, []);

  return (
    <DarkMode>
      <IconButton
        onClick={toggleColorMode}
        aria-label={t("theme_toggler_label")}
      >
        {colorMode === "light" ? <IoIosMoon /> : <IoIosSunny />}
      </IconButton>
    </DarkMode>
  );
};

export default ThemeToggler;
