import { useTranslation } from "react-i18next";

import { FcGoogle } from "react-icons/fc";
import { Button, Text } from "@chakra-ui/react";

const GoogleButton = () => {
  const { t } = useTranslation();

  return (
    <Button w="full" variant="outline" leftIcon={<FcGoogle />}>
      <Text>{t("google-btn-label")}</Text>
    </Button>
  );
};

export default GoogleButton;
