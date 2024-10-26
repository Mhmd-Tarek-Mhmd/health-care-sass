import { ReactNode } from "react";
import { UserType } from "@types";
import { useAppStore } from "@store";

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
  const userType = useAppStore((store) => store.auth?.user?.type);

  if (!userType) return (window.location.pathname = "/login");

  return types.includes(userType) ? children : altChildren || null;
};
