import React from "react";
import { useServiceRequest } from "@hooks";
import { useTranslation } from "react-i18next";

import {
  getAppointments,
  removeAppointment,
  GetAppointmentsArgs,
  RemoveAppointmentArgs,
} from "@services";
import dayjs from "dayjs";
import { checkUserTypes, confirm } from "@helpers";
import { AnyObject, Column, PaginatorResponse, Appointment } from "@types";
import { datTimeFormat, paginationInitState, userTypes } from "@constants";

import {
  DataTable,
  EditIconButton,
  AppointmentModal,
  RemoveIconButton,
} from "@components";
import { ShowIfUserType } from "@hoc";
import { BiPlus } from "react-icons/bi";
import { Button, Flex } from "@chakra-ui/react";

const modalInitState = {
  data: {},
  isOpen: false,
};

const Appointments = () => {
  const { t } = useTranslation();

  // Local State
  const [modalState, setModalState] = React.useState(modalInitState);
  const [pagination, setPagination] = React.useState(paginationInitState);

  // Server State
  const [remove] = useServiceRequest<RemoveAppointmentArgs, void>(
    removeAppointment
  );
  const [getData, { data, called, isLoading }] = useServiceRequest<
    GetAppointmentsArgs,
    PaginatorResponse<Appointment>
  >(getAppointments, {
    isInitialTrigger: true,
    isShowErrorToast: true,
    args: { pageNumber: pagination.page, pageSize: pagination.perPage },
    onSuccess(response) {
      setPagination((prev) => ({ ...prev, ...response?.pagination }));
    },
  });

  // Constants
  const columns = React.useMemo<Column<Appointment>[]>(
    () => [
      {
        name: t("appointments-list.doctor-cell-label"),
        omit: checkUserTypes([userTypes.DOCTOR]),
        cell: (row) => row?.doctor?.name,
      },
      {
        name: t("appointments-list.from-cell-label"),
        cell: (row) => dayjs.unix(row.from.seconds).format(datTimeFormat),
      },
      {
        name: t("appointments-list.to-cell-label"),
        cell: (row) => dayjs.unix(row.to.seconds).format(datTimeFormat),
      },
      {
        name: t("appointments-list.patients-cell-label"),
        cell: (row) => row?.patients?.map((p) => p?.name)?.join(", "),
      },
      {
        name: t("lists.actions-cell-label"),
        omit: !checkUserTypes([userTypes.ADMIN, userTypes.NURSE]),
        cell: (row) => (
          <>
            <EditIconButton
              size="sm"
              onClick={() => handleOpenModal({ isEdit: true, id: row.id })}
            />
            <RemoveIconButton size="sm" onClick={() => handleDelete(row)} />
          </>
        ),
      },
    ],
    []
  );

  /* ↓ Helpers ↓ */

  const handleOpenModal = (data: AnyObject = {}) => {
    setModalState({ isOpen: true, data });
  };

  const handleDelete = (appointment: Appointment) => {
    confirm({ showLoaderOnConfirm: true }).then(({ isConfirmed, cleanup }) => {
      if (isConfirmed) {
        remove({
          isShowErrorToast: true,
          args: { id: appointment.id },
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
            {t("appointments-list.add-appointment")}
          </Button>
        </Flex>
      </ShowIfUserType>

      <DataTable<Appointment>
        size="sm"
        columns={columns}
        data={(data?.items as Appointment[]) || []}
        isLoading={isLoading || !called}
        pagination={pagination}
        onPaginate={onPaginate}
        onPerPageChange={onPerPageChange}
      />

      {modalState.isOpen ? (
        <AppointmentModal
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

export default Appointments;
