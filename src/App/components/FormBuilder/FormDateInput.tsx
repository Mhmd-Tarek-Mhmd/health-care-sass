import React from "react";
import { useTranslation } from "react-i18next";

import { Input, InputProps } from "@chakra-ui/react";
import FormControl, { FormControlProps } from "./FormControl";

export interface FormDateInputProps
  extends Omit<FormControlProps, "children">,
    Omit<InputProps, "sx" | "prefix"> {
  timeOnly?: boolean;
  dateTime?: boolean;
}

const FormDateInput = React.forwardRef<HTMLInputElement, FormDateInputProps>(
  (
    {
      // Form Control Props
      sx,
      label,
      helperText,
      error,
      inputOnly,
      isRequired,
      suffix,
      prefix,
      suffixIcon,
      prefixIcon,

      // Input Props
      timeOnly,
      dateTime,
      ...props
    },
    ref
  ) => {
    const { t } = useTranslation();
    const formControlProps = {
      sx,
      label,
      helperText,
      error,
      inputOnly,
      isRequired,
      suffix,
      prefix,
      suffixIcon,
      prefixIcon,
    };

    return (
      <FormControl {...formControlProps}>
        <Input
          {...props}
          ref={ref}
          aria-label={inputOnly ? t(label) : undefined}
          type={dateTime ? "datetime-local" : timeOnly ? "time" : "date"}
        />
      </FormControl>
    );
  }
);

export default FormDateInput;
