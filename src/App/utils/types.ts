import { To } from "react-router-dom";
import { IconType } from "react-icons";
import { userTypes } from "@constants";
import { Timestamp } from "firebase/firestore";
import ns from "public/locales/en-US/translation.json";
export type { Column } from "src/App/components/DataTable";
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

export interface Model {
  id: string;
  name: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export type UserType = (typeof userTypes)[keyof typeof userTypes];

export interface User extends Model {
  type: UserType;
  userTypeID: string;
  email: string;
  phone?: string;
  photoURL?: string;
  isTempPassword: boolean;
  isActive: boolean;
};

export type Auth = {
  token: string | null;
  user: User | null;
};

export type ModelMenu = Pick<Model, "id" | "name">;

export interface Plan extends Model {
  users: number;
  price: number;
  storage: number;
  currency: string;
  isInfiniteUsers: boolean;
}

export interface Hospital extends User {
  plan: Plan;
}

export interface Medicine extends Model {
  createdBy?: User;
  updatedBy?: User;
}

export interface Bed extends Model {
  width: number;
  height: number;
  length: number;
  details?: string;
}

export interface Room extends Model {
  floor: number;
  width: number;
  length: number;
  beds: Bed[];
  details: string;
}

export interface Doctor extends User {
  age: string;
  gender: string;
  specialty: string;
  patients: [] | Patient[];
}

export interface Nurse extends User {
  age: string;
  gender: string;
  doctors: [] | Doctor[];
}

export interface Patient extends User {
  age: string;
  gender: string;
  doctors: [] | Doctor[];
  room?: Room;
  bed?: Bed;
}
