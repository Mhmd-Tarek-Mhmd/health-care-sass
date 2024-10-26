import Store from "@store";

import { userTypes } from "@constants";
import adminDashboardRoutes from "./AdminDashboard";
import superDashboardRoutes from "./SuperDashboard";
import doctorDashboardRoutes from "./DoctorDashboard";

type Type = Lowercase<(typeof userTypes)[keyof typeof userTypes]>;
const type = Store.auth?.user?.type?.toLowerCase() as Type;

const routes = {
  super: superDashboardRoutes,
  admin: adminDashboardRoutes,
  doctor: doctorDashboardRoutes,
};

const dashboardRoutes = routes?.[type] || [];

export default dashboardRoutes;
