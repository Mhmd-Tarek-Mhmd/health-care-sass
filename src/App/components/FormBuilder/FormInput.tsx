import React from "react";
import { useTranslation } from "react-i18next";

import { Input, InputProps } from "@chakra-ui/react";
import FormControl, { FormControlProps } from "./FormControl";

export interface FormInputProps
  extends Omit<FormControlProps, "children">,
    Omit<InputProps, "sx" | "prefix"> {}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
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
        />
      </FormControl>
    );
  }
);

export default FormInput;
