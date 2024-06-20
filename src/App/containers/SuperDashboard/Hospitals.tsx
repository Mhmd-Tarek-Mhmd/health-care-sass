import React from "react";

import { getHospitals } from "../../services";

import { DataTable } from "../../components";

type Hospital = {
  id: string;
  title: string;
  body: string;
  userId: string;
};

const paginationInitState = {
  page: 5,
  perPage: 1,
  totalCount: 10,
};

const Hospitals = () => {
  const [data, setData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [pagination, setPagination] = React.useState(paginationInitState);

  const columns = React.useMemo(
    () => [
      { name: "id", selector: "id" },
      { name: "name", cell: (row) => row?.first_name + " " + row?.last_name },
      { name: "email", selector: "email" },
    ],
    []
  );

  React.useEffect(() => {
    setIsLoading((_) => true);
    (async () => {
      const res = await getHospitals(pagination.page, pagination.perPage);
      setData(res?.data || []);
      setPagination((prev) => ({
        ...prev,
        page: res?.page,
        totalCount: res?.total,
        perPage: res?.per_page,
        totalPages: res?.total_pages,
      }));
      setIsLoading((_) => false);
    })();
  }, [pagination.page, pagination.perPage]);

  const onPaginate = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const onPerPageChange = (perPage: number) => {
    setPagination((prev) => ({ ...prev, perPage, page: 1 }));
  };

  return (
    <DataTable
      size="sm"
      data={data}
      columns={columns}
      isLoading={isLoading}
      pagination={{
        ...pagination,
        isLoading,
        onPaginate,
        onPerPageChange,
      }}
    />
  );
};

export default Hospitals;
