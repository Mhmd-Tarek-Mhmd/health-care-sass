import { useTranslation } from "react-i18next";

import ServerPagination, { ServerPaginationProps } from "./ServerPagination";

import {
  Tr,
  Th,
  Td,
  Flex,
  Table,
  Thead,
  Tbody,
  TableContainer,
} from "@chakra-ui/react";
import Loader from "./Loader";

export type Column<T> = {
  name?: string;
  selector?: keyof T;
  cell?: (row: T) => React.ReactNode;
};

interface DataTableProps<T> extends ServerPaginationProps {
  data: T[];
  size: string;
  columns: Column<T>[];
}

const getSelectorOrCell = <T,>(row: T, col: Column<T>): React.ReactNode => {
  if (col?.cell) return col?.cell(row) as JSX.Element;
  if (col?.selector && row?.[col?.selector])
    return row?.[col?.selector] as string;
  return "";
};

const DataTable = <T,>({
  data,
  size,
  columns,
  isLoading,
  pagination,
  ...props
}: DataTableProps<T>) => {
  const { t } = useTranslation();

  if (!data.length && !isLoading) {
    return (
      <Flex h="full" maxH={300} alignItems="center" justifyContent="center">
        <p role="alert">{t("dataTable.nodata")}</p>
      </Flex>
    );
  }

  return (
    <>
      <TableContainer pt={5} pb={3} mb={5} rounded="md" boxShadow="base">
        {isLoading ? (
          <Loader h={200} size="lg" isLoading={isLoading} />
        ) : (
          <Table size={size}>
            <Thead>
              <Tr>
                {columns?.map((col) => (
                  <Th key={`${col?.name}-head`}>{col?.name}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {data?.map((d, i) => (
                <Tr key={`row-${i}`}>
                  {columns?.map((col) => (
                    <Td key={`${col?.name}-cell`}>
                      {getSelectorOrCell(d, col)}
                    </Td>
                  ))}
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </TableContainer>

      {pagination && (
        <ServerPagination
          sx={{ px: 1 }}
          isLoading={isLoading}
          pagination={pagination}
          onPaginate={props.onPaginate}
          onPerPageChange={props.onPerPageChange}
        />
      )}
    </>
  );
};

export default DataTable;
