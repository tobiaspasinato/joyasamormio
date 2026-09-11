"use client";

import { MotionConfig } from "motion/react";

/**
 * Ajustes globales de Motion.
 *
 * `reducedMotion="user"`: con "reducir movimiento" activado en el sistema,
 * Motion desactiva desplazamientos y escalas y deja solo los fundidos. Es el
 * equivalente en JS de la media query que ya está en globals.css.
 *
 * Va en un componente propio porque `MotionConfig` es de cliente y el layout es
 * un Server Component; los hijos siguen renderizándose en el servidor.
 */
export default function MotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
