import React from "react";
import { useTranslation } from "react-i18next";

import { errors, Errors, icons, Icons } from "./constants";

import {
  FormLabel,
  InputGroup,
  FormHelperText,
  InputLeftAddon,
  InputRightAddon,
  FormErrorMessage,
  InputLeftElement,
  InputRightElement,
  SystemStyleObject,
  FormControl as ChakraFormControl,
} from "@chakra-ui/react";

export interface FormControlProps {
  label: string;
  helperText?: string;
  error?: keyof Errors;
  inputOnly?: boolean;
  isRequired?: boolean;
  sx?: SystemStyleObject;
  children: React.ReactNode;
  suffix?: string;
  prefix?: string;
  suffixIcon?: keyof Icons;
  prefixIcon?: keyof Icons;
}
const FormControl = ({
  sx,
  label,
  error,
  children,
  inputOnly,
  isRequired,
  helperText,
  suffix,
  prefix,
  suffixIcon,
  prefixIcon,
}: FormControlProps) => {
  const id = React.useId();
  const { t } = useTranslation();

  /* ↓ Helpers ↓ */

  const renderSuffix = (() => {
    if (suffix)
      return <InputLeftAddon userSelect="none">{suffix}</InputLeftAddon>;
    else if (suffixIcon)
      return (
        <InputLeftElement userSelect="none">
          {icons[suffixIcon]}
        </InputLeftElement>
      );
    else return <></>;
  })();

  const renderPrefix = (() => {
    if (prefix)
      return <InputRightAddon userSelect="none">{prefix}</InputRightAddon>;
    else if (prefixIcon)
      return (
        <InputRightElement userSelect="none">
          {icons[prefixIcon]}
        </InputRightElement>
      );
    else return <></>;
  })();

  return (
    <ChakraFormControl
      id={id}
      isRequired={isRequired}
      isInvalid={Boolean(error)}
    >
      {!inputOnly && (
        <FormLabel color={error ? "red.300" : undefined}>{label}</FormLabel>
      )}
      <InputGroup sx={sx}>
        {renderSuffix}
        {children}
        {renderPrefix}
      </InputGroup>
      {helperText && <FormHelperText>{t(helperText)}</FormHelperText>}
      {error && <FormErrorMessage>{t(errors?.[error])}</FormErrorMessage>}
    </ChakraFormControl>
  );
};

export default FormControl;
