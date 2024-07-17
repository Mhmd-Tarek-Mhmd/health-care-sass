import { useTranslation } from "react-i18next";

import {
  Path,
  Control,
  Controller,
  FieldValues,
  RegisterOptions,
} from "react-hook-form";
import FormControl, { FormControlProps } from "./FormControl";
import { Radio, RadioGroup, Stack, StackDirection } from "@chakra-ui/react";

type Option = { value: string; label: string };

interface FormRadioGroupProps<T extends FieldValues>
  extends Omit<
    FormControlProps,
    "children" | "suffix" | "prefix" | "suffixIcon" | "prefixIcon"
  > {
  options: [] | string[] | Option[];

  // Controller Props
  name: Path<T>;
  control: Control<T>;
  rules?: Omit<
    RegisterOptions<T>,
    "disabled" | "setValueAs" | "valueAsNumber" | "valueAsDate"
  >;

  // Styling Props
  spacing?: number;
  direction?: StackDirection;
}

const FormRadioGroup = <T extends FieldValues>({
  options,

  // Controller Props
  name,
  rules,
  control,

  // Form Control Props
  label,
  helperText,
  error,
  inputOnly,
  isRequired,

  // Styling Props
  spacing = 3,
  direction = "row",
}: FormRadioGroupProps<T>) => {
  const { t } = useTranslation();

  const formControlProps = {
    label,
    helperText,
    error,
    inputOnly,
    isRequired,
  };
  const renderOptions = (() =>
    options.map((opt) => {
      let value: string | number = "",
        label = "";

      if (typeof opt === "string") (value = opt), (label = opt);
      else if ("value" in opt) (value = opt.value), (label = opt.label);

      return (
        <Radio key={value} value={value}>
          {t(label)}
        </Radio>
      );
    }))();

  return (
    <FormControl {...formControlProps}>
      <Controller
        name={name}
        rules={rules}
        control={control}
        render={({ field }) => (
          <RadioGroup {...field}>
            <Stack spacing={spacing} direction={direction}>
              {renderOptions}
            </Stack>
          </RadioGroup>
        )}
      />
    </FormControl>
  );
};

export default FormRadioGroup;
