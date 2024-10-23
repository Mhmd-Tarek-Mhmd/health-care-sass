import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDidUpdateEffect, useServiceRequest } from "@hooks";

import {
  getPatient,
  savePatient,
  updatePatient,
  GetPatientArgs,
  UpsertPatientArgs,
  getPatientModalOptions,
} from "@services";
import { emailPattern } from "@constants";
import { Patient, AnyObject } from "@types";
import { SubmitHandler } from "react-hook-form";

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
  bed: string;
  room: string;
  doctors: string[];
};

type PatientModalProps = {
  data: AnyObject;
  onClose: VoidFunction;
  refetchList: VoidFunction;
};

const PatientModal = ({ data, onClose, refetchList }: PatientModalProps) => {
  const { t } = useTranslation();
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  // Server State
  const [getOptions, { data: options, isLoading: isOptionsLoading }] =
    useServiceRequest(getPatientModalOptions);
  const [getPatientData, { isLoading: isDataLoading }] = useServiceRequest<
    GetPatientArgs,
    Patient
  >(getPatient);
  const [save, { isLoading: isSaveLoading }] = useServiceRequest<
    UpsertPatientArgs,
    void
  >(savePatient);
  const [update, { isLoading: isUpdateLoading }] = useServiceRequest<
    UpsertPatientArgs,
    void
  >(updatePatient);

  /* ↓ State Effects ↓ */

  useDidUpdateEffect(() => {
    getOptions({
      onSuccess() {
        data?.id &&
          getPatientData({
            args: { id: data?.id },
            onSuccess(response) {
              reset({
                ...response,
                bed: response?.bed?.id || null,
                room: response?.room?.id || null,
                doctors: response?.doctors?.[0]?.id || null,
                // doctors: response?.doctors.map((p) => p.id),
              });
            },
          });
      },
    });
  }, []);

  /* ↓ Helpers ↓ */

  const onSubmit: SubmitHandler<Inputs> = (args) => {
    const upsert = data?.isEdit ? update : save;
    upsert({
      isShowErrorToast: true,
      isShowSuccessToast: true,
      args: {
        ...args,
        ...(data?.id && { id: data?.id }),
        doctors: [args?.doctors],
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
      isLoading={isSaveLoading || isUpdateLoading}
      title={
        data?.isEdit ? "patient-form.edit-title" : "patient-form.create-title"
      }
    >
      <Loader fixed isLoading={isDataLoading || isOptionsLoading} />

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
          options={["Male", "Female"]}
          label={t("forms.gender-label")}
          placeholder={t("forms.gender-placeholder")}
          error={errors.gender?.message as "required"}
          {...register("gender", { required: "required" })}
        />
      </Flex>
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
        {...register("phone", { required: "required" })}
      />
      <FormSelect
        isRequired
        skipOptionsTranslation
        options={options?.doctors || []}
        label={t("patient-form.doctors-label")}
        placeholder={t("patient-form.doctors-placeholder")}
        error={errors.doctors?.message as "required"}
        {...register("doctors", { required: "required" })}
      />
      <FormSelect
        isRequired
        skipOptionsTranslation
        options={options?.rooms || []}
        label={t("patient-form.room-label")}
        placeholder={t("patient-form.room-placeholder")}
        // error={errors.room?.message as "required"}
        {...register("room")}
      />
      <FormSelect
        isRequired
        skipOptionsTranslation
        options={options?.beds || []}
        label={t("patient-form.bed-label")}
        placeholder={t("patient-form.bed-placeholder")}
        // error={errors.bed?.message as "required"}
        {...register("bed")}
      />
    </FormModal>
  );
};

export default PatientModal;
