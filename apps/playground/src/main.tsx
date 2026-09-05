import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@okkly/design-system/styles/index.scss";
import "@okkly/react/style.css";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
