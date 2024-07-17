import React from "react";

import { Input, InputProps } from "@chakra-ui/react";
import FormControl, { FormControlProps } from "./FormControl";

interface FormInputProps
  extends Omit<FormControlProps, "children">,
    Omit<InputProps, "sx"> {}

const FormInput = React.forwardRef(
  (
    {
      // Form Control Props
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
    }: FormInputProps,
    ref
  ) => {
    const formControlProps = {
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
          aria-label={inputOnly ? label : undefined}
          ref={ref as React.LegacyRef<HTMLInputElement>}
        />
      </FormControl>
    );
  }
);

export default FormInput;
