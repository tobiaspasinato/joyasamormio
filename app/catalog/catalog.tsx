"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion } from "motion/react";

import {
  CATEGORIES,
  NO_PHOTO_LABEL,
  STOCK_COLORS,
  STOCK_LABELS,
  type Product,
} from "../products";

/** Número de WhatsApp de contacto, cargado por variable de entorno. */
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

/*
 * Catálogo con el lenguaje visual de la plantilla Noir: fondo plano, hairlines
 * de 1px como única separación, serif en los nombres y oro para los precios.
 * Todo el estilo son utilidades de Tailwind; ya no hay CSS Modules ni vidrio.
 *
 * Mobile-first: dos columnas y ficha como hoja inferior; desde `md` la grilla
 * crece y la ficha pasa a diálogo centrado a dos columnas.
 *
 * Las animaciones son de Motion. La entrada y la salida de la ficha las maneja
 * `AnimatePresence`: por eso cerrarla ya no necesita ni un estado de visibilidad
 * ni un `setTimeout` atado a la duración de la transición.
 */

/** Curva larga y sin rebote, la misma que usa el resto del sitio. */
const EASE = [0.22, 1, 0.36, 1] as const;

/** Punto en el que la ficha pasa de hoja inferior a diálogo centrado (`md`). */
const DESKTOP_QUERY = "(min-width: 768px)";

