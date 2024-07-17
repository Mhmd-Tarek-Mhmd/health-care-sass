import React from "react";
import { MdAttachMoney } from "react-icons/md";
import { FaMoneyBillAlt } from "react-icons/fa";
import { Icon as SVGIcon } from "@chakra-ui/react";

export type Errors = {
  required: string;
  email: string;
  default: string;
};

export const errors: Errors = {
  required: "validations.required",
  email: "validations.email",
  default: "validations.default",
};

export type Icon = React.ReactNode;

export interface Icons {
  money: Icon;
  dollar: Icon;
}

export const icons: Icons = {
  money: <SVGIcon as={FaMoneyBillAlt} color="gray.300" />,
  dollar: <SVGIcon as={MdAttachMoney} color="gray.300" />,
};
