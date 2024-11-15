import React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDidUpdateEffect, useServiceRequest } from "@hooks";

import {
  getBeds,
  getRoom,
  saveRoom,
  updateRoom,
  GetRoomArgs,
  GetBedsArgs,
  UpsertRoomArgs,
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
  floor: number;
  width: number;
  length: number;
  beds?: string[];
  details: string;
};

type RoomModalProps = {
  data: AnyObject;
  onClose: VoidFunction;
  refetchList: VoidFunction;
};

const RoomModal = ({ data, onClose, refetchList }: RoomModalProps) => {
  const { t } = useTranslation();
  const {
    watch,
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  // Local State
  const [options, setOptions] = React.useState({ beds: [] });

  // Server State
  const [getBedsOptions, { isLoading: isBedsOptionsLoading }] =
    useServiceRequest<GetBedsArgs, PaginatorResponse<Bed>>(getBeds);
  const [getRoomData, { isLoading: isGetRoomLoading }] = useServiceRequest<
    GetRoomArgs,
    Room
  >(getRoom);
  const [save, { isLoading: isSaveLoading }] = useServiceRequest<
    UpsertRoomArgs,
    void
  >(saveRoom);
  const [update, { isLoading: isUpdateLoading }] = useServiceRequest<
    UpsertRoomArgs,
    void
  >(updateRoom);

  /* ↓ State Effects ↓ */

  useDidUpdateEffect(() => {
    getBedsOptions({
      args: { pageSize: 999, pageNumber: 1 },
      onSuccess(response) {
        const beds = (
          response?.items?.length
            ? response?.items
                ?.filter((bed) => !bed?.room)
                ?.map(buildOptionModel)
            : []
        ) as [];
        setOptions((prev) => ({ ...prev, beds }));
      },
    });

    data?.id &&
      getRoomData({
        args: { id: data?.id },
        onSuccess(response) {
          reset({
            ...response,
            beds: response?.beds.map((p) => p.id),
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
        width: +args.width,
        length: +args.length,
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
      title={data?.isEdit ? "room-form.edit-title" : "room-form.create-title"}
    >
      <Loader fixed isLoading={isGetRoomLoading || isBedsOptionsLoading} />

      <FormInput
        isRequired
        label={t("room-form.name-label")}
        placeholder={t("room-form.name-placeholder")}
        error={errors.name?.message as "required"}
        {...register("name", { required: "required" })}
      />
      <FormInput
        isRequired
        type="number"
        label={t("room-form.floor-label")}
        placeholder={t("room-form.floor-placeholder")}
        error={errors.floor?.message as "required"}
        {...register("floor", { required: "required", valueAsNumber: true })}
      />
      <Flex gap={3} my={1}>
        <FormInput
          isRequired
          type="number"
          suffix={t("room-form.dimensions-unit")}
          label={t("room-form.width-label")}
          placeholder={t("room-form.width-placeholder")}
          error={errors.width?.message as "required"}
          {...register("width", { required: "required", valueAsNumber: true })}
        />
        <FormInput
          isRequired
          type="number"
          suffix={t("room-form.dimensions-unit")}
          label={t("room-form.length-label")}
          placeholder={t("room-form.length-placeholder")}
          error={errors.length?.message as "required"}
          {...register("length", { required: "required", valueAsNumber: true })}
        />
      </Flex>
      <FormSelect
        isMulti
        isClearable={false}
        value={watch("beds")}
        skipOptionsTranslation
        options={options?.beds || []}
        label={t("room-form.beds-label")}
        placeholder={t("room-form.beds-placeholder")}
        {...register("beds")}
      />
      <FormTextarea
        label={t("room-form.details-label")}
        placeholder={t("room-form.details-placeholder")}
        {...register("details")}
      />
    </FormModal>
  );
};

export default RoomModal;
