import React from "react";
import { useColorModeValue } from "@chakra-ui/react";
import { usePhoneInput } from "react-international-phone";

import {
  CountrySelector,
  UsePhoneInputConfig,
} from "react-international-phone";
import { Button } from "@chakra-ui/react";
import "react-international-phone/style.css";
import { ChangeHandler } from "react-hook-form";
import FormInput, { FormInputProps } from "./FormInput";

interface FormPhoneInputProps extends Omit<FormInputProps, "onChange"> {
  onChange: ChangeHandler;
  phoneInputConfig?: UsePhoneInputConfig;
}

const FormPhoneInput = React.forwardRef<HTMLInputElement, FormPhoneInputProps>(
  ({ phoneInputConfig, ...props }, ref) => {
    const phoneInput = usePhoneInput({
      defaultCountry: "eg",
      value: props?.value as string,
      onChange: (data) => {
        props.onChange?.({ target: { value: data?.inputValue as string } });
      },
      ...phoneInputConfig,
    });

    const formControlProps = {
      suffix: (
        <CountrySelector
          selectedCountry={phoneInput.country.iso2 || ""}
          onSelect={(country) => phoneInput.setCountry(country.iso2)}
          renderButtonWrapper={({ children, rootProps }) => (
            <Button
              {...rootProps}
              w="100%"
              border={0}
              variant="outline"
              borderRadius={0}
            >
              {children}
            </Button>
          )}
        />
      ),
      sx: {
        zIndex: 99,
        ".chakra-input__left-addon": { paddingInline: "0 !important" },
        ".react-international-phone-country-selector-dropdown": {
          color: useColorModeValue("#000", "#fff"),
          backgroundColor: useColorModeValue("#fff", "#2D3748"),
        },
        ".react-international-phone-country-selector-dropdown__list-item:is(:active, :hover, :focus-visible)":
          { color: "#000" },
      },
    };

    return (
      <FormInput
        {...props}
        {...formControlProps}
        ref={ref}
        type="tel"
        value={phoneInput?.inputValue}
        onChange={phoneInput.handlePhoneValueChange}
      />
    );
  }
);

export default FormPhoneInput;
