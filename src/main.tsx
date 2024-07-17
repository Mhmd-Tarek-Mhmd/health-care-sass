import React from "react";
import ReactDOM from "react-dom/client";

import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import App from "./App";
import "./dayjs";
import "./i18n";

const theme = extendTheme({
  direction: localStorage?.i18nextLng?.includes("ar") ? "rtl" : "ltr",
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
