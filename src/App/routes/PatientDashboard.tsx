import { RouteObject } from "react-router-dom";

import { PatientDashboard } from "@containers";

const patientDashboardRoutes: Array<RouteObject> = [
  {
    path: "/dashboard",
    element: <PatientDashboard.Root />,
    children: [
      {
        path: "home",
        element: <PatientDashboard.Home />,
      },
      {
        path: "appointments",
        element: <PatientDashboard.Appointments />,
      },
      {
        path: "settings",
        element: <PatientDashboard.Settings />,
      },
    ],
  },
];

export default patientDashboardRoutes;
