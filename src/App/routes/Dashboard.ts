import Store from "@store";

import superDashboardRoutes from "./SuperDashboard";

type Type = "super";
const type = Store.auth?.user?.type as Type;

const routes = {
  super: superDashboardRoutes,
};

const dashboardRoutes = routes?.[type] || [];

export default dashboardRoutes;
