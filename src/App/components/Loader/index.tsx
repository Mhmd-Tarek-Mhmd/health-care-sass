import styles from "./loader.module.css";
import { useTranslation } from "react-i18next";
import { Box, Spinner, VisuallyHidden } from "@chakra-ui/react";

interface LoaderProps {
  h?: number;
  size?: string;
  fixed?: boolean;
  absolute?: boolean;
  isLoading: boolean;
}

const Loader = ({ h, size, isLoading, fixed, absolute }: LoaderProps) => {
  const { t } = useTranslation();

  const classes = fixed ? styles.fixed : absolute ? styles.absolute : "";

  return isLoading ? (
    <Box
      sx={{ h }}
      role="alert"
      aria-live="assertive"
      className={`${styles.loader} ${classes}`.trim()}
    >
      <VisuallyHidden>{t("feedback.loader-label")}</VisuallyHidden>
      <Spinner size={size || "xl"} />
    </Box>
  ) : null;
};

export default Loader;
