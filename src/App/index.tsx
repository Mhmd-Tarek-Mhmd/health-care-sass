import React from "react";
import { useAppStore } from "@store";

import { AUTH_STORAGE_KEY } from "./utils/constants";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { LandingPage, NotFound } from "@containers";
import { dashboardRoutes, authRoutes } from "@routes";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
    errorElement: <NotFound />,
  },
  ...authRoutes,
  ...dashboardRoutes,
]);

function App() {
  const login = useAppStore((state) => state.login);
  const authToken = useAppStore((state) => state.auth?.token);

  React.useEffect(() => {
    if (localStorage?.[AUTH_STORAGE_KEY]) {
      const { auth } = JSON.parse(localStorage?.[AUTH_STORAGE_KEY])?.state;
      login(auth);
    }
  }, []);

  React.useEffect(() => {
    if (
      !authToken &&
      !localStorage?.[AUTH_STORAGE_KEY] &&
      !["","/login", "/logup", "/forget-password"].includes(location.pathname)
    ) {
      window.location.pathname = "/login";
    }
  }, [authToken, localStorage?.[AUTH_STORAGE_KEY]]);

  return <RouterProvider router={router} />;
}

export default App;
