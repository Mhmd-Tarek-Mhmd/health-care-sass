import { useTranslation } from "react-i18next";
import { useForm, SubmitHandler } from "react-hook-form";

import {
  Box,
  Flex,
  Link,
  Text,
  Stack,
  Button,
  Heading,
  Checkbox,
  useColorModeValue,
} from "@chakra-ui/react";
import { GoogleButton, FormInput } from "@components";
import { Link as LinkRouter } from "react-router-dom";

type Inputs = {
  email: string;
  password: string;
};

const LogIn = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();
  const { t } = useTranslation();

  const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data);

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg={useColorModeValue("gray.50", "gray.800")}
    >
      <Stack spacing={8} mx="auto" maxW="lg" py={12} px={6}>
        <Stack align="center">
          <Heading fontSize="4xl">{t("logInPage.mainTitle")}</Heading>
          <Text fontSize="lg">{t("logInPage.secTitle")}</Text>
        </Stack>

        <GoogleButton />

        <Box
          p={8}
          rounded="lg"
          boxShadow="lg"
          minW={{ base: "full", sm: 440 }}
          bg={useColorModeValue("white", "gray.700")}
        >
          <Stack
            as="form"
            noValidate
            spacing={4}
            onSubmit={handleSubmit(onSubmit)}
          >
            <FormInput
              isRequired
              type="email"
              label={t("forms.email-label")}
              placeholder={t("forms.email-placeholder")}
              error={errors.email?.message}
              {...register("email", {
                required: "required",
                pattern: {
                  message: "email",
                  value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                },
              })}
            />
            <FormInput
              isRequired
              type="password"
              label={t("forms.password-label")}
              placeholder={t("forms.password-placeholder")}
              error={errors.password?.message}
              {...register("password", { required: "required" })}
            />

            <Stack spacing={10}>
              <Stack
                align="start"
                justify="space-between"
                direction={{ base: "column", sm: "row" }}
              >
                <Checkbox>{t("logInPage.remember-label")}</Checkbox>
                <Link to="/forget-password" as={LinkRouter} color="blue.400">
                  {t("logInPage.forget-label")}
                </Link>
              </Stack>
              <Button
                type="submit"
                bg="blue.400"
                color="white"
                _hover={{ bg: "blue.500" }}
              >
                {t("login-btn-label")}
              </Button>
            </Stack>

            <Stack pt={2}>
              <Text align="center">
                {t("logInPage.no-acc-label")}{" "}
                <Link to="/logup" as={LinkRouter} color="blue.400">
                  {t("logup-btn-label")}
                </Link>
              </Text>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
};

export default LogIn;
