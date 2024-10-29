import { LinkItemProps } from "../../utils/types";

import { GiMedicines } from "react-icons/gi";
import { DashboardLayout } from "@components";
import { FaHospitalUser, FaUserNurse } from "react-icons/fa6";

const Links: Array<LinkItemProps> = [
  { label: "tabs.medicines", icon: GiMedicines, to: "medicines" },
  { label: "tabs.nurses", icon: FaUserNurse, to: "nurses" },
  { label: "tabs.patients", icon: FaHospitalUser, to: "patients" },
];

const SuperDashboardRoot = () => {
  return <DashboardLayout links={Links} />;
};

export default SuperDashboardRoot;
