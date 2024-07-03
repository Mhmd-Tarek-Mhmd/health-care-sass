import { IconType } from "react-icons";
import { To } from "react-router-dom";
export type { Column } from "src/App/components/DataTable";

export interface LinkItemProps {
  to: To;
  label: string;
  icon: IconType;
}

export type AnyObject = {
  [key: string]: any;
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
