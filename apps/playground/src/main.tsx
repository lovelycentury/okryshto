import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@okryshto/design-system/styles/index.scss";
import "@okryshto/react/style.css";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
