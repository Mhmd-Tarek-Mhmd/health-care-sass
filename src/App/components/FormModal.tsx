import React from "react";
import { useTranslation } from "react-i18next";

import { TranslationKeys } from "@types";

import {
  Modal,
  Button,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalContent,
  ModalOverlay,
  ModalCloseButton,
} from "@chakra-ui/react";

type FormModalProps = {
  title: TranslationKeys;
  isOpen: boolean;
  isLoading?: boolean;
  onSave: VoidFunction;
  onClose: VoidFunction;
  children: React.ReactNode;

  saveText?: TranslationKeys;
  cancelText?: TranslationKeys;
  footer?: React.ReactNode;
};

const FormModal = ({
  title,
  isOpen,
  onSave,
  onClose,
  children,
  isLoading,
  saveText,
  cancelText,
  footer,
}: FormModalProps) => {
  const { t } = useTranslation();

  return (
    <Modal
      isCentered
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={false}
    >
      <ModalOverlay />
      <ModalContent as="form" noValidate onSubmit={onSave}>
        <ModalHeader as="h1" textTransform="capitalize">
          {t(title)}
        </ModalHeader>

        <ModalCloseButton mt={2} />

        <ModalBody as="fieldset" pb={6}>
          {children}
        </ModalBody>

        <ModalFooter sx={{ display: "flex", columnGap: 3 }}>
          {footer || (
            <>
              <Button onClick={onClose} isDisabled={isLoading}>
                {t(cancelText || "form-modal.cancel-label-default")}
              </Button>
              <Button type="submit" colorScheme="blue" isLoading={isLoading}>
                {t(saveText || "form-modal.save-label-default")}
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default FormModal;
