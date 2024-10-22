import React from "react";
import { useTranslation } from "react-i18next";
import { useDidUpdateEffect, useServiceRequest } from "@hooks";

import { confirm } from "@helpers";
import { paginationInitState } from "@constants";
import { AnyObject, Column, PaginatorResponse, Room } from "@types";
import { getRooms, GetRoomsArgs, removeRoom, RemoveRoomArgs } from "@services";

import {
  ShowMore,
  RoomModal,
  DataTable,
  EditIconButton,
  RemoveIconButton,
} from "@components";
import { BiPlus } from "react-icons/bi";
import { Button, Flex } from "@chakra-ui/react";

const modalInitState = {
  data: {},
  isOpen: false,
};

const Rooms = () => {
  const { t } = useTranslation();

  // Local State
  const [modalState, setModalState] = React.useState(modalInitState);
  const [pagination, setPagination] = React.useState(paginationInitState);

  // Server State
  const [getData, { data, called, isLoading }] = useServiceRequest<
    GetRoomsArgs,
    PaginatorResponse<Room>
  >(getRooms, {
    onSuccess(response) {
      setPagination((prev) => ({ ...prev, ...response?.pagination }));
    },
  });
  const [remove] = useServiceRequest<RemoveRoomArgs, void>(removeRoom);

  // Constants
  const columns = React.useMemo<Column<Room>[]>(
    () => [
      { name: t("rooms-list.name-cell-label"), selector: "name" },
      { name: t("rooms-list.floor-cell-label"), selector: "floor" },
      {
        name: t("rooms-list.width-cell-label"),
        cell: (row) => row.width + t("rooms-list.dimensions-unit"),
      },
      {
        name: t("rooms-list.length-cell-label"),
        cell: (row) => row.length + t("rooms-list.dimensions-unit"),
      },
      {
        name: t("rooms-list.beds-cell-label"),
        cell: (row) => row?.beds?.join(", ") as string,
      },
      {
        name: t("rooms-list.details-cell-label"),
        cell: (row) => <ShowMore>{row.details}</ShowMore>,
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

  const handleDelete = (room: Room) => {
    confirm({ showLoaderOnConfirm: true }).then(({ isConfirmed, cleanup }) => {
      if (isConfirmed) {
        remove({
          args: { id: room.id },
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
          {t("rooms-list.add-room")}
        </Button>
      </Flex>

      <DataTable<Room>
        size="sm"
        columns={columns}
        data={(data?.items as Room[]) || []}
        isLoading={isLoading || !called}
        pagination={pagination}
        onPaginate={onPaginate}
        onPerPageChange={onPerPageChange}
      />

      {modalState.isOpen ? (
        <RoomModal
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

export default Rooms;
