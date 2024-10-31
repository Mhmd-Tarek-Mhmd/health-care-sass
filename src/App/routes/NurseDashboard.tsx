import { RouteObject } from "react-router-dom";

import { NurseDashboard } from "@containers";

const nurseDashboardRoutes: Array<RouteObject> = [
  {
    path: "/dashboard",
    element: <NurseDashboard.Root />,
    children: [
      {
        path: "beds",
        element: <NurseDashboard.Beds />,
      },
      {
        path: "patients",
        element: <NurseDashboard.Patients />,
      },
      {
        path: "settings",
        element: <NurseDashboard.Settings />,
      },
    ],
  },
];

export default nurseDashboardRoutes;
