import React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDidUpdateEffect, useServiceRequest } from "@hooks";

import {
  getBed,
  saveBed,
  getRooms,
  updateBed,
  GetBedArgs,
  GetRoomsArgs,
  UpsertBedArgs,
} from "@services";
import { buildOptionModel } from "@helpers";
import { SubmitHandler } from "react-hook-form";
import { AnyObject, Bed, PaginatorResponse, Room } from "@types";

import Loader from "../Loader";
import FormModal from "../FormModal";
import { Flex } from "@chakra-ui/react";
import { FormInput, FormSelect, FormTextarea } from "../FormBuilder";

type Inputs = {
  name: string;
  width: number;
  height: number;
  length: number;
  room: string;
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
    watch,
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  // Local State
  const [options, setOptions] = React.useState({ rooms: [] });

  // Server State
  const [getRoomsOptions, { isLoading: isRoomsOptionsLoading }] =
    useServiceRequest<GetRoomsArgs, PaginatorResponse<Room>>(getRooms);
  const [getBedData, { isLoading: isGetBedLoading }] = useServiceRequest<
    GetBedArgs,
    Bed
  >(getBed);
  const [save, { isLoading: isSaveLoading }] = useServiceRequest<
    UpsertBedArgs,
    void
  >(saveBed);
  const [update, { isLoading: isUpdateLoading }] = useServiceRequest<
    UpsertBedArgs,
    void
  >(updateBed);

  /* ↓ State Effects ↓ */

  useDidUpdateEffect(() => {
    getRoomsOptions({
      args: { pageSize: 999, pageNumber: 1 },
      onSuccess(response) {
        const rooms = (
          response?.items?.length ? response?.items?.map(buildOptionModel) : []
        ) as [];
        setOptions((prev) => ({ ...prev, rooms }));
      },
    });

    data?.id &&
      getBedData({
        args: { id: data?.id },
        onSuccess(response) {
          reset({
            ...response,
            room: response?.room?.id || "",
          });
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
      <Loader fixed isLoading={isGetBedLoading || isRoomsOptionsLoading} />

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
      <FormSelect
        value={watch("room")}
        skipOptionsTranslation
        options={options?.rooms || []}
        label={t("bed-form.room-label")}
        placeholder={t("bed-form.room-placeholder")}
        error={errors.room?.message as "required"}
        {...register("room", { required: "required" })}
      />
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
