import { useTranslation } from "react-i18next";

import { TranslationKeys } from "@types";

import { MdEdit, MdDelete } from "react-icons/md";
import { FaPause, FaPlay } from "react-icons/fa6";
import { IconButton, IconButtonProps, Tooltip } from "@chakra-ui/react";

interface IconButtonWithTooltipProps
  extends Omit<IconButtonProps, "aria-label"> {
  label: TranslationKeys;
  "aria-label"?: string;
}

const IconButtonWithTooltip = ({
  label,
  ...props
}: IconButtonWithTooltipProps) => {
  const { t } = useTranslation();
  const TranslatedLabel: string = t(label);

  return (
    <Tooltip hasArrow label={TranslatedLabel}>
      <IconButton
        isRound
        variant="ghost"
        aria-label={TranslatedLabel}
        {...props}
      />
    </Tooltip>
  );
};

export default IconButtonWithTooltip;

interface ExtendedIconButtonWithTooltipProps
  extends Omit<IconButtonWithTooltipProps, "icon" | "label"> {
  label?: TranslationKeys;
}

export const EditIconButton = (props: ExtendedIconButtonWithTooltipProps) => (
  <IconButtonWithTooltip
    label={"icon-button.edit-button-default" as TranslationKeys}
    icon={<MdEdit color="#68D391" />}
    {...props}
  />
);

export const RemoveIconButton = (props: ExtendedIconButtonWithTooltipProps) => (
  <IconButtonWithTooltip
    label={"icon-button.remove-button-default" as TranslationKeys}
    icon={<MdDelete color="#E53E3E" />}
    {...props}
  />
);

export const ActivateIconButton = (props: ExtendedIconButtonWithTooltipProps) => (
  <IconButtonWithTooltip
    label={"icon-button.activate-button-default" as TranslationKeys}
    icon={<FaPlay color="#D69E2E" />}
    {...props}
  />
);

export const InactivateIconButton = (props: ExtendedIconButtonWithTooltipProps) => (
  <IconButtonWithTooltip
    label={"icon-button.inactivate-button-default" as TranslationKeys}
    icon={<FaPause color="#D69E2E" />}
    {...props}
  />
);
