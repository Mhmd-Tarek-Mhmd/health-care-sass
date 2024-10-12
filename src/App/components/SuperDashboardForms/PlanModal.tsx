import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDidUpdateEffect, useServiceRequest } from "@hooks";

import { priceUnits } from "@constants";
import { AnyObject, Plan } from "@types";
import { SubmitHandler } from "react-hook-form";
import { getPlan, GetPlanArgs, savePlan, updatePlan } from "@services";

import Loader from "../Loader";
import FormModal from "../FormModal";
import { Checkbox, Flex } from "@chakra-ui/react";
import { FormInput, FormSelect } from "../FormBuilder";

type Inputs = {
  name: string;
  users: number;
  price: number;
  storage: number;
  currency: string;
  isInfiniteUsers: boolean;
};

type PlanModalProps = {
  data: AnyObject;
  onClose: VoidFunction;
  refetchList: VoidFunction;
};

const PlanModal = ({ data, onClose, refetchList }: PlanModalProps) => {
  const { t } = useTranslation();
  const {
    watch,
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  // Server State
  const [getPlanData, { isLoading: isGetPlanLoading }] = useServiceRequest<
    GetPlanArgs,
    Plan
  >(getPlan);
  const [save, { isLoading: isSaveLoading }] = useServiceRequest<Plan, void>(
    savePlan
  );
  const [update, { isLoading: isUpdateLoading }] = useServiceRequest<
    Plan,
    void
  >(updatePlan);

  /* ↓ State Effects ↓ */

  useDidUpdateEffect(() => {
    getPlanData({
      args: { id: data?.id },
      onSuccess(response) {
        reset(response);
      },
    });
  }, []);

  /* ↓ Helpers ↓ */

  const onSubmit: SubmitHandler<Inputs> = ({ users, ...args }) => {
    const upsert = data?.isEdit ? update : save;
    upsert({
      isShowErrorToast: true,
      isShowSuccessToast: true,
      args: {
        ...args,
        ...(data?.id && { id: data?.id }),
        users: args?.isInfiniteUsers ? null : users,
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
      title={data?.isEdit ? "plan-form.edit-title" : "plan-form.create-title"}
    >
      <Loader fixed isLoading={isGetPlanLoading} />

      <FormInput
        isRequired
        label={t("plan-form.name-label")}
        placeholder={t("plan-form.name-placeholder")}
        error={errors.name?.message as "required"}
        {...register("name", { required: "required" })}
      />
      <Flex my={2} columnGap={3}>
        {watch("isInfiniteUsers") ? null : (
          <FormInput
            isRequired
            label={t("plan-form.users-label")}
            placeholder={t("plan-form.users-placeholder")}
            error={errors.users?.message as "required"}
            {...register("users", { required: "required" })}
          />
        )}
        <Checkbox
          minW={120}
          mt={watch("isInfiniteUsers") ? 0 : 8}
          {...register("isInfiniteUsers")}
        >
          {t("plan-form.isInfiniteUsers-label")}
        </Checkbox>
      </Flex>
      <FormInput
        isRequired
        suffix="mb"
        label={t("plan-form.storage-label")}
        placeholder={t("plan-form.storage-placeholder")}
        error={errors.storage?.message as "required"}
        {...register("storage", { required: "required" })}
      />
      <Flex columnGap={3} mt={2}>
        <FormInput
          isRequired
          prefixIcon="money"
          label={t("plan-form.price-label")}
          placeholder={t("plan-form.price-placeholder")}
          error={errors.price?.message as "required"}
          {...register("price", { required: "required" })}
        />
        <FormSelect
          isRequired
          prefixIcon="dollar"
          options={priceUnits}
          label={t("plan-form.currency-label")}
          placeholder={t("plan-form.currency-placeholder")}
          error={errors.currency?.message as "required"}
          {...register("currency", { required: "required" })}
        />
      </Flex>
    </FormModal>
  );
};

export default PlanModal;
