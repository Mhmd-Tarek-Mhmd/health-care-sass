import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDidUpdateEffect, useServiceRequest } from "@hooks";

import {
  getDoctor,
  upsertDoctor,
  GetDoctorArgs,
  UpsertDoctorArgs,
} from "@services";
import { Doctor, AnyObject } from "@types";
import { validatePhoneNumber } from "@helpers";
import { SubmitHandler } from "react-hook-form";
import { doctorSpecializations, emailPattern } from "@constants";

import Loader from "../Loader";
import FormModal from "../FormModal";
import { Flex } from "@chakra-ui/react";
import { FormInput, FormSelect, FormPhoneInput } from "../FormBuilder";

type Inputs = {
  name: string;
  age: string;
  gender: string;
  email: string;
  phone: string;
  specialty: string;
};

type DoctorModalProps = {
  data: AnyObject;
  onClose: VoidFunction;
  refetchList: VoidFunction;
};

const DoctorModal = ({ data, onClose, refetchList }: DoctorModalProps) => {
  const { t } = useTranslation();
  const {
    watch,
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  // Server State
  const [getDoctorData, { isLoading: isDataLoading }] = useServiceRequest<
    GetDoctorArgs,
    Doctor
  >(getDoctor);
  const [upsert, { isLoading: isUpsertLoading }] = useServiceRequest<
    UpsertDoctorArgs,
    void
  >(upsertDoctor);

  /* ↓ State Effects ↓ */

  useDidUpdateEffect(() => {
    data?.id &&
      getDoctorData({
        args: { id: data?.id },
        onSuccess(response) {
          reset(response);
        },
      });
  }, []);

  /* ↓ Helpers ↓ */

  const onSubmit: SubmitHandler<Inputs> = (args) => {
    upsert({
      isShowErrorToast: true,
      isShowSuccessToast: true,
      args: {
        ...args,
        ...(data?.id && { id: data?.id }),
      },
      onSuccess() {
        onClose();
        refetchList();
      },
    });
  };

  return (
    <FormModal
      isOpen
      onClose={onClose}
      onSave={handleSubmit(onSubmit)}
      isLoading={isUpsertLoading}
      title={
        data?.isEdit ? "doctor-form.edit-title" : "doctor-form.create-title"
      }
    >
      <Loader fixed isLoading={isDataLoading} />

      <FormInput
        isRequired
        label={t("forms.name-label")}
        placeholder={t("forms.name-placeholder")}
        error={errors.name?.message as "required"}
        {...register("name", { required: "required" })}
      />
      <Flex gap={2}>
        <FormInput
          isRequired
          type="number"
          label={t("forms.age-label")}
          placeholder={t("forms.age-placeholder")}
          error={errors.age?.message as "required"}
          {...register("age", { required: "required", valueAsNumber: true })}
        />
        <FormSelect
          isRequired
          skipOptionsTranslation
          value={watch("gender")}
          options={["Male", "Female"]}
          label={t("forms.gender-label")}
          placeholder={t("forms.gender-placeholder")}
          error={errors.gender?.message as "required"}
          {...register("gender", { required: "required" })}
        />
      </Flex>
      <FormSelect
        isRequired
        skipOptionsTranslation
        value={watch("specialty")}
        options={doctorSpecializations}
        label={t("doctor-form.specialty-label")}
        placeholder={t("doctor-form.specialty-placeholder")}
        error={errors.specialty?.message as "required"}
        {...register("specialty", { required: "required" })}
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
      <FormPhoneInput
        isRequired
        label={t("forms.phone-label")}
        placeholder={t("forms.phone-placeholder")}
        error={errors.phone?.message as "required"}
        {...register("phone", {
          required: "required",
          validate: validatePhoneNumber,
        })}
      />
    </FormModal>
  );
};

export default DoctorModal;
