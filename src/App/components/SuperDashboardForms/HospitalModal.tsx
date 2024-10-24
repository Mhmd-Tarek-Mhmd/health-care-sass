import React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDidUpdateEffect, useServiceRequest } from "@hooks";

import {
  getPlans,
  getHospital,
  GetPlansArgs,
  saveHospital,
  updateHospital,
  GetHospitalArgs,
} from "@services";
import { emailPattern } from "@constants";
import { buildOptionModel } from "@helpers";
import { SubmitHandler } from "react-hook-form";
import { Plan, Hospital, AnyObject, PaginatorResponse } from "@types";

import Loader from "../Loader";
import FormModal from "../FormModal";
import { FormInput, FormSelect, FormPhoneInput } from "../FormBuilder";

type Inputs = {
  name: string;
  plan: string;
  email: string;
  phone: string;
};

type HospitalModalProps = {
  data: AnyObject;
  onClose: VoidFunction;
  refetchList: VoidFunction;
};

const HospitalModal = ({ data, onClose, refetchList }: HospitalModalProps) => {
  const { t } = useTranslation();
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  // Local State
  const [options, setOptions] = React.useState({ plans: [] });

  // Server State
  const [getPlansOptions, { isLoading: isPlansOptionsLoading }] =
    useServiceRequest<GetPlansArgs, PaginatorResponse<Plan>>(getPlans);
  const [getHospitalData, { isLoading: isDataLoading }] = useServiceRequest<
    GetHospitalArgs,
    Hospital
  >(getHospital);
  const [save, { isLoading: isSaveLoading }] = useServiceRequest<
    Hospital,
    void
  >(saveHospital);
  const [update, { isLoading: isUpdateLoading }] = useServiceRequest<
    Hospital,
    void
  >(updateHospital);

  /* ↓ State Effects ↓ */

  useDidUpdateEffect(() => {
    getPlansOptions({
      args: { pageSize: 999, pageNumber: 1 },
      onSuccess(response) {
        const plans = (
          response?.items?.length ? response?.items?.map(buildOptionModel) : []
        ) as [];
        setOptions((prev) => ({ ...prev, plans }));
      },
    });

    data?.id &&
      getHospitalData({
        args: { id: data?.id },
        onSuccess(response) {
          reset({
            name: response?.name,
            plan: response?.plan?.id,
            email: response?.email,
            phone: response?.phone,
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
        data?.isEdit ? "hospital-form.edit-title" : "hospital-form.create-title"
      }
    >
      <Loader fixed isLoading={isDataLoading || isPlansOptionsLoading} />

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
        options={options?.plans || []}
        label={t("hospital-form.plan-label")}
        placeholder={t("hospital-form.plan-placeholder")}
        error={errors.plan?.message as "required"}
        {...register("plan", { required: "required" })}
      />
    </FormModal>
  );
};

export default HospitalModal;
