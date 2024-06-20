import { IconType } from "react-icons";
import { To } from "react-router-dom";

export interface LinkItemProps {
  to: To;
  label: string;
  icon: IconType;
}
