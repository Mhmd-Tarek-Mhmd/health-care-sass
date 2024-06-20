import { RouteObject } from "react-router-dom";

import { SuperDashboard } from "../containers";

const superDashboardRoutes: Array<RouteObject> = [
  {
    path: "/dashboard",
    element: <SuperDashboard.Root />,
    children: [
      {
        path: "hospitals",
        element: <SuperDashboard.Hospitals />,
      },
      {
        path: "plans",
        element: <SuperDashboard.Plans />,
      },
      {
        path: "payments",
        element: <SuperDashboard.Payments />,
      },
    ],
  },
];

export default superDashboardRoutes;
