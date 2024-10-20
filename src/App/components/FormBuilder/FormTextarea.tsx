import React from "react";
import { useTranslation } from "react-i18next";

import { Textarea, TextareaProps } from "@chakra-ui/react";
import FormControl, { FormControlProps } from "./FormControl";

export interface FormTextareaProps
  extends Omit<FormControlProps, "children">,
    Omit<TextareaProps, "sx" | "prefix"> {}

const FormTextarea = React.forwardRef<HTMLInputElement, FormTextareaProps>(
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
    };

    return (
      <FormControl {...formControlProps}>
        <Textarea
          {...props}
          ref={ref}
          aria-label={inputOnly ? t(label) : undefined}
        />
      </FormControl>
    );
  }
);

export default FormTextarea;
