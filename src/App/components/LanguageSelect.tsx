import React from "react";
import i18n from "../../i18n";
import { useTranslation } from "react-i18next";
import { DarkMode, Select } from "@chakra-ui/react";

const lngs = [
  { label: "English", value: "en-US" },
  { label: "عربي", value: "ar-EG" },
];

const LanguageSelect = () => {
  const { t } = useTranslation();

  const handleChange = (e: React.BaseSyntheticEvent) => {
    i18n.changeLanguage(e.target.value);
    window.location.reload();
  };

  React.useEffect(() => {
    window.document.documentElement.lang = i18n.language;
    window.document.documentElement.dir = i18n.language.includes("ar")
      ? "rtl"
      : "ltr";
  }, [i18n.language]);

  return (
    <DarkMode>
      <Select
        width={100}
        value={i18n.language}
        onChange={handleChange}
        aria-label={t("language-select-label")}
      >
        {lngs.map((lng) => (
          <option key={lng.value} value={lng.value} className="text-white">
            {lng.label}
          </option>
        ))}
      </Select>
    </DarkMode>
  );
};

export default LanguageSelect;
