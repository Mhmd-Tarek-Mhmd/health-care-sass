import React from "react";
import { TranslationKeys } from "@types";
import { MdAttachMoney } from "react-icons/md";
import { FaMoneyBillAlt } from "react-icons/fa";
import { Icon as SVGIcon } from "@chakra-ui/react";

export type Errors = {
  required: TranslationKeys;
  email: TranslationKeys;
  phone: TranslationKeys;
  passwordConfirm: TranslationKeys;
  default: TranslationKeys;
};

export const errors: Errors = {
  required: "validations.required",
  email: "validations.email",
  phone: "validations.phone",
  passwordConfirm: "validations.passwordConfirm",
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
