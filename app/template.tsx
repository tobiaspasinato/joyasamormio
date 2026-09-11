"use client";

import { motion } from "motion/react";

/**
 * Transición entre rutas. Next remonta el `template` en cada navegación (a
 * diferencia del `layout`, que persiste), así que alcanza con animar la entrada:
 * un fundido corto que evita el salto seco entre la home y el catálogo.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="flex flex-1 flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
