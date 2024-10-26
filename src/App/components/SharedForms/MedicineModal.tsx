import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDidUpdateEffect, useServiceRequest } from "@hooks";

import {
  getMedicine,
  upsertMedicine,
  GetMedicineArgs,
  UpsertMedicineArgs,
} from "@services";
import { Medicine, AnyObject } from "@types";
import { SubmitHandler } from "react-hook-form";

import Loader from "../Loader";
import FormModal from "../FormModal";
import { FormInput } from "../FormBuilder";

type Inputs = {
  name: string;
};

type MedicineModalProps = {
  data: AnyObject;
  onClose: VoidFunction;
  refetchList: VoidFunction;
};

const MedicineModal = ({ data, onClose, refetchList }: MedicineModalProps) => {
  const { t } = useTranslation();
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  // Server State
  const [getMedicineData, { isLoading: isDataLoading }] = useServiceRequest<
    GetMedicineArgs,
    Medicine
  >(getMedicine);
  const [upsert, { isLoading: isUpsertLoading }] = useServiceRequest<
    UpsertMedicineArgs,
    void
  >(upsertMedicine);

  /* ↓ State Effects ↓ */

  useDidUpdateEffect(() => {
    data?.id &&
      getMedicineData({
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
        data?.isEdit ? "medicine-form.edit-title" : "medicine-form.create-title"
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
    </FormModal>
  );
};

export default MedicineModal;
