import { useTranslation } from "react-i18next";

import { Logo } from "../../components";
import { Box, Text, Stack, Container } from "@chakra-ui/react";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <Box as="footer" bg="gray.900" color="gray.200">
      <Container
        py={4}
        as={Stack}
        maxW="6xl"
        spacing={4}
        align={{ base: "center", md: "center" }}
        direction={{ base: "column", md: "row" }}
        justify={{ base: "center", md: "space-between" }}
      >
        <Logo />
        <Text
          sx={{
            fontSize: (theme) => (theme.direction === "rtl" ? 14 : 20),
            fontFamily: (theme) =>
              theme.direction === "rtl" ? "Cairo" : "Caveat",
          }}
        >
          {t("copyright_text")}
        </Text>
      </Container>
    </Box>
  );
};

export default Footer;
