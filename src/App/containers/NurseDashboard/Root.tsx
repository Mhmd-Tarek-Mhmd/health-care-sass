import { LinkItemProps } from "../../utils/types";

import { IoIosBed } from "react-icons/io";
import { DashboardLayout } from "@components";
import { FaGear, FaHospitalUser } from "react-icons/fa6";

const Links: Array<LinkItemProps> = [
  { label: "tabs.beds", icon: IoIosBed, to: "beds" },
  { label: "tabs.patients", icon: FaHospitalUser, to: "patients" },
  { label: "tabs.settings", icon: FaGear, to: "settings" },
];

const NurseDashboard = () => {
  return <DashboardLayout links={Links} />;
};

export default NurseDashboard;
