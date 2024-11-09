import React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDidUpdateEffect, useServiceRequest } from "@hooks";

import {
  getDoctor,
  getPatients,
  upsertDoctor,
  GetPatientsArgs,
  GetDoctorArgs,
  UpsertDoctorArgs,
} from "@services";
import { emailPattern } from "@constants";
import { SubmitHandler } from "react-hook-form";
import { buildOptionModel, validatePhoneNumber } from "@helpers";
import { Patient, Doctor, AnyObject, PaginatorResponse } from "@types";

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
  patients?: string[];
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

  // Local State
  const [options, setOptions] = React.useState({
    patients: [],
    genders: ["Male", "Female"],
  });

  // Server State
  const [getPatientsOptions, { isLoading: isPatientsOptionsLoading }] =
    useServiceRequest<GetPatientsArgs, PaginatorResponse<Patient>>(getPatients);
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
    getPatientsOptions({
      args: { pageSize: 999, pageNumber: 1 },
      onSuccess(response) {
        const patients = (
          response?.items?.length ? response?.items?.map(buildOptionModel) : []
        ) as [];
        setOptions((prev) => ({ ...prev, patients }));

        data?.id &&
          getDoctorData({
            args: { id: data?.id },
            onSuccess(response) {
              reset({
                ...response,
                patients: response?.patients.map((p) => p.id),
              });
            },
          });
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
      <Loader fixed isLoading={isDataLoading || isPatientsOptionsLoading} />

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
          options={options?.genders || []}
          label={t("forms.gender-label")}
          placeholder={t("forms.gender-placeholder")}
          error={errors.gender?.message as "required"}
          {...register("gender", { required: "required" })}
        />
      </Flex>
      <FormInput
        isRequired
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
      <FormSelect
        isMulti
        isClearable={false}
        skipOptionsTranslation
        value={watch("patients")}
        options={options?.patients || []}
        label={t("doctor-form.patients-label")}
        placeholder={t("doctor-form.patients-placeholder")}
        {...register("patients")}
      />
    </FormModal>
  );
};

export default DoctorModal;
