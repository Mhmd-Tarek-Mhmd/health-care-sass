import React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDidUpdateEffect, useServiceRequest } from "@hooks";

import {
  getNurse,
  getDoctors,
  upsertNurse,
  GetDoctorsArgs,
  GetNurseArgs,
  UpsertNurseArgs,
} from "@services";
import { emailPattern } from "@constants";
import { buildOptionModel } from "@helpers";
import { SubmitHandler } from "react-hook-form";
import { Doctor, Nurse, AnyObject, PaginatorResponse } from "@types";

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
  doctors: string[];
};

type NurseModalProps = {
  data: AnyObject;
  onClose: VoidFunction;
  refetchList: VoidFunction;
};

const NurseModal = ({ data, onClose, refetchList }: NurseModalProps) => {
  const { t } = useTranslation();
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  // Local State
  const [options, setOptions] = React.useState({
    doctors: [],
    genders: ["Male", "Female"],
  });

  // Server State
  const [getDoctorsOptions, { isLoading: isDoctorsOptionsLoading }] =
    useServiceRequest<GetDoctorsArgs, PaginatorResponse<Doctor>>(getDoctors);
  const [getNurseData, { isLoading: isDataLoading }] = useServiceRequest<
    GetNurseArgs,
    Nurse
  >(getNurse);
  const [upsert, { isLoading: isUpsertLoading }] = useServiceRequest<
    UpsertNurseArgs,
    void
  >(upsertNurse);

  /* ↓ State Effects ↓ */

  useDidUpdateEffect(() => {
    getDoctorsOptions({
      args: { pageSize: 999, pageNumber: 1 },
      onSuccess(response) {
        const doctors = (
          response?.items?.length ? response?.items?.map(buildOptionModel) : []
        ) as [];
        setOptions((prev) => ({ ...prev, doctors }));

        data?.id &&
          getNurseData({
            args: { id: data?.id },
            onSuccess(response) {
              reset({
                ...response,
                doctors: response?.doctors?.[0]?.id,
                // doctors: response?.doctors.map((p) => p.id),
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
      isLoading={isUpsertLoading}
      title={data?.isEdit ? "nurse-form.edit-title" : "nurse-form.create-title"}
    >
      <Loader fixed isLoading={isDataLoading || isDoctorsOptionsLoading} />

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
          options={options?.genders || []}
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
        label={t("nurse-form.doctors-label")}
        placeholder={t("nurse-form.doctors-placeholder")}
        error={errors.doctors?.message as "required"}
        {...register("doctors", { required: "required" })}
      />
    </FormModal>
  );
};

export default NurseModal;
