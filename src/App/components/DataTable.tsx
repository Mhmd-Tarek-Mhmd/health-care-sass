import { AnyObject } from "@types";
import { ServerPaginationProps } from "./ServerPagination";

import {
  Tr,
  Th,
  Td,
  Flex,
  Table,
  Thead,
  Tbody,
  Spinner,
  TableContainer,
} from "@chakra-ui/react";
import ServerPagination from "./ServerPagination";

type Column = {
  name?: string;
  selector?: string;
  cell?: (row: AnyObject) => JSX.Element | string;
};

interface DataTableProps {
  size: string;
  columns: Column[];
  isLoading: boolean;
  data: Array<AnyObject>;
  pagination?: ServerPaginationProps;
}

const getSelectorOrCell = (row: AnyObject, col: Column) => {
  if (col?.cell) return col?.cell(row);
  if (col?.selector && row?.[col?.selector]) return row?.[col?.selector];
  return "";
};

const DataTable = ({
  data,
  size,
  columns,
  isLoading,
  pagination,
}: DataTableProps) => {
  return (
    <TableContainer rounded="md" boxShadow="base" pt={5} pb={3}>
      {isLoading ? (
        <Flex h={300} alignItems="center" justifyContent="center">
          <Spinner
            size="xl"
            speed="0.65s"
            thickness="4px"
            color="teal.500"
            emptyColor="gray.200"
          />
        </Flex>
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

      {pagination && <ServerPagination {...pagination} sx={{ px: 1 }} />}
    </TableContainer>
  );
};

export default DataTable;
