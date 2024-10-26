import { LinkItemProps } from "../../utils/types";

import { GiMedicines } from "react-icons/gi";
import { DashboardLayout } from "@components";
import { FaHospitalUser, FaUserNurse } from "react-icons/fa6";

const Links: Array<LinkItemProps> = [
  { label: "Medicines", icon: GiMedicines, to: "medicines" },
  { label: "Nurses", icon: FaUserNurse, to: "nurses" },
  { label: "Patients", icon: FaHospitalUser, to: "patients" },
];

const SuperDashboardRoot = () => {
  return <DashboardLayout links={Links} />;
};

export default SuperDashboardRoot;
