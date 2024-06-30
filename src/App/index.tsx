import React from "react";
import { useAppStore } from "@store";

import { AUTH_STORAGE_KEY } from "./utils/constants";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { superDashboardRoutes, authRoutes } from "@routes";
import { LandingPage, NotFound } from "@containers";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
    errorElement: <NotFound />,
  },
  ...authRoutes,
  ...superDashboardRoutes,
]);

function App() {
  const login = useAppStore((state) => state.login);

  React.useEffect(() => {
    if (localStorage?.[AUTH_STORAGE_KEY]) {
      const { auth } = JSON.parse(localStorage?.[AUTH_STORAGE_KEY])?.state;
      login(auth);
    }
  }, []);

  return <RouterProvider router={router} />;
}

export default App;
