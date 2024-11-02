import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDidUpdateEffect, useServiceRequest } from "@hooks";

import { AnyObject, Bed } from "@types";
import { SubmitHandler } from "react-hook-form";
import { getBed, GetBedArgs, saveBed, updateBed } from "@services";

import Loader from "../Loader";
import FormModal from "../FormModal";
import { Flex } from "@chakra-ui/react";
import { FormInput, FormTextarea } from "../FormBuilder";

type Inputs = {
  name: string;
  width: number;
  height: number;
  length: number;
  details?: string;
};

type BedModalProps = {
  data: AnyObject;
  onClose: VoidFunction;
  refetchList: VoidFunction;
};

const BedModal = ({ data, onClose, refetchList }: BedModalProps) => {
  const { t } = useTranslation();
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  // Server State
  const [getBedData, { isLoading: isGetBedLoading }] = useServiceRequest<
    GetBedArgs,
    Bed
  >(getBed);
  const [save, { isLoading: isSaveLoading }] = useServiceRequest<Bed, void>(
    saveBed
  );
  const [update, { isLoading: isUpdateLoading }] = useServiceRequest<Bed, void>(
    updateBed
  );

  /* ↓ State Effects ↓ */

  useDidUpdateEffect(() => {
    data?.id &&
      getBedData({
        args: { id: data?.id },
        onSuccess(response) {
          reset(response);
        },
      });
  }, []);

  /* ↓ Helpers ↓ */

  const onSubmit: SubmitHandler<Inputs> = ({
    width,
    height,
    length,
    ...args
  }) => {
    const upsert = data?.isEdit ? update : save;
    upsert({
      isShowErrorToast: true,
      isShowSuccessToast: true,
      args: {
        ...args,
        ...(data?.id && { id: data?.id }),
        width: +width,
        height: +height,
        length: +length,
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
      title={data?.isEdit ? "bed-form.edit-title" : "bed-form.create-title"}
    >
      <Loader fixed isLoading={isGetBedLoading} />

      <FormInput
        isRequired
        label={t("bed-form.name-label")}
        placeholder={t("bed-form.name-placeholder")}
        error={errors.name?.message as "required"}
        {...register("name", { required: "required" })}
      />
      <Flex gap={3} my={1}>
        <FormInput
          isRequired
          type="number"
          suffix={t("bed-form.dimensions-unit")}
          label={t("bed-form.width-label")}
          placeholder={t("bed-form.width-placeholder")}
          error={errors.width?.message as "required"}
          {...register("width", { required: "required", valueAsNumber: true })}
        />
        <FormInput
          isRequired
          type="number"
          suffix={t("bed-form.dimensions-unit")}
          label={t("bed-form.length-label")}
          placeholder={t("bed-form.length-placeholder")}
          error={errors.length?.message as "required"}
          {...register("length", { required: "required", valueAsNumber: true })}
        />
        <FormInput
          isRequired
          type="number"
          suffix={t("bed-form.dimensions-unit")}
          label={t("bed-form.height-label")}
          placeholder={t("bed-form.height-placeholder")}
          error={errors.height?.message as "required"}
          {...register("height", { required: "required", valueAsNumber: true })}
        />
      </Flex>

      <FormTextarea
        label={t("bed-form.details-label")}
        placeholder={t("bed-form.details-placeholder")}
        error={errors.details?.message as "required"}
        {...register("details")}
      />
    </FormModal>
  );
};

export default BedModal;
