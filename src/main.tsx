import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Status from "./vistas/Status.tsx";
import { BrowserRouter, Route, Routes } from "react-router";
import { Formulario } from "./vistas/FormInscripcion.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Status />} />
      <Route path="/inscripcion" element={<Formulario />} />
    </Routes>
    </BrowserRouter>
  </StrictMode>,
);
