import { ReactNode } from "react";
import { useAppStore } from "@store";
import { userTypes } from "@constants";

type UserType = (typeof userTypes)[keyof typeof userTypes];

type ShowIfUserTypeProps = {
  types: UserType[];
  children: ReactNode;
  altChildren?: ReactNode;
};

export const ShowIfUserType = ({
  types,
  children,
  altChildren,
}: ShowIfUserTypeProps) => {
  const userType = useAppStore((store) => store.auth?.user?.type) as UserType;

  if (!userType) return (window.location.pathname = "/login");

  return types.includes(userType) ? children : altChildren || null;
};
