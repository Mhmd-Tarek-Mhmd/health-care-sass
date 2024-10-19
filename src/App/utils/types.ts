import { To } from "react-router-dom";
import { IconType } from "react-icons";
import ns from "public/locales/en-US/translation.json";
export type { Column } from "src/App/components/DataTable";
import { DocumentReference, Timestamp } from "firebase/firestore";
export type { Pagination } from "src/App/components/ServerPagination";

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}.${NestedKeyOf<ObjectType[Key]>}` | `${Key}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type TranslationKeys = NestedKeyOf<typeof ns>;

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

export interface Model {
  id: string;
  name: string;
  createdAt: Timestamp;
  updatedAt: Timestamp | null;
}

export type ModelMenu = Pick<Model, "id" | "name">;

export interface Plan extends Model {
  users: number;
  price: number;
  storage: number;
  currency: string;
  isInfiniteUsers: boolean;
}

export interface Hospital extends Model {
  email: string;
  phone: string;
  plan: DocumentReference | string;
}
