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
  cell?: (row: T) => JSX.Element | string;
};

interface DataTableProps<T> extends ServerPaginationProps {
  data: T[];
  size: string;
  columns: Column<T>[];
}

const getSelectorOrCell = <T,>(
  row: T,
  col: Column<T>
): string | JSX.Element => {
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
    <TableContainer rounded="md" boxShadow="base" pt={5} pb={3}>
      {isLoading ? (
        <Loader h={200} size="lg" isLoading={isLoading} />
      ) : (
        <Table size={size} mb={10}>
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
                  <Td key={`${col?.name}-cell`}>{getSelectorOrCell(d, col)}</Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      {pagination && (
        <ServerPagination
          sx={{ px: 1 }}
          isLoading={isLoading}
          pagination={pagination}
          onPaginate={props.onPaginate}
          onPerPageChange={props.onPerPageChange}
        />
      )}
    </TableContainer>
  );
};

export default DataTable;
