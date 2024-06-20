import React from "react";
import { useTranslation } from "react-i18next";
import {
  useTheme,
  useColorModeValue,
  SystemStyleObject,
} from "@chakra-ui/react";

import {
  Box,
  Flex,
  HStack,
  Button,
  Select,
  Tooltip,
  IconButton,
} from "@chakra-ui/react";
import { CgChevronRight, CgChevronLeft } from "react-icons/cg";

/**
 *
 *  Helpers
 *
 */

let perPageRef: number | undefined;
const generatePerPageOptions = (
  options: number[] = [10, 50, 100],
  perPage: number
) => {
  if (!options.includes(perPage)) perPageRef = perPage;
  return !perPageRef ? options : [...options, perPageRef].sort();
};

/**
 *
 * @param {number} page
 * @param {number} totalPages
 * @param {number} pagesToShowPerSide
 * @returns {number[]} 0 represent rendering no button,
 *                     -1 represents rendering ellipses,
 *                      1 represents rendering a page button
 *
 */
const getRenderedIndexes = (
  page: number,
  totalPages: number,
  pagesToShowPerSide: number = 1
): number[] => {
  return Array(totalPages)
    .fill(0)
    .reduce((acc, _, idx) => {
      // First or Last or Current
      if (idx === 0 || idx + 1 === totalPages || idx + 1 === page) {
        return [...acc, idx + 1];
      }

      // Before Current
      if (idx < page) {
        if (idx + 1 >= Math.abs(page - pagesToShowPerSide)) {
          return [...acc, idx + 1];
        } else {
          if (idx + 1 === Math.abs(page - pagesToShowPerSide - 1))
            return [...acc, -1];
          else return [...acc, 0];
        }
      }

      // After Current
      if (idx < totalPages) {
        if (idx + 1 <= page + pagesToShowPerSide) {
          return [...acc, idx + 1];
        } else {
          if (idx + 1 === page + pagesToShowPerSide + 1) return [...acc, -1];
          else return [...acc, 0];
        }
      }

      return acc;
    }, []);
};

/**
 *
 *  ServerPagination
 *
 */

export type ServerPaginationProps = {
  page: number;
  perPage: number;
  totalPages: number;
  totalCount: number;
  isLoading: boolean;
  sx?: SystemStyleObject;
  perPageOptions?: number[];
  onPaginate: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
};

const ServerPagination = (props: ServerPaginationProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  // Constants
  const isPrevDisabled = props.isLoading || props.page === 1;
  const isNextDisabled = props.isLoading || props.page === props.totalPages;
  const arr = React.useMemo(
    () => getRenderedIndexes(props.page, props.totalPages),
    [props.page, props.totalPages]
  );
  const perPageOptions = React.useMemo(
    () => generatePerPageOptions(props?.perPageOptions, props.perPage),
    [props.perPage]
  );

  return (
    <HStack
      as="nav"
      sx={props.sx}
      justifyContent="space-between"
      aria-label={t("pagination.container-label")}
    >
      {/* Select */}
      {props?.onPerPageChange ? (
        <Flex as="label" gap={2} alignItems="center">
          <Box
            as="span"
            fontSize="xs"
            color={useColorModeValue("gray.600", "gray.300")}
          >
            {t("pagination.per-page-label")}
          </Box>
          <Select
            size="xs"
            value={props.perPage}
            aria-label={t("pagination.per-page-select-label")}
            onChange={(e) => props?.onPerPageChange?.(+e.target.value)}
          >
            {perPageOptions?.map((num) => (
              <option key={num} value={num} className="text-white">
                {num}
              </option>
            ))}
          </Select>
        </Flex>
      ) : null}

      {/* Buttons */}
      <Flex as="ul" gap={3}>
        <li>
          <Tooltip isDisabled={isPrevDisabled} label={t("pagination.prev")}>
            <IconButton
              size="sm"
              variant="ghost"
              borderRadius="50%"
              isDisabled={isPrevDisabled}
              aria-label={t("pagination.prev")}
              onClick={() =>
                !isPrevDisabled && props.onPaginate(props.page - 1)
              }
              icon={
                theme.direction === "rtl" ? (
                  <CgChevronRight />
                ) : (
                  <CgChevronLeft />
                )
              }
            />
          </Tooltip>
        </li>

        {arr.map((val, i) =>
          val === -1 ? (
            <li key={i}>...</li>
          ) : val ? (
            <Button
              key={i}
              size="sm"
              borderRadius="50%"
              opacity="1 !important"
              isDisabled={val === props.page}
              aria-label={t("pagination.select-page", { num: val })}
              colorScheme={val === props.page ? "teal" : undefined}
              onClick={() => val !== props.page && props.onPaginate(val)}
              transition="color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms"
            >
              {val}
            </Button>
          ) : null
        )}

        <li>
          <Tooltip isDisabled={isNextDisabled} label={t("pagination.next")}>
            <IconButton
              size="sm"
              variant="ghost"
              borderRadius="50%"
              isDisabled={isNextDisabled}
              aria-label={t("pagination.next")}
              onClick={() =>
                !isNextDisabled && props.onPaginate(props.page + 1)
              }
              icon={
                theme.direction === "rtl" ? (
                  <CgChevronLeft />
                ) : (
                  <CgChevronRight />
                )
              }
            />
          </Tooltip>
        </li>
      </Flex>
    </HStack>
  );
};

export default ServerPagination;
