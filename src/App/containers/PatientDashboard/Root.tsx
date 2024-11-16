import { LinkItemProps } from "../../utils/types";

import { FaGear } from "react-icons/fa6";
import { DashboardLayout } from "@components";
import { BiCalendar, BiHome } from "react-icons/bi";

const Links: Array<LinkItemProps> = [
  { label: "tabs.home", icon: BiHome, to: "home" },
  { label: "tabs.appointments", icon: BiCalendar, to: "appointments" },
  { label: "tabs.settings", icon: FaGear, to: "settings" },
];

const PatientDashboard = () => {
  return <DashboardLayout links={Links} />;
};

export default PatientDashboard;
