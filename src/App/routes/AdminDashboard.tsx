import { RouteObject } from "react-router-dom";

import { AdminDashboard } from "@containers";

const adminDashboardRoutes: Array<RouteObject> = [
  {
    path: "/dashboard",
    element: <AdminDashboard.Root />,
    children: [
      {
        path: "beds",
        element: <AdminDashboard.Beds />,
      },
      {
        path: "rooms",
        element: <AdminDashboard.Rooms />,
      },
      {
        path: "nurses",
        element: <AdminDashboard.Nurses />,
      },
      {
        path: "doctors",
        element: <AdminDashboard.Doctors />,
      },
      {
        path: "patients",
        element: <AdminDashboard.Patients />,
      },
    ],
  },
];

export default adminDashboardRoutes;
