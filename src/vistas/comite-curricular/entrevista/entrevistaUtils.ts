/**
 * entrevistaUtils.ts
 *
 * Constantes, tipos auxiliares y datos mock compartidos
 * entre los componentes del módulo de entrevistas.
 * Reemplazar las listas por fetch al backend cuando esté listo.
 */

// Aspirantes con estado "Documentación validada" listos para entrevistar
// TODO: obtener desde apiFetch("/v1/aspirantes?estado=documentacion_validada")
export const ASPIRANTES_VALIDADOS = [
  { id: 1, nombre: "Carlos Andrés Gómez Pérez",  programa: "Maestría en Ingeniería de Software" },
  { id: 2, nombre: "Laura Sofía Martínez Ruiz",   programa: "Maestría en Ingeniería de Software" },
  { id: 3, nombre: "Andrés Felipe Rojas Cáceres", programa: "Especialización en Redes" },
  { id: 4, nombre: "María Camila Suárez Torres",  programa: "Especialización en Redes" },
  { id: 5, nombre: "Jorge Iván Contreras Meza",   programa: "Maestría en Ciencias Computacionales" },
] as const;

// Evaluadores disponibles del comité
// TODO: obtener desde apiFetch("/v1/evaluadores")
export const EVALUADORES = [
  "Dr. Hernán Darío Pinilla",
  "Mg. Claudia Patricia Vargas",
  "Ph.D. Ricardo Enrique Nieto",
  "Mg. Sandra Milena Galvis",
] as const;

// Cohortes vigentes en las que se pueden agendar entrevistas
// TODO: obtener desde apiFetch("/v1/cohortes?vigentes=true")
export const COHORTES_VIGENTES = ["2025-1", "2025-2", "2026-1"] as const;

/** Ruta base del módulo comité curricular */
export const BASE = "/comite";
