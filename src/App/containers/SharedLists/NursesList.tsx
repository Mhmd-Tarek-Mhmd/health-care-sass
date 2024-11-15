import React from "react";
import { useServiceRequest } from "@hooks";
import { useTranslation } from "react-i18next";

import {
  getNurses,
  removeNurse,
  GetNursesArgs,
  RemoveNurseArgs,
  toggleNurseStatus,
  ToggleNurseStatusArgs,
} from "@services";
import dayjs from "dayjs";
import { checkUserTypes, confirm } from "@helpers";
import { AnyObject, Column, PaginatorResponse, Nurse } from "@types";
import { datTimeFormat, paginationInitState, userTypes } from "@constants";

import {
  DataTable,
  NurseModal,
  EditIconButton,
  RemoveIconButton,
  ActivateIconButton,
  InactivateIconButton,
} from "@components";
import { ShowIfUserType } from "@hoc";
import { BiPlus } from "react-icons/bi";
import { Button, Flex, Link } from "@chakra-ui/react";

const modalInitState = {
  data: {},
  isOpen: false,
};

const Nurses = () => {
  const { t } = useTranslation();

  // Local State
  const [modalState, setModalState] = React.useState(modalInitState);
  const [pagination, setPagination] = React.useState(paginationInitState);

  // Server State
  const [getData, { data, called, isLoading }] = useServiceRequest<
    GetNursesArgs,
    PaginatorResponse<Nurse>
  >(getNurses, {
    isInitialTrigger: true,
    isShowErrorToast: true,
    args: { pageNumber: pagination.page, pageSize: pagination.perPage },
    onSuccess(response) {
      setPagination((prev) => ({ ...prev, ...response?.pagination }));
    },
  });
  const [remove] = useServiceRequest<RemoveNurseArgs, void>(removeNurse);
  const [toggleStatus] = useServiceRequest<ToggleNurseStatusArgs, void>(
    toggleNurseStatus
  );

  // Constants
  const columns = React.useMemo<Column<Nurse>[]>(
    () => [
      { name: t("lists.name-cell-label"), selector: "name" },
      {
        name: t("lists.status-cell-label"),
        cell: (row) =>
          t(
            row?.isActive
              ? "lists.active-status-cell-label"
              : "lists.inactive-status-cell-label"
          ),
      },
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
        name: t("nurses-list.doctors-cell-label"),
        omit: checkUserTypes([userTypes.DOCTOR]),
        cell: (row) => row?.doctors?.map((doctor) => doctor.name)?.join(", "),
      },
      {
        name: t("lists.actions-cell-label"),
        omit: checkUserTypes([userTypes.DOCTOR]),
        cell: (row) => (
          <Flex columnGap={1}>
            <ShowIfUserType types={[userTypes.ADMIN]}>
              {row?.isActive ? (
                <InactivateIconButton
                  size="sm"
                  onClick={() => handleToggleStatus(row)}
                />
              ) : (
                <ActivateIconButton
                  size="sm"
                  onClick={() => handleToggleStatus(row)}
                />
              )}
            </ShowIfUserType>
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

  const handleToggleStatus = (nurse: Nurse) => {
    confirm({ showLoaderOnConfirm: true }).then(({ isConfirmed, cleanup }) => {
      if (isConfirmed) {
        toggleStatus({
          isShowErrorToast: true,
          args: { id: nurse.id },
          onSuccess() {
            getData({
              args: {
                pageNumber: pagination.page,
                pageSize: pagination.perPage,
              },
            });
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

  const handleDelete = (nurse: Nurse) => {
    confirm({ showLoaderOnConfirm: true }).then(({ isConfirmed, cleanup }) => {
      if (isConfirmed) {
        remove({
          isShowErrorToast: true,
          args: { id: nurse.id },
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
    getData({ args: { pageNumber: page, pageSize: pagination.perPage } });
  };

  const onPerPageChange = (perPage: number) => {
    getData({ args: { pageNumber: 1, pageSize: perPage } });
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
            {t("nurses-list.add-nurse")}
          </Button>
        </Flex>
      </ShowIfUserType>

      <DataTable<Nurse>
        size="sm"
        columns={columns}
        data={(data?.items as Nurse[]) || []}
        isLoading={isLoading || !called}
        pagination={pagination}
        onPaginate={onPaginate}
        onPerPageChange={onPerPageChange}
      />

      {modalState.isOpen ? (
        <NurseModal
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

export default Nurses;
