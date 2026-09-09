"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "./NavBar.module.css";

/**
 * Desenfoque del nav ("liquid glass"), inline a propósito.
 *
 * Lightning CSS —que Turbopack usa siempre— reescribe `backdrop-filter` en las
 * hojas de estilo y deja solo `-webkit-backdrop-filter`, un alias que Chrome
 * 152 ya retiró. React escribe estos estilos directo en el elemento, sin pasar
 * por esa transformación. Mismo criterio que en el catálogo.
 */
const NAV_GLASS = {
  backdropFilter: "blur(16px) saturate(160%)",
  WebkitBackdropFilter: "blur(16px) saturate(160%)",
};

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/catalog", label: "Catálogo" },
  { href: "/aboutme", label: "Sobre mí" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} style={NAV_GLASS}>
      <Link href="/" className={styles.logoWrap} aria-label="Joyasamormio">
        <span className={styles.logoMark} aria-hidden>
          J
        </span>
        <span className={styles.logoText}>Joyasamormio</span>
      </Link>

      <div className={styles.navLinks}>
        {LINKS.map(({ href, label }) => {
          // "/" solo coincide exacto; el resto también en sus subrutas.
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
              aria-current={active ? "page" : undefined}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
