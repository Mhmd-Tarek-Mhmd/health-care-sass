import { LinkItemProps } from "../../utils/types";

import { IoIosBed } from "react-icons/io";
import { DashboardLayout } from "@components";
import { FaHospitalUser } from "react-icons/fa6";

const Links: Array<LinkItemProps> = [
  { label: "Beds", icon: IoIosBed, to: "beds" },
  { label: "Patients", icon: FaHospitalUser, to: "patients" },
];

const NurseDashboard = () => {
  return <DashboardLayout links={Links} />;
};

export default NurseDashboard;
