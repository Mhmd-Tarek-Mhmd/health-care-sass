import React from "react";
import { useTranslation } from "react-i18next";
import { useDidUpdateEffect, useServiceRequest } from "@hooks";

import {
  getPatients,
  removePatient,
  GetPatientsArgs,
  RemovePatientArgs,
} from "@services";
import dayjs from "dayjs";
import { checkUserTypes, confirm } from "@helpers";
import { datTimeFormat, paginationInitState, userTypes } from "@constants";
import { AnyObject, Column, PaginatorResponse, Patient } from "@types";

import {
  DataTable,
  PatientModal,
  EditIconButton,
  RemoveIconButton,
} from "@components";
import { ShowIfUserType } from "@hoc";
import { BiPlus } from "react-icons/bi";
import { Button, Flex, Link } from "@chakra-ui/react";

const modalInitState = {
  data: {},
  isOpen: false,
};

const Patients = () => {
  const { t } = useTranslation();

  // Local State
  const [modalState, setModalState] = React.useState(modalInitState);
  const [pagination, setPagination] = React.useState(paginationInitState);

  // Server State
  const [getData, { data, called, isLoading }] = useServiceRequest<
    GetPatientsArgs,
    PaginatorResponse<Patient>
  >(getPatients, {
    isShowErrorToast: true,
    onSuccess(response) {
      setPagination((prev) => ({ ...prev, ...response?.pagination }));
    },
  });
  const [remove] = useServiceRequest<RemovePatientArgs, void>(removePatient);

  // Constants
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
        name: t("patients-list.doctors-cell-label"),
        omit: checkUserTypes([userTypes.DOCTOR]),
        cell: (row) => row?.doctors?.map((doctor) => doctor.name)?.join(", "),
      },
      {
        name: t("patients-list.room-cell-label"),
        cell: (row) => row?.room?.name,
      },
      {
        name: t("patients-list.bed-cell-label"),
        cell: (row) => row?.bed?.name,
      },
      {
        name: t("actions"),
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

  /* ↓ State Effects ↓ */

  useDidUpdateEffect(() => {
    getData({
      args: { pageNumber: pagination.page, pageSize: pagination.perPage },
    });
  }, [pagination.page, pagination.perPage]);

  /* ↓ Helpers ↓ */

  const handleOpenModal = (data: AnyObject = {}) => {
    setModalState({ isOpen: true, data });
  };

  const handleDelete = (patient: Patient) => {
    confirm({ showLoaderOnConfirm: true }).then(({ isConfirmed, cleanup }) => {
      if (isConfirmed) {
        remove({
          args: { id: patient.id },
          onSuccess() {
            getData({
              args: {
                pageNumber: pagination.page,
                pageSize: pagination.perPage,
              },
            });
            cleanup();
          },
        });
      }
    });
  };

  const onPaginate = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const onPerPageChange = (perPage: number) => {
    setPagination((prev) => ({ ...prev, perPage, page: 1 }));
  };

  return (
    <section>
      <ShowIfUserType types={[userTypes.ADMIN]}>
        <Flex mb={4} justifyContent="flex-end">
          <Button
            size="sm"
            leftIcon={<BiPlus />}
            onClick={() => handleOpenModal({ isEdit: false })}
          >
            {t("patients-list.add-patient")}
          </Button>
        </Flex>
      </ShowIfUserType>

      <DataTable<Patient>
        size="sm"
        columns={columns}
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
          refetchList={() =>
            getData({
              args: { pageNumber: 1, pageSize: pagination.perPage },
            })
          }
        />
      ) : null}
    </section>
  );
};

export default Patients;
