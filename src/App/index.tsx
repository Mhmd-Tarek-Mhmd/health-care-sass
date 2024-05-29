import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LandingPage from "./containers/landingPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
