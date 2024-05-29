import {
  Flex,
  Stack,
  Button,
  Heading,
  LightMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { MdCall } from "react-icons/md";
import { useTranslation } from "react-i18next";

const CTASection = () => {
  const { t } = useTranslation();

  return (
    <Flex
      h={300}
      mb={-100}
      as="section"
      align="center"
      justify="center"
      bg={useColorModeValue("purple.500", "purple.500")}
    >
      <Stack>
        <Heading
          as="h2"
          color="white"
          textAlign="center"
          fontFamily="Work Sans"
          textTransform="capitalize"
        >
          {t("landingPage.cta-section-title")}
        </Heading>
        <Stack direction="row" justify="center" spacing={4} mt={10}>
          <LightMode>
            <Button colorScheme="teal" _hover={{ bg: "teal.500" }}>
              {t("landingPage.cta.primary-label")}
            </Button>
            <Button
              bg="purple.50"
              color="purple.500"
              variant="outline"
              colorScheme="purple"
              leftIcon={<MdCall />}
            >
              {t("landingPage.cta.secondary-label")}
            </Button>
          </LightMode>
        </Stack>
      </Stack>
    </Flex>
  );
};

export default CTASection;
