import { useAppStore } from "@store";
import { useForm } from "react-hook-form";
import { useServiceRequest } from "@hooks";
import { useTranslation } from "react-i18next";
import { useColorModeValue } from "@chakra-ui/react";

import { Auth } from "@types";
import { emailPattern } from "@constants";
import { SubmitHandler } from "react-hook-form";
import { login as loginService, LogInArgs } from "@services";

import {
  Box,
  Flex,
  Link,
  Text,
  Stack,
  Button,
  Heading,
} from "@chakra-ui/react";
import { FormInput } from "@components";
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
  const user = useAppStore((state) => state.auth?.user);
  const loginStoreAction = useAppStore((state) => state.login);
  const [trigger, { isLoading }] = useServiceRequest<LogInArgs, Auth>(
    loginService,
    {
      isShowErrorToast: true,
      isShowSuccessToast: true,
      onSuccess: (res) => {
        loginStoreAction(res as Auth);
        setTimeout(() => {
          window.location.pathname = user?.isNewAcc
            ? "/reset-password"
            : "/dashboard";
        }, 0);
      },
    }
  );

  const onSubmit: SubmitHandler<Inputs> = (args) => trigger({ args });

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
              error={errors.email?.message as "required" | "email"}
              {...register("email", {
                required: "required",
                pattern: { message: "email", value: emailPattern },
              })}
            />
            <FormInput
              isRequired
              type="password"
              label={t("forms.password-label")}
              placeholder={t("forms.password-placeholder")}
              error={errors.password?.message as "required"}
              {...register("password", { required: "required" })}
            />

            <Stack spacing={4} alignItems="flex-end">
              <Link to="/forget-password" as={LinkRouter} color="blue.400">
                {t("logInPage.forget-label")}
              </Link>
              <Button
                w="full"
                type="submit"
                bg="blue.400"
                color="white"
                isLoading={isLoading}
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
