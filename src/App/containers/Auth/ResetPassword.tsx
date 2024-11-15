import { useForm } from "react-hook-form";
import { useServiceRequest } from "@hooks";
import { useTranslation } from "react-i18next";
import { useColorModeValue } from "@chakra-ui/react";

import { SubmitHandler } from "react-hook-form";
import { resetPassword, ResetPasswordArgs } from "@services";

import { FormInput } from "@components";
import { Flex, Stack, Button, Heading } from "@chakra-ui/react";

type Inputs = {
  password: string;
  passwordConfirm: string;
};

const ResetPassword = () => {
  const {
    watch,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();
  const { t } = useTranslation();

  const [trigger, { isLoading }] = useServiceRequest<ResetPasswordArgs, void>(
    resetPassword,
    {
      isShowErrorToast: true,
      isShowSuccessToast: true,
      onSuccess: () => {
        window.location.pathname = "/dashboard";
      },
    }
  );

  const password = watch("password");
  const onSubmit: SubmitHandler<Inputs> = ({ password }) =>
    trigger({ args: { password } });

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg={useColorModeValue("gray.50", "gray.800")}
    >
      <Stack
        p={6}
        my={12}
        w="full"
        maxW="md"
        spacing={4}
        rounded="xl"
        boxShadow="lg"
        bg={useColorModeValue("white", "gray.700")}
        as="form"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        <Heading lineHeight={1.1} fontSize={{ base: "2xl", md: "3xl" }}>
          {t("headings.reset-password-heading")}
        </Heading>

        <FormInput
          isRequired
          type="password"
          label={t("forms.password-label")}
          placeholder={t("forms.password-placeholder")}
          error={errors.password?.message as "required"}
          {...register("password", { required: "required" })}
        />
        <FormInput
          isRequired
          type="password"
          label={t("forms.passwordConfirm-label")}
          placeholder={t("forms.passwordConfirm-placeholder")}
          error={
            errors.passwordConfirm?.message as "required" | "passwordConfirm"
          }
          {...register("passwordConfirm", {
            required: "required",
            validate: (value) => value === password || "passwordConfirm",
          })}
        />

        <Stack spacing={6}>
          <Button
            bg="blue.400"
            color="white"
            type="submit"
            isLoading={isLoading}
            _hover={{ bg: "blue.500" }}
          >
            {t("actions.submit-btn-label")}
          </Button>
        </Stack>
      </Stack>
    </Flex>
  );
};

export default ResetPassword;
