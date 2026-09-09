"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import {
  CATEGORIES,
  PHOTO_LABELS,
  PRODUCTS,
  STOCK_COLORS,
  STOCK_LABELS,
  WHATSAPP_NUMBER,
  type Product,
} from "../products";
import styles from "./catalog.module.css";

/**
 * Desenfoque de fondo del diseño ("liquid glass"), aplicado inline a propósito.
 *
 * Lightning CSS —que Turbopack usa siempre— reescribe `backdrop-filter` en las
 * hojas de estilo y deja únicamente `-webkit-backdrop-filter`, un alias que
 * Chrome 152 ya retiró, con lo cual el efecto se pierde. En dev no lo corrigen
 * ni browserslist ni `experimental.lightningCssFeatures`. React, en cambio,
 * escribe estos estilos directo en el elemento, sin pasar por esa transformación.
 *
 * Se emiten las dos variantes: la estándar para los navegadores actuales y la
 * `-webkit-` como respaldo para Safari 16–17.
 */
const glass = (blur: number, saturate?: number): CSSProperties => {
  const value = `blur(${blur}px)${saturate ? ` saturate(${saturate}%)` : ""}`;
  return { backdropFilter: value, WebkitBackdropFilter: value };
};

/** Debe coincidir con la transición de `.sheet` en el CSS. */
const SHEET_TRANSITION_MS = 280;

const BACKGROUND_SHAPES: CSSProperties[] = [
  {
    width: 120,
    height: 120,
    borderRadius: "50%",
    border: "9px solid #76ABAE",
    top: "6%",
    left: "-10%",
    opacity: 0.16,
    animation: "floatA 16s ease-in-out infinite",
  },
  {
    width: 60,
    height: 60,
    background: "linear-gradient(135deg,#76ABAE,#EEEEEE)",
    transform: "rotate(45deg)",
    borderRadius: 6,
    top: "20%",
    right: "8%",
    opacity: 0.14,
    animation: "floatB 13s ease-in-out infinite",
  },
  {
    width: 80,
    height: 80,
    borderRadius: "50%",
    border: "7px solid #EEEEEE",
    top: "38%",
    left: "20%",
    opacity: 0.1,
    animation: "floatC 19s ease-in-out infinite",
  },
  {
    width: 44,
    height: 44,
    background: "#76ABAE",
    transform: "rotate(45deg)",
    borderRadius: 5,
    top: "52%",
    right: "22%",
    opacity: 0.15,
    animation: "floatA 15s ease-in-out infinite",
    animationDelay: "2s",
  },
  {
    width: 150,
    height: 150,
    borderRadius: "50%",
    border: "11px solid #76ABAE",
    top: "64%",
    left: "-16%",
    opacity: 0.13,
    animation: "floatB 22s ease-in-out infinite",
  },
  {
    width: 52,
    height: 52,
    background: "linear-gradient(135deg,#EEEEEE,#76ABAE)",
    transform: "rotate(45deg)",
    borderRadius: 6,
    top: "80%",
    right: "-4%",
    opacity: 0.16,
    animation: "floatC 17s ease-in-out infinite",
    animationDelay: "1.5s",
  },
  {
    width: 96,
    height: 96,
    borderRadius: "50%",
    border: "8px solid #EEEEEE",
    top: "90%",
    left: "34%",
    opacity: 0.1,
    animation: "floatA 20s ease-in-out infinite",
  },
];

export default function Catalog() {
  const [activeCategory, setActiveCategory] = useState<string>("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null,
  );
  const [sheetVisible, setSheetVisible] = useState(false);
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
    el.scrollLeft = drag.current.startScroll - (e.clientX - drag.current.startX);
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
    setSheetVisible(false);
    setPhotoIndex(0);
  };

  const closeProduct = useCallback(() => {
    setSheetVisible(false);
    setTimeout(() => setSelectedProductId(null), SHEET_TRANSITION_MS);
  }, []);

  // Un frame con la ficha en su estado inicial antes de animarla a la vista.
  useEffect(() => {
    if (selectedProductId === null) return;
    const raf = requestAnimationFrame(() => setSheetVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [selectedProductId]);

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
    return PRODUCTS.filter((p) => {
      const catOk = activeCategory === "Todos" || p.category === activeCategory;
      const searchOk =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return catOk && searchOk;
    });
  }, [activeCategory, searchQuery]);

  const selectedProduct: Product | null =
    PRODUCTS.find((p) => p.id === selectedProductId) ?? null;

  return (
    <div className={styles.app}>
      <div className={styles.bgLayer} aria-hidden="true">
        {BACKGROUND_SHAPES.map((shape, i) => (
          <div key={i} className={styles.shape} style={shape} />
        ))}
      </div>

      <main className={styles.main}>
        {/*
         * Filtros y búsqueda viven en el cuerpo de la página, no en una barra
         * propia: arriba ya está el nav compartido. Quedan pegados debajo de él
         * con `sticky`, apoyados en `--nav-height` (definida en globals.css).
         */}
        <section
          className={styles.filters}
          style={glass(22, 160)}
          aria-label="Filtros del catálogo"
        >
          <div
            ref={chipsRowRef}
            className={styles.chipsRow}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
            onPointerCancel={endDrag}
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={styles.chip}
                data-active={activeCategory === cat}
                aria-pressed={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className={styles.searchField}>
            <svg
              className={styles.searchIcon}
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
              className={styles.searchInput}
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Buscar productos"
            />
          </div>
        </section>

        <div className={styles.gridWrap}>
          {filteredProducts.length > 0 ? (
            <div className={styles.grid}>
              {filteredProducts.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={styles.card}
                  style={glass(12, 160)}
                  onClick={() => openProduct(p.id)}
                >
                  <div className={styles.cardImage}>
                    <span className={styles.cardImageLabel}>
                      foto: {p.name.toLowerCase()}
                    </span>
                  </div>
                  <div className={styles.cardBody}>
                    <span className={styles.catTag}>{p.category}</span>
                    <span className={styles.cardName}>{p.name}</span>
                    <span className={styles.cardPrice}>{p.price}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyText}>
                No encontramos productos con esa búsqueda.
              </span>
            </div>
          )}
        </div>
      </main>

      {selectedProduct ? (
        <ProductSheet
          product={selectedProduct}
          visible={sheetVisible}
          photoIndex={photoIndex}
          onPhotoChange={setPhotoIndex}
          onClose={closeProduct}
        />
      ) : null}
    </div>
  );
}

