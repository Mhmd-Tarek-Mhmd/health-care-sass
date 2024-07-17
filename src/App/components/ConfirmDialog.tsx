import React from "react";
import { useTranslation } from "react-i18next";

import {
  Button,
  AlertDialog,
  ChakraProvider,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";

export type ConfirmDialogOptions = {
  title?: string;
  noBody?: boolean;
  cancelText?: string;
  confirmText?: string;
  onCancel: () => void;
  onConfirm: () => void;
  showLoaderOnConfirm?: boolean;
  body?: string | React.ReactNode;
};

const ConfirmDialog: React.FC<ConfirmDialogOptions> = ({
  body,
  title,
  noBody,
  onCancel,
  onConfirm,
  cancelText,
  confirmText,
  showLoaderOnConfirm,
}) => {
  const { t } = useTranslation();
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const [isConfirmLoading, setIsConfirmLoading] = React.useState(false);

  const handleConfirm = () => {
    showLoaderOnConfirm && setIsConfirmLoading(true);
    onConfirm();
  };

  return (
    <ChakraProvider>
      <AlertDialog
        isOpen
        isCentered
        onClose={onCancel}
        leastDestructiveRef={cancelRef}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {t(title || "confirm.default-title")}
            </AlertDialogHeader>

            {noBody ? null : (
              <AlertDialogBody>
                {body
                  ? typeof body === "string"
                    ? t(body)
                    : body
                  : t("confirm.default-body")}
              </AlertDialogBody>
            )}

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={onCancel}
                isDisabled={isConfirmLoading}
              >
                {t(cancelText || "confirm.default-cancelText")}
              </Button>
              <Button
                colorScheme="red"
                marginInlineStart={3}
                onClick={handleConfirm}
                isLoading={isConfirmLoading}
              >
                {t(confirmText || "confirm.default-confirmText")}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </ChakraProvider>
  );
};

export default ConfirmDialog;
