"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";

/*
 * Barra de navegación compartida, con el `header` de la plantilla Noir:
 * fondo plano, una sola hairline abajo y links chicos que viran a oro.
 *
 * Vive en el layout, así que se monta una sola vez: la entrada se reproduce al
 * cargar el sitio y el subrayado dorado se desliza de una sección a otra
 * (`layoutId`) en lugar de reaparecer en cada navegación.
 *
 * Alto fijo (`--nav-height`, en globals.css) para que el catálogo pueda anclar
 * sus filtros justo debajo sin duplicar el número.
 */

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/catalog", label: "Catálogo" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <motion.header
      className="sticky top-0 z-20 flex h-[var(--nav-height)] w-full items-center justify-between gap-4 border-b border-line bg-bg px-gutter pt-[env(safe-area-inset-top,0px)]"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href="/"
        className="font-display text-2xl tracking-wide text-fg transition-colors hover:text-gold"
      >
        Joyasamoremio
      </Link>

      <nav className="flex items-center gap-6 sm:gap-8">
        {LINKS.map(({ href, label }) => {
          // "/" solo coincide exacto; el resto también en sus subrutas.
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`relative py-1 text-sm transition-colors hover:text-gold ${
                active ? "text-gold" : "text-fg"
              }`}
              aria-current={active ? "page" : undefined}
            >
              {label}
              {active ? (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute inset-x-0 -bottom-0.5 h-px bg-gold"
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                />
              ) : null}
            </Link>
          );
        })}
      </nav>
    </motion.header>
  );
}
