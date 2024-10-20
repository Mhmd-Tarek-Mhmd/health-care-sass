import Store from "@store";

import adminDashboardRoutes from "./AdminDashboard";
import superDashboardRoutes from "./SuperDashboard";

type Type = "super" | "admin";
const type = Store.auth?.user?.type as Type;

const routes = {
  super: superDashboardRoutes,
  admin: adminDashboardRoutes,
};

const dashboardRoutes = routes?.[type] || [];

export default dashboardRoutes;
