import { useTranslation } from "react-i18next";

import { MdEdit, MdDelete } from "react-icons/md";
import { IconButton, IconButtonProps, Tooltip } from "@chakra-ui/react";

interface IconButtonWithTooltipProps
  extends Omit<IconButtonProps, "aria-label"> {
  label: string;
  "aria-label"?: string;
}

const IconButtonWithTooltip = ({
  label,
  ...props
}: IconButtonWithTooltipProps) => {
  const { t } = useTranslation();

  return (
    <Tooltip hasArrow label={t(label)}>
      <IconButton isRound variant="ghost" aria-label={t(label)} {...props} />
    </Tooltip>
  );
};

export default IconButtonWithTooltip;

interface ExtendedIconButtonWithTooltipProps
  extends Omit<IconButtonWithTooltipProps, "icon" | "label"> {
  label?: string;
}

export const EditIconButton = (props: ExtendedIconButtonWithTooltipProps) => (
  <IconButtonWithTooltip
    label="icon-button.edit-button-default"
    icon={<MdEdit color="#68D391" />}
    {...props}
  />
);

export const RemoveIconButton = (props: ExtendedIconButtonWithTooltipProps) => (
  <IconButtonWithTooltip
    label="icon-button.remove-button-default"
    icon={<MdDelete color="#E53E3E" />}
    {...props}
  />
);
