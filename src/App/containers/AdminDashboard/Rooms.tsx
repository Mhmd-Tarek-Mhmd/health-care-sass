import React from "react";
import { useServiceRequest } from "@hooks";
import { useTranslation } from "react-i18next";

import dayjs from "dayjs";
import { confirm } from "@helpers";
import { datTimeFormat, paginationInitState } from "@constants";
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
    isInitialTrigger: true,
    isShowErrorToast: true,
    args: { pageNumber: pagination.page, pageSize: pagination.perPage },
    onSuccess(response) {
      setPagination((prev) => ({ ...prev, ...response?.pagination }));
    },
  });
  const [remove] = useServiceRequest<RemoveRoomArgs, void>(removeRoom);

  // Constants
  const columns = React.useMemo<Column<Room>[]>(
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
        cell: (row) => row?.beds?.map((bed) => bed.name)?.join(", "),
      },
      {
        name: t("rooms-list.details-cell-label"),
        cell: (row) => <ShowMore>{row.details}</ShowMore>,
        wrap: true,
      },
      {
        name: t("lists.actions-cell-label"),
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

  /* ↓ Helpers ↓ */

  const handleOpenModal = (data: AnyObject = {}) => {
    setModalState({ isOpen: true, data });
  };

  const handleDelete = (room: Room) => {
    confirm({ showLoaderOnConfirm: true }).then(({ isConfirmed, cleanup }) => {
      if (isConfirmed) {
        remove({
          isShowErrorToast: true,
          args: { id: room.id },
          onSuccess() {
            getData();
            cleanup();
          },
          onError() {
            setTimeout(() => {
              cleanup();
            }, 500);
          },
        });
      }
    });
  };

  const onPaginate = (page: number) => {
    getData({ args: { pageNumber: page, pageSize: pagination.perPage } });
  };

  const onPerPageChange = (perPage: number) => {
    getData({ args: { pageNumber: 1, pageSize: perPage } });
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
