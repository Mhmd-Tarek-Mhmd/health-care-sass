import { useForm } from "react-hook-form";
import { useServiceRequest } from "@hooks";
import { useTranslation } from "react-i18next";
import { useColorModeValue } from "@chakra-ui/react";

import { SubmitHandler } from "react-hook-form";
import { forgetPassword, ForgetPasswordArgs } from "@services";

import { FormInput } from "@components";
import { Text, Flex, Stack, Button, Heading } from "@chakra-ui/react";

type Inputs = {
  email: string;
};

const ForgetPassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();
  const { t } = useTranslation();
  const [trigger, { isLoading }] = useServiceRequest<ForgetPasswordArgs, void>(
    forgetPassword,
    {
      isShowErrorToast: true,
      isShowSuccessToast: true,
      successToastOptions: { description: t("toast.reset-password-success") },
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
      <Stack
        as="form"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        p={6}
        my={12}
        w="full"
        maxW="md"
        spacing={4}
        rounded="xl"
        boxShadow="lg"
        bg={useColorModeValue("white", "gray.700")}
      >
        <Heading lineHeight={1.1} fontSize={{ base: "2xl", md: "3xl" }}>
          {t("forgetPasswordPage.title")}
        </Heading>
        <Text
          fontSize={{ base: "sm", sm: "md" }}
          color={useColorModeValue("gray.800", "gray.400")}
        >
          {t("forgetPasswordPage.caption")}
        </Text>

        <FormInput
          isRequired
          type="email"
          label={t("forms.email-label")}
          placeholder={t("forms.email-placeholder")}
          error={errors.email?.message as "required" | "email"}
          {...register("email", {
            required: "required",
            pattern: {
              message: "email",
              value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            },
          })}
        />

        <Button
          type="submit"
          bg="blue.400"
          color="white"
          isLoading={isLoading}
          _hover={{ bg: "blue.500" }}
        >
          {t("forgetPasswordPage.reset-label")}
        </Button>
      </Stack>
    </Flex>
  );
};

export default ForgetPassword;
