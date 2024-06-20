import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { superDashboardRoutes } from "./routes";
import { LandingPage, NotFound } from "./containers";


const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
    errorElement: <NotFound />,
  },
  ...superDashboardRoutes,
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
