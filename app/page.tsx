import Image from "next/image";
import Link from "next/link";
import * as motion from "motion/react-client";
import type { Variants } from "motion/react";

import { CATEGORIES } from "./products";

const ADDRESS = "Oliver 603, B1839AMA 9 de Abril, Provincia de Buenos Aires";
const MAP_QUERY = encodeURIComponent(ADDRESS);

/* La franja de la plantilla ("lineup") acá lista los materiales del catálogo. */
const MATERIALS = CATEGORIES.filter((c) => c !== "Todos");

/*
 * Animaciones. `motion/react-client` deja usar componentes de Motion desde un
 * Server Component: la página sigue renderizándose en el servidor y solo viaja
 * al cliente el runtime de la animación.
 *
 * El criterio es el mismo que el del diseño: nada rebota ni escala de golpe,
 * todo entra con un desplazamiento corto y una curva larga. Con "reducir
 * movimiento" activo, el `MotionConfig` del layout deja únicamente el fundido.
 */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Contenedor que escalona la entrada de sus hijos. */
const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } },
};

/** Las secciones bajo el pliegue entran al entrar en pantalla, una sola vez. */
const IN_VIEW = { once: true, amount: 0.3 } as const;

export default function Home() {
  return (
    <div className="flex flex-1 flex-col overflow-x-hidden bg-bg text-fg">
      <main className="flex-1">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <motion.section
          className="px-gutter pt-24 pb-20 text-center sm:pt-32 sm:pb-28"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <motion.p
            className="mb-6 text-sm tracking-[0.04em] text-gold"
            variants={fadeUp}
          >
            Joyería en oro, plata y acero quirúrgico
          </motion.p>
          <motion.h1
            className="mx-auto mb-7 max-w-[16ch] text-[clamp(2.6rem,6vw,5rem)] leading-[1.15]"
            variants={fadeUp}
          >
            Piezas para llevar todos los días
          </motion.h1>
          <motion.p
            className="mx-auto max-w-[40ch] text-muted"
            variants={fadeUp}
          >
            Trabajamos con materiales que no se manchan ni pierden brillo, para
            que cada pieza acompañe sin pedir cuidados especiales.
          </motion.p>
        </motion.section>

        {/* ── Materiales ───────────────────────────────────────── */}
        <motion.section
          className="grid grid-cols-2 border-y border-line md:grid-cols-4"
          aria-label="Materiales"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={IN_VIEW}
        >
          {MATERIALS.map((material, i) => (
            <Link
              key={material}
              href={`/catalog?categoria=${encodeURIComponent(material)}`}
              className={`group border-line px-6 py-12 text-center ${
                // Hairlines internas: a la derecha salvo en la última de cada fila,
                // y abajo mientras la grilla siga en dos columnas.
                i < MATERIALS.length - 1 ? "md:border-r" : ""
              } ${i % 2 === 0 ? "border-r" : ""} ${
                i < MATERIALS.length - 2 ? "border-b md:border-b-0" : ""
              }`}
            >
              <motion.div variants={fadeUp}>
                <motion.div
                  className="mx-auto mb-7 size-14 rounded-full border border-gold"
                  whileHover={{ scale: 1.12, backgroundColor: "#c9a24b1a" }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                />
                <h3 className="mb-2 font-body text-base font-normal">
                  {material}
                </h3>
                <p className="text-sm text-gold">Ver piezas</p>
              </motion.div>
            </Link>
          ))}
        </motion.section>

        {/* ── Sobre el local ───────────────────────────────────── */}
        <section className="grid items-stretch md:grid-cols-2">
          <motion.div
            className="flex flex-col justify-center px-gutter py-16 md:py-24"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={IN_VIEW}
          >
            <motion.p
              className="mb-5 text-sm tracking-[0.04em] text-gold"
              variants={fadeUp}
            >
              Sobre el local
            </motion.p>
            <motion.h2 className="mb-5 max-w-[12ch] text-4xl" variants={fadeUp}>
              Joyería elegida para el uso diario
            </motion.h2>
            <motion.p className="max-w-[38ch] text-muted" variants={fadeUp}>
              Oro, plata y acero quirúrgico en piezas pensadas para durar. Cada
              modelo se elige por cómo envejece: sin manchas, sin pérdida de
              brillo y sin cuidados especiales.
            </motion.p>
          </motion.div>
          <div className="relative h-[280px] overflow-hidden bg-[linear-gradient(155deg,var(--color-panel)_0%,var(--color-panel-deep)_100%)] md:h-auto md:min-h-[420px]">
            {/* Un acercamiento muy leve mientras la foto entra en pantalla. */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.08 }}
              whileInView={{ opacity: 0.7, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src="/imagenhome.jpg"
                alt="Joya destacada en primer plano"
                fill
                priority
                sizes="(max-width: 767px) 100vw, 50vw"
                className="object-cover"
              />
            </motion.div>
            {/* Marco interior de la plantilla (`.split-visual::after`). */}
            <motion.div
              className="pointer-events-none absolute inset-8 border border-gold md:inset-[60px]"
              aria-hidden
              initial={{ opacity: 0, scale: 1.06 }}
              whileInView={{ opacity: 0.5, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.9,
                delay: 0.25,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          </div>
        </section>

        {/* ── Cómo encontrarnos ────────────────────────────────── */}
        <section
          id="contacto"
          className="grid items-stretch border-t border-line md:grid-cols-2"
        >
          <div className="relative order-2 h-[280px] border-t border-line md:order-1 md:h-auto md:min-h-[420px] md:border-t-0 md:border-r">
            <iframe
              /* Mapa en modo oscuro, para que no rompa el fondo de la plantilla. */
              className="size-full border-0 [filter:invert(0.92)_grayscale(1)_contrast(1.05)]"
              src={`https://www.google.com/maps?q=${MAP_QUERY}&output=embed`}
              loading="lazy"
              title="Ubicación de Joyasamormio"
            />
          </div>
          <motion.div
            className="order-1 flex flex-col justify-center px-gutter py-16 md:order-2 md:py-24"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={IN_VIEW}
          >
            <motion.p
              className="mb-5 text-sm tracking-[0.04em] text-gold"
              variants={fadeUp}
            >
              Cómo encontrarnos
            </motion.p>
            <motion.h2 className="mb-4 max-w-[14ch] text-3xl" variants={fadeUp}>
              {ADDRESS}
            </motion.h2>
            <motion.p className="text-muted" variants={fadeUp}>
              Lunes a sábado, de 10 a 19h
            </motion.p>
            <motion.a
              href={`https://www.google.com/maps/dir/?api=1&destination=${MAP_QUERY}`}
              className="mt-8 self-start border-b border-gold pb-1 text-sm text-gold transition-colors hover:border-fg hover:text-fg"
              target="_blank"
              rel="noreferrer"
              variants={fadeUp}
              whileHover={{ x: 4 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              Ver cómo llegar →
            </motion.a>
          </motion.div>
        </section>
      </main>

      <motion.footer
        className="flex justify-between border-t border-line px-gutter py-10 text-sm text-faint"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <span>Joyasamoremio</span>
        <span>© 2026</span>
      </motion.footer>
    </div>
  );
}
