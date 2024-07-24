import React from "react";
import { useTranslation } from "react-i18next";

import { TranslationKeys } from "@types";
import { Select, SelectProps } from "@chakra-ui/react";
import FormControl, { FormControlProps } from "./FormControl";

type Option = { value: string | number; label: TranslationKeys };

interface FormSelectProps
  extends Omit<FormControlProps, "children">,
    Omit<SelectProps, "sx"> {
  options: [] | string[] | Option[];
}

const FormSelect = React.forwardRef(
  (
    {
      options,

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

      // Select Props
      ...props
    }: FormSelectProps,
    ref
  ) => {
    const { t } = useTranslation();
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
    const renderOptions = (() =>
      options.map((opt) => {
        let value: string | number = "",
          label: TranslationKeys | string = "";

        if (typeof opt === "string") (value = opt), (label = opt);
        else if ("value" in opt) (value = opt.value), (label = opt.label);

        return (
          <option key={value} value={value}>
            {t(label as TranslationKeys)}
          </option>
        );
      }))();

    return (
      <FormControl
        {...formControlProps}
        sx={{
          select: {
            paddingInlineEnd: prefixIcon ? "2rem" : undefined,
            paddingInlineStart: suffixIcon ? "2rem" : undefined,
          },
        }}
      >
        <Select {...props} ref={ref} aria-label={inputOnly ? label : undefined}>
          {renderOptions}
        </Select>
      </FormControl>
    );
  }
);

export default FormSelect;
