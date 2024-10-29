import { useTranslation } from "react-i18next";
import { useColorModeValue } from "@chakra-ui/react";

import { Link } from "react-router-dom";
import { Logo, ThemeToggler, LanguageSelect } from "@components";
import { Box, Flex, Stack, Button, DarkMode } from "@chakra-ui/react";

const Nav = () => {
  const { t } = useTranslation();

  return (
    <Box bg={useColorModeValue("teal.500", "teal.500")} px={4} as="nav">
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <Logo />

        <Flex alignItems="center">
          <Stack direction="row" spacing={3}>
            <ThemeToggler />
            <LanguageSelect />
            <DarkMode>
              <Button
                as={Link}
                to="/login"
                variant="link"
                textTransform="uppercase"
              >
                {t("actions.login-btn-label")}
              </Button>
            </DarkMode>
          </Stack>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Nav;
