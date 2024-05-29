import {
  Box,
  Flex,
  Text,
  Image,
  Stack,
  Button,
  Heading,
  LightMode,
  useBreakpointValue,
} from "@chakra-ui/react";
import { MdCall } from "react-icons/md";
import { useTranslation } from "react-i18next";

const HeroSection = () => {
  const { t } = useTranslation()

  return (
    <Stack as="header" minH="100vh" direction={{ base: "column", md: "row" }}>
      <Flex p={8} flex={1} align="center" justify="center">
        <Stack spacing={6} w={"full"} maxW={"lg"}>
          <Heading
            fontFamily="Work Sans"
            textTransform="capitalize"
            fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
          >
            {t("landingPage.hero.title")}{" "}
            <Text
              as="span"
              position="relative"
              _after={{
                left: 0,
                bottom: 1,
                zIndex: -1,
                opacity: 0.8,
                content: "''",
                width: "full",
                bg: "teal.500",
                position: "absolute",
                height: useBreakpointValue({ base: "20%", md: "30%" }),
              }}
            >
              HealthCare
            </Text>
          </Heading>
          <Text opacity={0.9} fontSize={{ base: "md", lg: "lg" }}>
            {t("landingPage.hero.text")}
          </Text>
          <Stack direction={{ base: "column", md: "row" }} spacing={4}>
            <LightMode>
              <Button rounded="full" colorScheme="teal">
                {t("landingPage.cta.primary-label")}
              </Button>
              <Button rounded="full" colorScheme="purple" leftIcon={<MdCall />}>
                {t("landingPage.cta.secondary-label")}
              </Button>
            </LightMode>
          </Stack>
        </Stack>
      </Flex>
      <Flex flex={1} position="relative">
        <Box
          aria-hidden="true"
          width="100%"
          height="100%"
          position="absolute"
          bgColor="rgba(0, 0, 0, 0.2)"
        />
        <Image
          alt="Standing Doctor"
          objectFit="cover"
          src="images/hero.jpg"
          borderTopLeftRadius={8}
          borderBottomLeftRadius={8}
        />
      </Flex>
    </Stack>
  );
};

export default HeroSection;
