import Store from "@store";
import { UserType } from "@types";

import adminDashboardRoutes from "./AdminDashboard";
import superDashboardRoutes from "./SuperDashboard";
import nurseDashboardRoutes from "./NurseDashboard";
import doctorDashboardRoutes from "./DoctorDashboard";
import patientDashboardRoutes from "./PatientDashboard";

type Type = Lowercase<UserType>;
const type = Store.auth?.user?.type?.toLowerCase() as Type;

const routes = {
  super: superDashboardRoutes,
  nurse: nurseDashboardRoutes,
  admin: adminDashboardRoutes,
  doctor: doctorDashboardRoutes,
  patient: patientDashboardRoutes,
};

const dashboardRoutes = routes?.[type] || [];

export default dashboardRoutes;
