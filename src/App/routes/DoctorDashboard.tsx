import { RouteObject } from "react-router-dom";

import { DoctorDashboard } from "@containers";

const doctorDashboardRoutes: Array<RouteObject> = [
  {
    path: "/dashboard",
    element: <DoctorDashboard.Root />,
    children: [
      {
        path: "medicines",
        element: <DoctorDashboard.Medicines />,
      },
      {
        path: "nurses",
        element: <DoctorDashboard.Nurses />,
      },
      {
        path: "patients",
        element: <DoctorDashboard.Patients />,
      },
    ],
  },
];

export default doctorDashboardRoutes;
