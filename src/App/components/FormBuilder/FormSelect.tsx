import React from "react";
import { useTranslation } from "react-i18next";

import {
  Select,
  GroupBase,
  SelectInstance,
  Props as SelectComponentProps,
} from "chakra-react-select";
import { TranslationKeys } from "@types";
import { ChangeHandler } from "react-hook-form";
import FormControl, { FormControlProps } from "./FormControl";

type Option = {
  label: string;
  value: string;
};

interface FormSelectProps
  extends Omit<FormControlProps, "children" | "onChange">,
    Omit<SelectComponentProps, "options" | "onChange"> {
  onChange: ChangeHandler;
  options: string[] | Option[];
  skipOptionsTranslation?: boolean;
}

const FormSelect = React.forwardRef<
  SelectInstance<unknown, boolean, GroupBase<unknown>>,
  FormSelectProps
>(
  (
    {
      options,
      skipOptionsTranslation = false,

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
    },
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
    const formattedOptions: Option[] = options.map((opt) => {
      if (typeof opt === "string") {
        return {
          label: skipOptionsTranslation ? opt : t(opt as TranslationKeys),
          value: opt,
        };
      }
      return {
        label: skipOptionsTranslation
          ? opt.label
          : t(opt.label as TranslationKeys),
        value: opt.value,
      };
    });

    return (
      <FormControl
        {...formControlProps}
        sx={{
          zIndex: 999,
          ".chakra-select-container": { width: "100%" },
          ".chakra-react-select__control": {
            paddingInlineEnd: suffixIcon ? 3.5 : undefined,
            paddingInlineStart: prefixIcon ? 3.5 : undefined,
          },
        }}
      >
        <Select
          {...props}
          ref={ref}
          options={formattedOptions}
          className="chakra-select-container"
          classNamePrefix="chakra-react-select"
          aria-label={inputOnly ? label : undefined}
          value={
            props?.isMulti
              ? formattedOptions.filter((opt) =>
                  (props.value as string[])?.includes?.(opt.value)
                )
              : formattedOptions.find((opt) => opt.value === props.value)
          }
          onChange={(newValue) => {
            const value = props?.isMulti
              ? (newValue as Option[])?.map((val) => val.value)
              : (newValue as Option)?.value;
            props.onChange?.({ target: { name: props.name, value } });
          }}
        />
      </FormControl>
    );
  }
);

export default FormSelect;
