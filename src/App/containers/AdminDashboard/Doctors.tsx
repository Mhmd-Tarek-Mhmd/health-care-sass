import React from "react";
import { useTranslation } from "react-i18next";
import { useDidUpdateEffect, useServiceRequest } from "@hooks";

import {
  getDoctors,
  removeDoctor,
  GetDoctorsArgs,
  RemoveDoctorArgs,
} from "@services";
import dayjs from "dayjs";
import { confirm } from "@helpers";
import { datTimeFormat, paginationInitState } from "@constants";
import { AnyObject, Column, PaginatorResponse, Doctor } from "@types";

import {
  DataTable,
  DoctorModal,
  EditIconButton,
  RemoveIconButton,
} from "@components";
import { BiPlus } from "react-icons/bi";
import { Button, Flex, Link } from "@chakra-ui/react";

const modalInitState = {
  data: {},
  isOpen: false,
};

const Doctors = () => {
  const { t } = useTranslation();

  // Local State
  const [modalState, setModalState] = React.useState(modalInitState);
  const [pagination, setPagination] = React.useState(paginationInitState);

  // Server State
  const [getData, { data, called, isLoading }] = useServiceRequest<
    GetDoctorsArgs,
    PaginatorResponse<Doctor>
  >(getDoctors, {
    onSuccess(response) {
      setPagination((prev) => ({ ...prev, ...response?.pagination }));
    },
  });
  const [remove] = useServiceRequest<RemoveDoctorArgs, void>(removeDoctor);

  // Constants
  const columns = React.useMemo<Column<Doctor>[]>(
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
      { name: t("doctors-list.specialty-cell-label"), selector: "specialty" },
      {
        name: t("lists.email-cell-label"),
        cell: (row) => <Link href={`mailto:${row?.email}`}>{row?.email}</Link>,
      },
      {
        name: t("lists.phone-cell-label"),
        cell: (row) => <Link href={`tel:${row?.phone}`}>{row?.phone}</Link>,
      },
      {
        name: t("doctors-list.patients-cell-label"),
        cell: (row) =>
          row?.patients?.map((patient) => patient.name)?.join(", "),
      },
      {
        name: t("actions"),
        cell: (row) => (
          <Flex columnGap={1}>
            <EditIconButton
              size="sm"
              onClick={() => handleOpenModal({ isEdit: true, id: row.id })}
            />
            <RemoveIconButton size="sm" onClick={() => handleDelete(row)} />
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

  const handleDelete = (doctor: Doctor) => {
    confirm({ showLoaderOnConfirm: true }).then(({ isConfirmed, cleanup }) => {
      if (isConfirmed) {
        remove({
          args: { id: doctor.id },
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
      <Flex mb={4} justifyContent="flex-end">
        <Button
          size="sm"
          leftIcon={<BiPlus />}
          onClick={() => handleOpenModal({ isEdit: false })}
        >
          {t("doctors-list.add-doctor")}
        </Button>
      </Flex>

      <DataTable<Doctor>
        size="sm"
        columns={columns}
        data={(data?.items as Doctor[]) || []}
        isLoading={isLoading || !called}
        pagination={pagination}
        onPaginate={onPaginate}
        onPerPageChange={onPerPageChange}
      />

      {modalState.isOpen ? (
        <DoctorModal
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

export default Doctors;
