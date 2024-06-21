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
  return <RouterProvider router={router} />;
}

export default App;