function subscribeToDesktop(onChange: () => void) {
  const mq = window.matchMedia(DESKTOP_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * La ficha se anima distinto según el ancho, y eso no se puede expresar con
 * clases: hay que saberlo en JS. En el servidor asume mobile; la ficha solo
 * aparece tras un click, o sea ya hidratada, así que no hay desajuste visible.
 */
function useIsDesktop() {
  return useSyncExternalStore(
    subscribeToDesktop,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false,
  );
}

/**
 * Categoría pedida por `?categoria=` (así enlaza la home cada material). Un
 * valor que no esté en la lista se ignora y cae en "Todos".
 */
function normalizeCategory(raw: string | null): string {
  return raw && (CATEGORIES as readonly string[]).includes(raw) ? raw : "Todos";
}

/** Relleno de las fotos que todavía no existen, con el marco de la plantilla. */
function PhotoPlaceholder({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`relative flex items-center justify-center bg-[linear-gradient(155deg,var(--color-panel)_0%,var(--color-panel-deep)_100%)] px-3 text-center ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-4 border border-gold opacity-30"
        aria-hidden
      />
      <span className="font-mono text-[10.5px] leading-relaxed text-faint">
        {label}
      </span>
    </div>
  );
}

export default function Catalog({
  products,
  requestedCategory,
}: {
  /** Catálogo ya normalizado, traído de SheetDB en `page.tsx` (Server Component). */
  products: Product[];
  /**
   * Viene de `?categoria=` en el servidor (`page.tsx`), que además usa el valor
   * como `key`: al llegar desde la home con otro material el componente se
   * remonta y este estado inicial se recalcula.
   */
  requestedCategory: string | null;
}) {
  const initialCategory = normalizeCategory(requestedCategory);

  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null,
  );
  const [photoIndex, setPhotoIndex] = useState(0);

  const chipsRowRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, startScroll: 0 });

  // Arrastre horizontal de los chips con el mouse; en touch lo maneja el scroll nativo.
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = chipsRowRef.current;
    if (!el || e.pointerType === "touch") return;
    drag.current = {
      active: true,
      startX: e.clientX,
      startScroll: el.scrollLeft,
    };
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = chipsRowRef.current;
    if (!drag.current.active || !el) return;
    el.scrollLeft =
      drag.current.startScroll - (e.clientX - drag.current.startX);
  };
  const endDrag = () => {
    drag.current.active = false;
  };

  // La rueda vertical desplaza la fila de chips en horizontal. Va como listener
  // no pasivo porque React registra onWheel de forma pasiva y ahí preventDefault
  // no surte efecto. En escritorio los chips no scrollean, así que no aplica.
  useEffect(() => {
    const el = chipsRowRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        el.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const openProduct = (id: number) => {
    setSelectedProductId(id);
    setPhotoIndex(0);
  };

  const closeProduct = useCallback(() => setSelectedProductId(null), []);

  // Con la ficha abierta se bloquea el scroll de fondo (relevante en escritorio,
  // donde scrollea el documento). Las barras están ocultas, así que no hay salto.
  useEffect(() => {
    if (selectedProductId === null) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [selectedProductId]);

  useEffect(() => {
    if (selectedProductId === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeProduct();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedProductId, closeProduct]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      const catOk = activeCategory === "Todos" || p.category === activeCategory;
      const searchOk =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return catOk && searchOk;
    });
  }, [products, activeCategory, searchQuery]);

  const selectedProduct: Product | null =
    products.find((p) => p.id === selectedProductId) ?? null;

  return (
    <div className="flex flex-1 flex-col bg-bg">
      {/*
       * Filtros y búsqueda viven en el cuerpo de la página, no en una barra
       * propia: arriba ya está el nav compartido. Quedan pegados debajo de él
       * con `sticky`, apoyados en `--nav-height` (definida en globals.css).
       */}
      <motion.section
        className="sticky top-[var(--nav-height)] z-10 flex flex-col gap-4 border-b border-line bg-bg px-gutter py-4 md:flex-row md:items-center md:justify-between md:gap-10"
        aria-label="Filtros del catálogo"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <div
          ref={chipsRowRef}
          className="flex cursor-grab flex-nowrap gap-7 overflow-x-scroll touch-pan-x md:cursor-default md:flex-wrap md:overflow-x-visible"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          onPointerCancel={endDrag}
        >
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                className={`relative flex-none pb-1 text-sm whitespace-nowrap transition-colors ${
                  active ? "text-gold" : "text-muted hover:text-fg"
                }`}
                aria-pressed={active}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
                {/* Un único subrayado, que se desliza de un filtro al siguiente. */}
                {active ? (
                  <motion.span
                    layoutId="chip-underline"
                    className="absolute inset-x-0 bottom-0 h-px bg-gold"
                    transition={{ duration: 0.35, ease: EASE }}
                  />
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="relative flex items-center md:w-64 md:flex-none">
          <svg
            className="pointer-events-none absolute left-0 text-faint"
            width="16"
            height="16"
            viewBox="0 0 18 18"
            aria-hidden="true"
          >
            <circle
              cx="8"
              cy="8"
              r="6.5"
              stroke="currentColor"
              strokeWidth="1.6"
              fill="none"
            />
            <path
              d="M13 13L17 17"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="search"
            className="w-full border-b border-line bg-transparent py-2 pl-7 text-sm text-fg outline-none placeholder:text-faint focus:border-gold"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Buscar productos"
          />
        </div>
      </motion.section>

      <main className="flex-1">
        {filteredProducts.length > 0 ? (
          /* Grilla de hairlines continuas, como el "lineup" de la plantilla. */
          <div className="grid grid-cols-2 border-l border-line md:grid-cols-3 xl:grid-cols-4">
            {/*
             * `popLayout` saca de la grilla lo que se va antes de reacomodar el
             * resto: al filtrar, las piezas que quedan se deslizan a su lugar en
             * vez de saltar.
             */}
            <AnimatePresence mode="popLayout" initial={false}>
              {filteredProducts.map((p, i) => (
                <motion.button
                  key={p.id}
                  type="button"
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.45,
                      ease: EASE,
                      // Escalonado al cargar; al filtrar quedan pocas y casi no se nota.
                      delay: Math.min(i * 0.04, 0.4),
                    },
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.97,
                    transition: { duration: 0.18, ease: "easeOut" },
                  }}
                  className="flex flex-col border-r border-b border-line text-left transition-colors hover:bg-panel/50 focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-gold"
                  onClick={() => openProduct(p.id)}
                >
                  {/* La foto se acerca apenas al pasar el mouse, recortada por la celda. */}
                  <div className="w-full overflow-hidden">
                    <motion.div
                      className="h-36 w-full sm:h-48 lg:h-56"
                      whileHover={{ scale: 1.04 }}
                      transition={{ duration: 0.5, ease: EASE }}
                    >
                      {p.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="size-full object-cover"
                        />
                      ) : (
                        <PhotoPlaceholder
                          label={`foto: ${p.name.toLowerCase()}`}
                          className="size-full"
                        />
                      )}
                    </motion.div>
                  </div>
                  <div className="flex flex-col gap-1 px-5 py-6">
                    <span className="text-[10px] tracking-[0.08em] text-faint uppercase">
                      {p.category}
                    </span>
                    <span className="font-display text-lg leading-tight text-fg">
                      {p.name}
                    </span>
                    <span className="text-sm text-gold">{p.price}</span>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            className="px-gutter py-24 text-center text-sm text-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            No encontramos productos con esa búsqueda.
          </motion.div>
        )}
      </main>

      <footer className="flex justify-between border-t border-line px-gutter py-10 text-sm text-faint">
        <span>Joyasamoremio</span>
        <span>© 2026</span>
      </footer>

      <AnimatePresence>
        {selectedProduct ? (
          <ProductSheet
            product={selectedProduct}
            photoIndex={photoIndex}
            onPhotoChange={setPhotoIndex}
            onClose={closeProduct}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function ProductSheet({
  product,
  photoIndex,
  onPhotoChange,
  onClose,
}: {
  product: Product;
  photoIndex: number;
  onPhotoChange: (i: number) => void;
  onClose: () => void;
}) {
  const isDesktop = useIsDesktop();

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hola! Me interesa "${product.name}" (${product.price}).`,
  )}`;

  // En mobile la ficha sube desde el borde inferior; en escritorio es un diálogo
  // que entra con un acercamiento mínimo.
  const sheetMotion = isDesktop
    ? {
        initial: { opacity: 0, y: 12, scale: 0.97 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 12, scale: 0.97 },
      }
    : {
        initial: { y: "100%" },
        animate: { y: 0 },
        exit: { y: "100%" },
      };

  return (
    <motion.div
      className="fixed inset-0 z-30 flex items-end bg-black/70 md:items-center md:justify-center md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
    >
      <motion.div
        className="relative mx-auto max-h-[86%] w-full overflow-y-auto border-t border-line bg-bg px-6 pt-4 pb-[calc(env(safe-area-inset-bottom,0px)+28px)] md:max-h-[min(88vh,720px)] md:max-w-4xl md:border md:p-10"
        {...sheetMotion}
        transition={{ duration: 0.35, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tirador de la hoja inferior; en escritorio es un diálogo y no aplica. */}
        <div className="mx-auto mt-1 mb-4 h-px w-9 bg-line md:hidden" />

        <motion.button
          type="button"
          className="absolute top-4 right-5 z-2 flex size-8 items-center justify-center border border-line text-fg transition-colors hover:border-gold hover:text-gold md:top-6 md:right-6"
          onClick={onClose}
          aria-label="Cerrar"
          whileHover={{ rotate: 90 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true">
            <path
              d="M1 1L13 13M13 1L1 13"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </motion.button>

        <div className="md:grid md:grid-cols-2 md:items-start md:gap-10">
          <div className="mb-5 flex flex-col gap-3 md:sticky md:top-0 md:mb-0">
            <button
              type="button"
              className="relative h-56 w-full overflow-hidden border border-line md:h-[340px]"
              onClick={() =>
                product.images.length > 1 &&
                onPhotoChange((photoIndex + 1) % product.images.length)
              }
              aria-label="Ver siguiente foto"
              disabled={product.images.length <= 1}
            >
              {/* Encadenado entre fotos: sale una y recién entonces entra la otra. */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={photoIndex}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  {product.images[photoIndex] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.images[photoIndex]}
                      alt={product.name}
                      className="size-full object-cover"
                    />
                  ) : (
                    <PhotoPlaceholder
                      label={NO_PHOTO_LABEL}
                      className="size-full"
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </button>
            {/* Solo tiene sentido navegar entre fotos si el producto trajo más de una. */}
            {product.images.length > 1 ? (
              <div className="flex justify-center gap-2">
                {product.images.map((src, i) => (
                  <motion.button
                    key={src + i}
                    type="button"
                    className="h-1.5 rounded-full"
                    animate={{
                      width: i === photoIndex ? 18 : 6,
                      backgroundColor: i === photoIndex ? "#c9a24b" : "#2b2723",
                    }}
                    transition={{ duration: 0.3, ease: EASE }}
                    onClick={() => onPhotoChange(i)}
                    aria-label={`Ver foto ${i + 1}`}
                    aria-current={i === photoIndex}
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center justify-between gap-4 pr-11">
              <span className="text-[11px] tracking-[0.08em] text-faint uppercase">
                {product.category}
              </span>
              <span
                className="border px-3 py-1 text-[11px] whitespace-nowrap"
                style={
                  {
                    borderColor: STOCK_COLORS[product.stock],
                    color: STOCK_COLORS[product.stock],
                  } as CSSProperties
                }
              >
                {STOCK_LABELS[product.stock]}
              </span>
            </div>

            <h2 className="mt-3 text-3xl leading-tight md:text-4xl">
              {product.name}
            </h2>
            <p className="mt-2 mb-6 text-lg text-gold md:text-xl">
              {product.price}
            </p>

            <div className="flex justify-between gap-4 border-b border-line py-3">
              <span className="text-sm text-muted">Material</span>
              <span className="text-sm text-fg">{product.material}</span>
            </div>

            <p className="mt-6 mb-2 text-xs tracking-[0.08em] text-faint uppercase">
              Descripción
            </p>
            <p className="text-sm text-muted">{product.description}</p>

            <motion.a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 flex items-center justify-center gap-2 border border-gold px-6 py-4 text-sm text-gold transition-colors hover:bg-gold hover:text-bg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2, ease: EASE }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12c0 1.82.5 3.53 1.36 5L2 22l5.2-1.36A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.65 0-3.2-.44-4.55-1.28l-.33-.2-2.9.76.78-2.83-.21-.34A7.94 7.94 0 0 1 4 12c0-4.42 3.58-8 8-8s8 3.58 8 8-3.58 8-8 8z" />
                <path d="M17 14.4c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.13-.42-2.15-1.33-.8-.71-1.33-1.58-1.49-1.85-.16-.27-.02-.42.13-.56.14-.14.32-.36.48-.54.16-.18.21-.32.32-.54.11-.22.05-.4-.03-.54-.09-.14-.6-1.44-.82-1.97-.22-.53-.44-.46-.61-.47-.16-.01-.35-.01-.54-.01-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.28 0 1.34.98 2.64 1.12 2.83.14.18 1.9 2.9 4.61 3.96 2.71 1.05 2.71.7 3.2.66.49-.05 1.6-.65 1.83-1.28.22-.63.22-1.17.16-1.28-.07-.11-.25-.18-.52-.32z" />
              </svg>
              <span>Consultar por WhatsApp</span>
            </motion.a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
