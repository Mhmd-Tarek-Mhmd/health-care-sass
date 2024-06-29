import i18next from "i18next";
import { createStandaloneToast, UseToastOptions } from "@chakra-ui/react";

/**
 *
 * Start of `showToast`
 *
 */

export const showToast = (options: UseToastOptions = {}) => {
  const { toast } = createStandaloneToast();
  const defaultTitles = {
    success: "toast.default-success-title",
    error: "toast.default-error-title",
    info: "toast.default-info-title",
    warning: "toast.default-warning-title",
    loading: "toast.default-loading-title",
  };
  const defaultDesc = {
    success: "toast.default-success-desc",
    error: "toast.default-error-desc",
    info: "toast.default-info-desc",
    warning: "toast.default-warning-desc",
    loading: "toast.default-loading-desc",
  };

  toast({
    isClosable: true,
    ...(options?.status && {
      title: i18next.t(defaultTitles[options?.status]),
      description: i18next.t(defaultDesc[options?.status]),
    }),
    ...options,
  });
};

/**
 *
 * End of `showToast`
 *
 * Start of ``
 *
 */
