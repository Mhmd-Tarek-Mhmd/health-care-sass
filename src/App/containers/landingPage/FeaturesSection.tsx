import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import {
  Box,
  Icon,
  Text,
  Flex,
  Stack,
  SimpleGrid,
  useColorModeValue,
} from "@chakra-ui/react";
import { MdWbTwilight } from "react-icons/md";
import { FaUserDoctor, FaCalendarDays } from "react-icons/fa6";

const FeaturesSection = () => (
  <Box role="region" p={4}>
    <SimpleGrid
      spacing={10}
      justifyContent="center"
      columns={{ base: 1, md: 3 }}
    >
      <Feature
        icon={<Icon as={MdWbTwilight} w={10} h={10} />}
        title="landingPage.features.title-1"
        text="landingPage.features.text-1"
      />
      <Feature
        icon={<Icon as={FaUserDoctor} w={10} h={10} />}
        title="landingPage.features.title-2"
        text="landingPage.features.text-1"
      />
      <Feature
        icon={<Icon as={FaCalendarDays} w={10} h={10} />}
        title="landingPage.features.title-3"
        text="landingPage.features.text-1"
      />
    </SimpleGrid>
  </Box>
);

export default FeaturesSection;

interface FeatureProps {
  title: string;
  text: string;
  icon: ReactElement;
}

const Feature = ({ title, text, icon }: FeatureProps) => {
  const { t } = useTranslation();

  return (
    <Stack role="article" textAlign="center">
      <Flex
        w={16}
        h={16}
        mb={1}
        mx="auto"
        color="white"
        align="center"
        rounded="full"
        justify="center"
        bg={useColorModeValue("purple.500", "transparent")}
      >
        {icon}
      </Flex>
      <Text
        as="strong"
        fontWeight={600}
        fontFamily="Inter"
        color={useColorModeValue("purple.500", "white")}
      >
        {t(title)}
      </Text>
      <Text opacity={0.9} maxW={500} mx="auto">
        {t(text)}
      </Text>
    </Stack>
  );
};
