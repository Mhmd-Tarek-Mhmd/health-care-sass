import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { LandingPage, NotFound } from "./containers";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
    errorElement: <NotFound />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
