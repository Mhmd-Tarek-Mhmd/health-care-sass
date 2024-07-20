import React from "react";
import { useTranslation } from "react-i18next";
import { useDidUpdateEffect, useServiceRequest } from "@hooks";

import dayjs from "dayjs";
import { confirm } from "@helpers";
import { datTimeFormat, paginationInitState } from "@constants";
import { AnyObject, Column, PaginatorResponse, Plan } from "@types";
import { getPlans, GetPlansArgs, removePlan, RemovePlanArgs } from "@services";

import {
  DataTable,
  PlanModal,
  EditIconButton,
  RemoveIconButton,
} from "@components";
import { BiPlus } from "react-icons/bi";
import { Button, Flex } from "@chakra-ui/react";

const modalInitState = {
  data: {},
  isOpen: false,
};

const Plans = () => {
  const { t } = useTranslation();

  // Local State
  const [modalState, setModalState] = React.useState(modalInitState);
  const [pagination, setPagination] = React.useState(paginationInitState);

  // Server State
  const [getData, { data, called, isLoading }] = useServiceRequest<
    GetPlansArgs,
    PaginatorResponse<Plan>
  >(getPlans, {
    onSuccess(response) {
      setPagination((prev) => ({ ...prev, ...response?.pagination }));
    },
  });
  const [remove] = useServiceRequest<RemovePlanArgs, void>(removePlan);

  // Constants
  const columns = React.useMemo<Column<Plan>[]>(
    () => [
      { name: t("plans-list.name-cell-label"), selector: "name" },
      {
        name: t("plans-list.createdAt-cell-label"),
        cell: (row) => dayjs.unix(row.createdAt.seconds).format(datTimeFormat),
      },
      {
        name: t("plans-list.users-cell-label"),
        cell: (row) => row?.users || t("plans-list.Infinity"),
      },
      {
        name: t("plans-list.storage-cell-label"),
        cell: (row) => row?.storage + " " + "MB",
      },
      {
        name: t("plans-list.price-cell-label"),
        cell: (row) => row?.price + " " + row?.currency,
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

  const handleDelete = (plan: Plan) => {
    confirm({ showLoaderOnConfirm: true }).then(({ isConfirmed, cleanup }) => {
      if (isConfirmed) {
        remove({
          args: { id: plan.id },
          onSuccess() {
            getData({
              args: { pageNumber: pagination.page, pageSize: pagination.perPage },
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
          {t("plans-list.add-plan")}
        </Button>
      </Flex>

      <DataTable<Plan>
        size="sm"
        columns={columns}
        data={(data?.items as Plan[]) || []}
        isLoading={isLoading || !called}
        pagination={pagination}
        onPaginate={onPaginate}
        onPerPageChange={onPerPageChange}
      />

      {modalState.isOpen ? (
        <PlanModal
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

export default Plans;
