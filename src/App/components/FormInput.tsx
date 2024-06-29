import React from "react";
import { useTranslation } from "react-i18next";

import {
  Input,
  FormLabel,
  InputProps,
  FormControl,
  FormErrorMessage,
} from "@chakra-ui/react";

type Errors = {
  required: string;
  "email": string;
  default: string;
};

const errors: Errors = {
  required: "validations.required",
  "email": "validations.email",
  default: "validations.default",
};

interface FormInputProps extends InputProps {
  label: string;
  error?: keyof Errors | undefined;
  inputOnly?: boolean;
  isRequired?: boolean;
};

const FormInput = React.forwardRef(
  ({ label, error, inputOnly, isRequired, ...props }: FormInputProps, ref) => {
    const id = React.useId();
    const { t } = useTranslation();

    return (
      <FormControl id={id} isRequired={isRequired} isInvalid={Boolean(error)}>
        {!inputOnly && <FormLabel>{label}</FormLabel>}
        <Input
          {...props}
          aria-label={inputOnly ? label : undefined}
          ref={ref as React.LegacyRef<HTMLInputElement>}
        />
        {error && <FormErrorMessage>{t(errors?.[error])}</FormErrorMessage>}
      </FormControl>
    );
  }
);

export default FormInput;
