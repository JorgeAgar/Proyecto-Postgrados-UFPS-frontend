import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Status from "./vistas/Status.tsx";
import { BrowserRouter } from "react-router";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Status />
    </BrowserRouter>
  </StrictMode>,
);
