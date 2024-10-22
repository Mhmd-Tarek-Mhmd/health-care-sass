import React from "react";
import { useTranslation } from "react-i18next";
import { useDidUpdateEffect, useServiceRequest } from "@hooks";

import {
  getHospitals,
  removeHospital,
  GetHospitalsArgs,
  RemoveHospitalArgs,
} from "@services";
import dayjs from "dayjs";
import { confirm } from "@helpers";
import { datTimeFormat, paginationInitState } from "@constants";
import { AnyObject, Column, PaginatorResponse, Hospital } from "@types";

import {
  DataTable,
  HospitalModal,
  EditIconButton,
  RemoveIconButton,
} from "@components";
import { BiPlus } from "react-icons/bi";
import { Button, Flex, Link } from "@chakra-ui/react";

const modalInitState = {
  data: {},
  isOpen: false,
};

const Hospitals = () => {
  const { t } = useTranslation();

  // Local State
  const [modalState, setModalState] = React.useState(modalInitState);
  const [pagination, setPagination] = React.useState(paginationInitState);

  // Server State
  const [getData, { data, called, isLoading }] = useServiceRequest<
    GetHospitalsArgs,
    PaginatorResponse<Hospital>
  >(getHospitals, {
    isShowErrorToast: true,
    onSuccess(response) {
      setPagination((prev) => ({ ...prev, ...response?.pagination }));
    },
  });
  const [remove] = useServiceRequest<RemoveHospitalArgs, void>(removeHospital);

  // Constants
  const columns = React.useMemo<Column<Hospital>[]>(
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
      {
        name: t("hospitals-list.plan-cell-label"),
        cell: (row) => row?.plan as string,
      },
      {
        name: t("hospitals-list.email-cell-label"),
        cell: (row) => <Link href={`mailto:${row?.email}`}>{row?.email}</Link>,
      },
      {
        name: t("hospitals-list.phone-cell-label"),
        cell: (row) => <Link href={`tel:${row?.phone}`}>{row?.phone}</Link>,
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

  const handleDelete = (hospital: Hospital) => {
    confirm({ showLoaderOnConfirm: true }).then(({ isConfirmed, cleanup }) => {
      if (isConfirmed) {
        remove({
          args: { id: hospital.id },
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
          {t("hospitals-list.add-hospital")}
        </Button>
      </Flex>

      <DataTable<Hospital>
        size="sm"
        columns={columns}
        data={(data?.items as Hospital[]) || []}
        isLoading={isLoading || !called}
        pagination={pagination}
        onPaginate={onPaginate}
        onPerPageChange={onPerPageChange}
      />

      {modalState.isOpen ? (
        <HospitalModal
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

export default Hospitals;
