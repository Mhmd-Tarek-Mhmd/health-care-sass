import { LinkItemProps } from "../../utils/types";

import { BiCalendar } from "react-icons/bi";
import { GiMedicines } from "react-icons/gi";
import { DashboardLayout } from "@components";
import { FaGear, FaHospitalUser, FaUserNurse } from "react-icons/fa6";

const Links: Array<LinkItemProps> = [
  { label: "tabs.medicines", icon: GiMedicines, to: "medicines" },
  { label: "tabs.appointments", icon: BiCalendar, to: "appointments" },
  { label: "tabs.nurses", icon: FaUserNurse, to: "nurses" },
  { label: "tabs.patients", icon: FaHospitalUser, to: "patients" },
  { label: "tabs.settings", icon: FaGear, to: "settings" },
];

const SuperDashboardRoot = () => {
  return <DashboardLayout links={Links} />;
};

export default SuperDashboardRoot;
