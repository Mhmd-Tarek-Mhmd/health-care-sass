import React from "react";
import { useTranslation } from "react-i18next";

import { TranslationKeys } from "@types";
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
  label: TranslationKeys;
  helperText?: TranslationKeys;
  error?: keyof Errors;
  inputOnly?: boolean;
  isRequired?: boolean;
  sx?: SystemStyleObject;
  children: React.ReactNode;
  suffix?: React.ReactNode;
  prefix?: React.ReactNode;
  suffixIcon?: keyof Icons;
  prefixIcon?: keyof Icons;
  suffixElement?: React.ReactNode;
  prefixElement?: React.ReactNode;
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
  suffixElement,
  prefixElement,
}: FormControlProps) => {
  const id = React.useId();
  const { t } = useTranslation();

  /* ↓ Helpers ↓ */

  const renderSuffix = (() => {
    if (suffix)
      return <InputRightAddon userSelect="none">{suffix}</InputRightAddon>;
    else if (suffixIcon)
      return (
        <InputRightElement pointerEvents="none">
          {icons[suffixIcon]}
        </InputRightElement>
      );
    else if (suffixElement)
      return (
        <InputRightElement pointerEvents="none">
          {suffixElement}
        </InputRightElement>
      );
    else return <></>;
  })();

  const renderPrefix = (() => {
    if (prefix)
      return <InputLeftAddon userSelect="none">{prefix}</InputLeftAddon>;
    else if (prefixIcon)
      return (
        <InputLeftElement pointerEvents="none">
          {icons[prefixIcon]}
        </InputLeftElement>
      );
    else if (prefixElement)
      return (
        <InputLeftElement pointerEvents="none">
          {prefixElement}
        </InputLeftElement>
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
        <FormLabel color={error ? "red.300" : undefined}>{t(label)}</FormLabel>
      )}
      <InputGroup sx={sx}>
        {renderPrefix}
        {children}
        {renderSuffix}
      </InputGroup>
      {helperText && <FormHelperText>{t(helperText)}</FormHelperText>}
      {error && <FormErrorMessage>{t(errors?.[error])}</FormErrorMessage>}
    </ChakraFormControl>
  );
};

export default FormControl;
