import { useForm } from "react-hook-form";
import { useServiceRequest } from "@hooks";
import { useTranslation } from "react-i18next";
import { useColorModeValue } from "@chakra-ui/react";

import { emailPattern } from "@constants";
import { SubmitHandler } from "react-hook-form";
import { quickPatientLogup, QuickPatientLogupArgs } from "@services";

import {
  Box,
  Flex,
  Text,
  Link,
  Stack,
  Button,
  Heading,
} from "@chakra-ui/react";
import { FormInput } from "@components";
import { Link as LinkRouter } from "react-router-dom";

type Inputs = {
  name: string;
  email: string;
  password: string;
};

const LogUp = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();
  const { t } = useTranslation();

  const [trigger, { isLoading }] = useServiceRequest<
    QuickPatientLogupArgs,
    void
  >(quickPatientLogup, {
    isShowErrorToast: true,
    isShowSuccessToast: true,
    successToastOptions: { description: t("toast.logup-success") },
    onSuccess() {
      window.location.pathname = "/login";
    },
  });

  const onSubmit: SubmitHandler<Inputs> = ({ ...data }) =>
    trigger({ args: { ...data } });

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg={useColorModeValue("gray.50", "gray.800")}
    >
      <Stack spacing={8} mx="auto" maxW="lg" py={12} px={6}>
        <Stack align="center">
          <Heading fontSize="4xl" textAlign="center">
            {t("logUpPage.title")}
          </Heading>
          <Text fontSize="lg">{t("logUpPage.caption")}</Text>
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
              label={t("forms.name-label")}
              placeholder={t("forms.name-placeholder")}
              error={errors.name?.message as "required"}
              {...register("name", { required: "required" })}
            />

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

            <Button
              type="submit"
              isLoading={isLoading}
              loadingText="Submitting"
              size="lg"
              bg="blue.400"
              color="white"
              _hover={{
                bg: "blue.500",
              }}
            >
              {t("logup-btn-label")}
            </Button>

            <Stack pt={2}>
              <Text align="center">
                {t("logUpPage.has-acc-label")}{" "}
                <Link to="/login" as={LinkRouter} color="blue.400">
                  {t("login-btn-label")}
                </Link>
              </Text>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
};

export default LogUp;
