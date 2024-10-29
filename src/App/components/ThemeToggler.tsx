import React from "react";
import { useTranslation } from "react-i18next";
import { useColorMode } from "@chakra-ui/react";

import { IoIosSunny, IoIosMoon } from "react-icons/io";
import { DarkMode, IconButton } from "@chakra-ui/react";

const ThemeToggler = ({ isDarkOnly = true }) => {
  const { t } = useTranslation();
  const { colorMode, toggleColorMode } = useColorMode();
  const Wrapper = isDarkOnly ? DarkMode : React.Fragment;

  React.useEffect(() => {
    if (
      !localStorage?.["chakra-ui-color-mode"] &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      toggleColorMode();
    }
  }, []);

  return (
    <Wrapper>
      <IconButton
        onClick={toggleColorMode}
        aria-label={t("actions.theme-toggler-label")}
      >
        {colorMode === "light" ? <IoIosMoon /> : <IoIosSunny />}
      </IconButton>
    </Wrapper>
  );
};

export default ThemeToggler;
