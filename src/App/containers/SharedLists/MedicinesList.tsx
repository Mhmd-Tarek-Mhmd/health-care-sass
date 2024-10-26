import React from "react";
import { useTranslation } from "react-i18next";
import { useDidUpdateEffect, useServiceRequest } from "@hooks";

import {
  getMedicines,
  removeMedicine,
  GetMedicinesArgs,
  RemoveMedicineArgs,
} from "@services";
import dayjs from "dayjs";
import { confirm } from "@helpers";
import { datTimeFormat, paginationInitState } from "@constants";
import { AnyObject, Column, PaginatorResponse, Medicine } from "@types";

import {
  DataTable,
  MedicineModal,
  EditIconButton,
  RemoveIconButton,
} from "@components";
import { BiPlus } from "react-icons/bi";
import { Button, Flex } from "@chakra-ui/react";

const modalInitState = {
  data: {},
  isOpen: false,
};

const Medicines = () => {
  const { t } = useTranslation();

  // Local State
  const [modalState, setModalState] = React.useState(modalInitState);
  const [pagination, setPagination] = React.useState(paginationInitState);

  // Server State
  const [remove] = useServiceRequest<RemoveMedicineArgs, void>(removeMedicine);
  const [getData, { data, called, isLoading }] = useServiceRequest<
    GetMedicinesArgs,
    PaginatorResponse<Medicine>
  >(getMedicines, {
    isShowErrorToast: true,
    onSuccess(response) {
      setPagination((prev) => ({ ...prev, ...response?.pagination }));
    },
  });

  // Constants
  const columns = React.useMemo<Column<Medicine>[]>(
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
        name: t("lists.createdBy-cell-label"),
        cell: (row) =>
          row?.createdBy
            ? row.createdBy?.name + " - " + row.createdBy?.type
            : "",
      },
      {
        name: t("lists.updatedBy-cell-label"),
        cell: (row) =>
          row?.updatedBy
            ? row?.updatedBy?.name + " - " + row?.updatedBy?.type
            : "",
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

  const handleDelete = (medicine: Medicine) => {
    confirm({ showLoaderOnConfirm: true }).then(({ isConfirmed, cleanup }) => {
      if (isConfirmed) {
        remove({
          args: { id: medicine.id },
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
          {t("medicines-list.add-medicine")}
        </Button>
      </Flex>

      <DataTable<Medicine>
        size="sm"
        columns={columns}
        data={(data?.items as Medicine[]) || []}
        isLoading={isLoading || !called}
        pagination={pagination}
        onPaginate={onPaginate}
        onPerPageChange={onPerPageChange}
      />

      {modalState.isOpen ? (
        <MedicineModal
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

export default Medicines;
