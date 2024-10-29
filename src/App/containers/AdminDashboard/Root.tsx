import { LinkItemProps } from "../../utils/types";

import { IoIosBed } from "react-icons/io";
import { GiMedicines } from "react-icons/gi";
import { DashboardLayout } from "@components";
import { MdSensorDoor } from "react-icons/md";
import { FaUserDoctor, FaHospitalUser, FaUserNurse } from "react-icons/fa6";

const Links: Array<LinkItemProps> = [
  { label: "tabs.beds", icon: IoIosBed, to: "beds" },
  { label: "tabs.rooms", icon: MdSensorDoor, to: "rooms" },
  { label: "tabs.medicines", icon: GiMedicines, to: "medicines" },
  { label: "tabs.doctors", icon: FaUserDoctor, to: "doctors" },
  { label: "tabs.nurses", icon: FaUserNurse, to: "nurses" },
  { label: "tabs.patients", icon: FaHospitalUser, to: "patients" },
];

const AdminDashboard = () => {
  return <DashboardLayout links={Links} />;
};

export default AdminDashboard;