function ProductSheet({
  product,
  visible,
  photoIndex,
  onPhotoChange,
  onClose,
}: {
  product: Product;
  visible: boolean;
  photoIndex: number;
  onPhotoChange: (i: number) => void;
  onClose: () => void;
}) {
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hola! Me interesa "${product.name}" (${product.price}).`,
  )}`;

  return (
    <div
      className={styles.overlay}
      data-visible={visible}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
    >
      <div
        className={styles.sheet}
        data-visible={visible}
        style={glass(34, 170)}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.dragHandle} />

        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Cerrar"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <path
              d="M1 1L13 13M13 1L1 13"
              stroke="#EEEEEE"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className={styles.sheetInner}>
          <div className={styles.carousel}>
            <button
              type="button"
              className={styles.carouselImage}
              onClick={() =>
                onPhotoChange((photoIndex + 1) % PHOTO_LABELS.length)
              }
              aria-label="Ver siguiente foto"
            >
              <span className={styles.carouselLabel}>
                {PHOTO_LABELS[photoIndex]}
              </span>
            </button>
            <div className={styles.dotsRow}>
              {PHOTO_LABELS.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  className={styles.dot}
                  data-active={i === photoIndex}
                  onClick={() => onPhotoChange(i)}
                  aria-label={`Ver foto ${i + 1}`}
                  aria-current={i === photoIndex}
                />
              ))}
            </div>
          </div>

          <div className={styles.sheetContent}>
            <div className={styles.sheetHeaderRow}>
              <span className={styles.sheetCatTag}>{product.category}</span>
              <span
                className={styles.stockBadge}
                data-stock={product.stock}
                style={
                  {
                    "--stock-color": STOCK_COLORS[product.stock],
                  } as CSSProperties
                }
              >
                {STOCK_LABELS[product.stock]}
              </span>
            </div>
            <span className={styles.sheetName}>{product.name}</span>
            <span className={styles.sheetPrice}>{product.price}</span>

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Material</span>
              <span className={styles.detailValue}>{product.material}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Peso</span>
              <span className={styles.detailValue}>{product.weight}</span>
            </div>

            <span className={styles.descTitle}>Descripción</span>
            <span className={styles.descText}>{product.description}</span>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.waButton}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12c0 1.82.5 3.53 1.36 5L2 22l5.2-1.36A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.65 0-3.2-.44-4.55-1.28l-.33-.2-2.9.76.78-2.83-.21-.34A7.94 7.94 0 0 1 4 12c0-4.42 3.58-8 8-8s8 3.58 8 8-3.58 8-8 8z"
                  fill="#EEEEEE"
                />
                <path
                  d="M17 14.4c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.13-.42-2.15-1.33-.8-.71-1.33-1.58-1.49-1.85-.16-.27-.02-.42.13-.56.14-.14.32-.36.48-.54.16-.18.21-.32.32-.54.11-.22.05-.4-.03-.54-.09-.14-.6-1.44-.82-1.97-.22-.53-.44-.46-.61-.47-.16-.01-.35-.01-.54-.01-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.28 0 1.34.98 2.64 1.12 2.83.14.18 1.9 2.9 4.61 3.96 2.71 1.05 2.71.7 3.2.66.49-.05 1.6-.65 1.83-1.28.22-.63.22-1.17.16-1.28-.07-.11-.25-.18-.52-.32z"
                  fill="#EEEEEE"
                />
              </svg>
              <span>Consultar por WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
