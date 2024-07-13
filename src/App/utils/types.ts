import { To } from "react-router-dom";
import { IconType } from "react-icons";
export type { Column } from "src/App/components/DataTable";
export type { Pagination } from "src/App/components/ServerPagination";

export interface LinkItemProps {
  to: To;
  label: string;
  icon: IconType;
}

export type AnyObject = {
  [key: string]: any;
};

export interface PaginationBase {
  page: number;
  perPage: number;
  totalPages: number;
  totalCount: number;
}

export type PaginatorResponse<T> = {
  items: T[];
  pagination: PaginationBase;
};

export type User = {
  id: string;
  type: string;
  displayName: string;
  firstName: string;
  lastName: string;
  photoURL: string;
};

export type Auth = {
  token: string | null;
  user: User | null;
};
