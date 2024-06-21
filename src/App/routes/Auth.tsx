import { RouteObject } from "react-router-dom";

import { Auth } from "@containers";

const authRoutes: Array<RouteObject> = [
  {
    path: "/login",
    element: <Auth.LogIn />,
  },
  {
    path: "/logup",
    element: <Auth.LogUp />,
  },
  {
    path: "/forget-password",
    element: <Auth.ForgetPassword />,
  },
  {
    path: "/reset-password",
    element: <Auth.ResetPassword />,
  },
];

export default authRoutes;
