import { useForm } from "react-hook-form";
import { useServiceRequest } from "@hooks";
import { useTranslation } from "react-i18next";

import {
  resetPassword,
  clearProfileImage,
  ResetPasswordArgs,
  updateProfileImage,
  UpdateProfileImageArgs,
} from "@services";
import { User } from "@types";
import { useAppStore } from "@store";
import { SubmitHandler } from "react-hook-form";

import {
  Box,
  Flex,
  Input,
  Avatar,
  Center,
  Button,
  Heading,
  FormLabel,
  Container,
  IconButton,
  AvatarBadge,
  FormControl,
} from "@chakra-ui/react";
import { IoIosClose } from "react-icons/io";
import { FormInput, Loader } from "@components";

type Inputs = {
  password: string;
  passwordConfirm: string;
};

const Settings = () => {
  const {
    watch,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();
  const { t } = useTranslation();
  const setAvatar = useAppStore((state) => state.setAvatar);
  const { name, email, photoURL } = useAppStore(
    (state) => state.auth?.user
  ) as User;

  const [resetTrigger, { isLoading: resetLoading }] = useServiceRequest<
    ResetPasswordArgs,
    void
  >(resetPassword, {
    isShowErrorToast: true,
    isShowSuccessToast: true,
  });
  const [updateImageTrigger, { isLoading: updateProfileImageLoading }] =
    useServiceRequest<UpdateProfileImageArgs, string>(updateProfileImage, {
      isShowErrorToast: true,
      isShowSuccessToast: true,
      onSuccess: (photoURL) => {
        setAvatar(photoURL as string);
      },
    });
  const [clearImageTrigger, { isLoading: clearImageTriggerLoading }] =
    useServiceRequest(clearProfileImage, {
      isShowErrorToast: true,
      isShowSuccessToast: true,
      onSuccess: () => {
        setAvatar("");
      },
    });

  const password = watch("password");
  const resetOnSubmit: SubmitHandler<Inputs> = ({ password }) =>
    resetTrigger({ args: { password } });

  return (
    <>
      <Loader
        fixed
        isLoading={
          resetLoading || updateProfileImageLoading || clearImageTriggerLoading
        }
      />

      <Heading
        pt={30}
        mb={70}
        lineHeight={1.1}
        fontSize={{ base: "2xl", md: "3xl" }}
      >
        {t("tabs.settings")}
      </Heading>

      <Container minH="100vh">
        <Flex justifyContent="space-between" flexWrap="wrap">
          <Box mb={25}>
            <Center>
              <Avatar size="xl" src={photoURL}>
                <AvatarBadge
                  as={IconButton}
                  size="sm"
                  top="-10px"
                  rounded="full"
                  colorScheme="red"
                  icon={<IoIosClose />}
                  onClick={() => clearImageTrigger()}
                  aria-label="Clear your profile image"
                />
              </Avatar>
            </Center>
            <Center w="full" mt={5}>
              <Button w="full" sx={{ position: "relative" }}>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    updateImageTrigger({
                      args: { image: e?.target?.files?.[0] as File },
                    })
                  }
                  sx={{
                    inset: 1,
                    opacity: 0,
                    zIndex: 99,
                    cursor: "pointer",
                    position: "absolute",
                  }}
                />
                {t("actions.update-image-btn-label")}
              </Button>
            </Center>
          </Box>

          <Box>
            <FormControl isDisabled mb={5}>
              <FormLabel>{t("forms.name-label")}</FormLabel>
              <Input type="text" defaultValue={name} />
            </FormControl>

            <FormControl isDisabled>
              <FormLabel>{t("forms.email-label")}</FormLabel>
              <Input type="email" defaultValue={email} />
            </FormControl>
          </Box>
        </Flex>

        <Flex
          gap={3}
          as="form"
          noValidate
          flexDir="column"
          onSubmit={handleSubmit(resetOnSubmit)}
        >
          <Heading
            mt={10}
            mb={30}
            lineHeight={1.1}
            fontSize={{ base: "lg", md: "xl" }}
          >
            {t("headings.update-password-heading")}
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
          <Button width="full" type="submit" isLoading={resetLoading}>
            {t("actions.update-btn-label")}
          </Button>
        </Flex>
      </Container>
    </>
  );
};

export default Settings;
