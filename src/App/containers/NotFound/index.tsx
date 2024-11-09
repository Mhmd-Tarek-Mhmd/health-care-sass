import { useTranslation } from "react-i18next";
import { useAppStore } from "@store";
import { useColorModeValue } from "@chakra-ui/react";

import { Link } from "react-router-dom";
import { Box, Heading, Text, Button } from "@chakra-ui/react";

const NotFound = () => {
  const { t } = useTranslation();
  const token = useAppStore((state) => state.auth?.token);

  return (
    <Box
      px={6}
      py={10}
      as="main"
      minH="100vh"
      display="grid"
      textAlign="center"
      placeItems="center"
    >
      <div>
        <Heading
          as="h1"
          size="2xl"
          backgroundClip="text"
          display="inline-block"
          bgGradient="linear(to-r, teal.400, teal.600)"
        >
          404
        </Heading>
        <Text
          mt={3}
          mb={2}
          fontSize={18}
          sx={{
            fontFamily: (theme) =>
              theme.direction === "rtl" ? "Cairo" : "Work Sans",
          }}
        >
          {t("notFoundPage.title")}
        </Text>
        <Text
          mb={6}
          fontSize={14}
          color={useColorModeValue("gray.500", "gray.300")}
        >
          {t("notFoundPage.text")}
        </Text>

        <Button
          to={token ? "/dashboard" : "/login"}
          as={Link}
          color="white"
          variant="solid"
          colorScheme="teal"
          bgGradient="linear(to-r, teal.400, teal.500, teal.600)"
        >
          {t("notFoundPage.cta")}
        </Button>
      </div>
    </Box>
  );
};

export default NotFound;
