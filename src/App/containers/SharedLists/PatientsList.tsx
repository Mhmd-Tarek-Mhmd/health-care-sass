import React from "react";
import { useAppStore } from "@store";
import { useServiceRequest } from "@hooks";
import { useTranslation } from "react-i18next";

import {
  getPatients,
  removePatient,
  GetPatientsArgs,
  RemovePatientArgs,
} from "@services";
import dayjs from "dayjs";
import { confirm } from "@helpers";
import { FirebaseError } from "firebase/app";
import { ServiceRequestHook, Options } from "@hooks";
import { AnyObject, Column, PaginatorResponse, Patient } from "@types";
import { datTimeFormat, paginationInitState, userTypes } from "@constants";

import {
  DataTable,
  PatientModal,
  EditIconButton,
  RemoveIconButton,
} from "@components";
import { ShowIfUserType } from "@hoc";
import { BiPlus } from "react-icons/bi";
import { Button, Flex, Link, Tooltip } from "@chakra-ui/react";

const modalInitState = {
  data: {},
  isOpen: false,
};

const Patients = (props: {
  doctorsPatientsService: ServiceRequestHook<
    undefined,
    PaginatorResponse<Patient>,
    FirebaseError
  >;
}) => {
  const { t } = useTranslation();

  // Local State
  const [modalState, setModalState] = React.useState(modalInitState);
  const [pagination, setPagination] = React.useState(paginationInitState);

  // Reducer State
  const canAddNewUser = useAppStore(
    (store) => store.auth?.user?.hospital.canAddNewUser
  );

  // Server State
  const listService = useServiceRequest<
    GetPatientsArgs,
    PaginatorResponse<Patient>
  >(getPatients, {
    isInitialTrigger: !props?.doctorsPatientsService,
    isShowErrorToast: true,
    args: { pageNumber: pagination.page, pageSize: pagination.perPage },
    onSuccess(response) {
      setPagination((prev) => ({ ...prev, ...response?.pagination }));
    },
  });
  const [remove] = useServiceRequest<RemovePatientArgs, void>(removePatient);

  // Constants
  const isDoctor = Boolean(props?.doctorsPatientsService);
  const [getData, { data, called, isLoading }] =
    props?.doctorsPatientsService || listService;
  const columns = React.useMemo<Column<Patient>[]>(
    () => [
      { name: t("lists.name-cell-label"), selector: "name" },
      {
        name: t("lists.createdAt-cell-label"),
        cell: (row) => dayjs.unix(row.createdAt.seconds).format(datTimeFormat),
      },
      {
        name: t("lists.updatedAt-cell-label"),
        cell: (row) =>
          row?.updatedAt
            ? dayjs.unix(row?.updatedAt.seconds).format(datTimeFormat)
            : "",
      },
      { name: t("lists.age-cell-label"), selector: "age" },
      { name: t("lists.gender-cell-label"), selector: "gender" },
      {
        name: t("lists.email-cell-label"),
        cell: (row) => <Link href={`mailto:${row?.email}`}>{row?.email}</Link>,
      },
      {
        name: t("lists.phone-cell-label"),
        cell: (row) => <Link href={`tel:${row?.phone}`}>{row?.phone}</Link>,
      },
      {
        name: t("patients-list.room-cell-label"),
        cell: (row) => row?.bed?.room?.name,
      },
      {
        name: t("patients-list.bed-cell-label"),
        cell: (row) => row?.bed?.name,
      },
      {
        name: t("lists.actions-cell-label"),
        cell: (row) => (
          <Flex columnGap={1}>
            <EditIconButton
              size="sm"
              onClick={() => handleOpenModal({ isEdit: true, id: row.id })}
            />
            <ShowIfUserType types={[userTypes.ADMIN]}>
              <RemoveIconButton size="sm" onClick={() => handleDelete(row)} />
            </ShowIfUserType>
          </Flex>
        ),
      },
    ],
    []
  );

  /* ↓ Helpers ↓ */

  const handleOpenModal = (data: AnyObject = {}) => {
    setModalState({ isOpen: true, data });
  };

  const handleDelete = (patient: Patient) => {
    confirm({ showLoaderOnConfirm: true }).then(({ isConfirmed, cleanup }) => {
      if (isConfirmed) {
        remove({
          isShowErrorToast: true,
          args: { id: patient.id, bedId: patient?.bed?.id as string },
          onSuccess() {
            getData();
            cleanup();
          },
          onError() {
            setTimeout(() => {
              cleanup();
            }, 1500);
          },
        });
      }
    });
  };

  const onPaginate = (page: number) => {
    type Args = typeof isDoctor extends true ? undefined : GetPatientsArgs;
    const options: Options<Args, Response, Error> = isDoctor
      ? {}
      : { args: { pageNumber: page, pageSize: pagination.perPage } };
    getData(options);
  };

  const onPerPageChange = (perPage: number) => {
    type Args = typeof isDoctor extends true ? undefined : GetPatientsArgs;
    const options: Options<Args, Response, Error> = isDoctor
      ? {}
      : { args: { pageNumber: 1, pageSize: perPage } };
    getData(options);
  };

  return (
    <section>
      <ShowIfUserType types={[userTypes.ADMIN]}>
        <Flex mb={4} justifyContent="flex-end">
          <Tooltip label={canAddNewUser ? "" : t("lists.limit")}>
            <Button
              size="sm"
              leftIcon={<BiPlus />}
              disabled={!canAddNewUser}
              onClick={
                canAddNewUser
                  ? () => handleOpenModal({ isEdit: false })
                  : undefined
              }
            >
              {t("patients-list.add-patient")}
            </Button>
          </Tooltip>
        </Flex>
      </ShowIfUserType>

      <DataTable<Patient>
        size="sm"
        columns={columns}
        noPagination={isDoctor}
        data={(data?.items as Patient[]) || []}
        isLoading={isLoading || !called}
        pagination={pagination}
        onPaginate={onPaginate}
        onPerPageChange={onPerPageChange}
      />

      {modalState.isOpen ? (
        <PatientModal
          data={modalState.data}
          onClose={() => setModalState(modalInitState)}
          refetchList={() => {
            type Args = typeof isDoctor extends true
              ? undefined
              : GetPatientsArgs;
            const options: Options<Args, Response, Error> = isDoctor
              ? {}
              : { args: { pageNumber: 1, pageSize: pagination.perPage } };
            getData(options);
          }}
        />
      ) : null}
    </section>
  );
};

export default Patients;
