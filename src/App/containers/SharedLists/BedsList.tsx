import React from "react";
import { useTranslation } from "react-i18next";
import { useDidUpdateEffect, useServiceRequest } from "@hooks";

import dayjs from "dayjs";
import { checkUserTypes, confirm } from "@helpers";
import { AnyObject, Column, PaginatorResponse, Bed } from "@types";
import { datTimeFormat, paginationInitState, userTypes } from "@constants";
import { getBeds, GetBedsArgs, removeBed, RemoveBedArgs } from "@services";

import {
  ShowMore,
  BedModal,
  DataTable,
  EditIconButton,
  RemoveIconButton,
} from "@components";
import { ShowIfUserType } from "@hoc";
import { BiPlus } from "react-icons/bi";
import { Button, Flex } from "@chakra-ui/react";

const modalInitState = {
  data: {},
  isOpen: false,
};

const Beds = () => {
  const { t } = useTranslation();

  // Local State
  const [modalState, setModalState] = React.useState(modalInitState);
  const [pagination, setPagination] = React.useState(paginationInitState);

  // Server State
  const [getData, { data, called, isLoading }] = useServiceRequest<
    GetBedsArgs,
    PaginatorResponse<Bed>
  >(getBeds, {
    isShowErrorToast: true,
    onSuccess(response) {
      setPagination((prev) => ({ ...prev, ...response?.pagination }));
    },
  });
  const [remove] = useServiceRequest<RemoveBedArgs, void>(removeBed);

  // Constants
  const columns = React.useMemo<Column<Bed>[]>(
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
        name: t("beds-list.width-cell-label"),
        cell: (row) => row.width + t("beds-list.dimensions-unit"),
      },
      {
        name: t("beds-list.length-cell-label"),
        cell: (row) => row.length + t("beds-list.dimensions-unit"),
      },
      {
        name: t("beds-list.height-cell-label"),
        cell: (row) => row.height + t("beds-list.dimensions-unit"),
      },
      {
        name: t("beds-list.details-cell-label"),
        cell: (row) => <ShowMore>{row.details}</ShowMore>,
      },
      {
        name: t("lists.actions-cell-label"),
        omit: !checkUserTypes([userTypes.ADMIN]),
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

  const handleDelete = (bed: Bed) => {
    confirm({ showLoaderOnConfirm: true }).then(({ isConfirmed, cleanup }) => {
      if (isConfirmed) {
        remove({
          args: { id: bed.id },
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
            {t("beds-list.add-bed")}
          </Button>
        </Flex>
      </ShowIfUserType>

      <DataTable<Bed>
        size="sm"
        columns={columns}
        data={(data?.items as Bed[]) || []}
        isLoading={isLoading || !called}
        pagination={pagination}
        onPaginate={onPaginate}
        onPerPageChange={onPerPageChange}
      />

      {modalState.isOpen ? (
        <BedModal
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

export default Beds;
