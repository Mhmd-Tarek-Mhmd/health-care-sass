import { LinkItemProps } from "../../utils/types";

import { IoIosBed } from "react-icons/io";
import { DashboardLayout } from "@components";
import { MdSensorDoor } from "react-icons/md";
import { FaUserDoctor, FaHospitalUser, FaUserNurse } from "react-icons/fa6";

const Links: Array<LinkItemProps> = [
  { label: "Beds", icon: IoIosBed, to: "beds" },
  { label: "Rooms", icon: MdSensorDoor, to: "rooms" },
  { label: "Doctors", icon: FaUserDoctor, to: "doctors" },
  { label: "Nurses", icon: FaUserNurse, to: "nurses" },
  { label: "Patients", icon: FaHospitalUser, to: "patients" },
];

const AdminDashboard = () => {
  return <DashboardLayout links={Links} />;
};

export default AdminDashboard;
