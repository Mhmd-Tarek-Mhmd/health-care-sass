import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDidUpdateEffect, useServiceRequest } from "@hooks";

import {
  getAppointment,
  upsertAppointment,
  GetAppointmentArgs,
  UpsertAppointmentArgs,
  getAppointmentModalOptions,
} from "@services";
import dayjs from "dayjs";
import { Appointment, AnyObject } from "@types";
import { SubmitHandler } from "react-hook-form";

import Loader from "../Loader";
import FormModal from "../FormModal";
import { userTypes } from "@constants";
import { Flex } from "@chakra-ui/react";
import { checkUserTypes } from "@helpers";
import { FormDateInput, FormSelect } from "../FormBuilder";

type Inputs = {
  to: string;
  from: string;
  doctor: string;
  patients?: string[];
};

type AppointmentModalProps = {
  data: AnyObject;
  onClose: VoidFunction;
  refetchList: VoidFunction;
};

const toValidate = (to: string, inputs: Inputs) => {
  return (
    dayjs(to).isAfter(dayjs(inputs.from)) || "to"
  );
};

const AppointmentModal = ({
  data,
  onClose,
  refetchList,
}: AppointmentModalProps) => {
  const { t } = useTranslation();
  const {
    watch,
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  // Server State
  const [getOptions, { data: options, isLoading: isOptionsLoading }] =
    useServiceRequest(getAppointmentModalOptions);
  const [getAppointmentData, { isLoading: isDataLoading }] = useServiceRequest<
    GetAppointmentArgs,
    Appointment
  >(getAppointment);
  const [upsert, { isLoading: isUpsertLoading }] = useServiceRequest<
    UpsertAppointmentArgs,
    void
  >(upsertAppointment);

  /* ↓ State Effects ↓ */

  useDidUpdateEffect(() => {
    getOptions({
      onSuccess() {
        data?.id &&
          getAppointmentData({
            args: { id: data?.id },
            onSuccess(response) {
              reset({
                ...response,
                doctor: response?.doctor?.id || "",
                patients: response?.patients?.map((p) => p.id) || [],
                to: response?.to
                  ? dayjs.unix(response.to.seconds).format("YYYY-MM-DDTHH:mm")
                  : "",
                from: response?.from
                  ? dayjs
                      .unix(response?.from?.seconds)
                      .format("YYYY-MM-DDTHH:mm")
                  : "",
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
        to: new Date(args?.to),
        from: new Date(args?.from),
        patients: args?.patients || [],
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
      size="lg"
      onClose={onClose}
      onSave={handleSubmit(onSubmit)}
      isLoading={isUpsertLoading}
      title={
        data?.isEdit
          ? "appointment-form.edit-title"
          : "appointment-form.create-title"
      }
    >
      <Loader fixed isLoading={isOptionsLoading || isDataLoading} />

      <FormSelect
        isRequired
        skipOptionsTranslation
        value={watch("doctor")}
        isDisabled={data?.isEdit}
        options={options?.doctors || []}
        label={t("appointment-form.doctor-label")}
        placeholder={t("appointment-form.doctor-placeholder")}
        error={errors.doctor?.message as "required"}
        {...register("doctor", { required: "required" })}
      />
      <Flex gap={2} justifyContent="space-between" alignItems="center">
        <FormDateInput
          dateTime
          isRequired
          isDisabled={data?.isEdit && checkUserTypes([userTypes.NURSE])}
          label={t("forms.from-label")}
          error={errors.from?.message as "required"}
          {...register("from", { required: "required" })}
          sx={{ maxWidth: 230 }}
        />
        <FormDateInput
          dateTime
          isRequired
          isDisabled={data?.isEdit && checkUserTypes([userTypes.NURSE])}
          label={t("forms.to-label")}
          error={errors.to?.message as "required"}
          {...register("to", { required: "required", validate: toValidate })}
          sx={{ maxWidth: 230 }}
        />
      </Flex>
      <FormSelect
        isMulti
        isClearable={false}
        skipOptionsTranslation
        value={watch("patients")}
        options={options?.patients || []}
        label={t("appointment-form.patients-label")}
        placeholder={t("appointment-form.patients-placeholder")}
        error={errors.patients?.message as "required"}
        {...register("patients")}
      />
    </FormModal>
  );
};

export default AppointmentModal;
