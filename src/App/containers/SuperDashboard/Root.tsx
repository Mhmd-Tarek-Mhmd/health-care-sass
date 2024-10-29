import { LinkItemProps } from "../../utils/types";

import { MdPayment } from "react-icons/md";
import { DashboardLayout } from "@components";
import { FaRegHospital } from "react-icons/fa";
import { IoDocumentsOutline } from "react-icons/io5";

const Links: Array<LinkItemProps> = [
  { label: "tabs.plans", icon: IoDocumentsOutline, to: "plans" },
  { label: "tabs.hospitals", icon: FaRegHospital, to: "hospitals" },
  { label: "tabs.payments", icon: MdPayment, to: "payments" },
];

const SuperDashboardRoot = () => {
  return <DashboardLayout links={Links} />;
};

export default SuperDashboardRoot;
