import i18next from "i18next";
import ReactDOM from "react-dom/client";
import { ConfirmDialog, ConfirmDialogOptions } from "@components";
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
 * Start of `confirm`
 *
 */

export const confirm = (
  options: Omit<ConfirmDialogOptions, "onConfirm" | "onCancel">
): Promise<{ isConfirmed: boolean; cleanup: VoidFunction }> => {
  return new Promise((resolve) => {
    const cleanup = () => {
      if (root) {
        root.unmount();
      }
    };

    const handleConfirm = () => {
      !options?.showLoaderOnConfirm && cleanup();
      resolve({ isConfirmed: true, cleanup });
    };

    const handleCancel = () => {
      cleanup();
      resolve({ isConfirmed: false, cleanup });
    };

    const container = document.getElementById("dialog-root")!;
    const root = ReactDOM.createRoot(container);
    root.render(
      <ConfirmDialog
        {...options}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    );
  });
};

/**
 *
 * End of `confirm`
 *
 */
