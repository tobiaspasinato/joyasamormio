export type StockLevel = "stock" | "low" | "out";

/** Código de categoría tal como viene de la planilla de SheetDB. */
export type CategoryCode = "gold" | "silver" | "surgicalsteel" | "variety";

export interface Product {
  id: number;
  category: string;
  name: string;
  price: string;
  material: string;
  /** Fotos reales traídas de la planilla, en el orden en que vinieron. Puede estar vacío. */
  images: string[];
  stock: StockLevel;
  description: string;
}

/** Código de categoría (tal cual lo escribe la planilla) → label en español. */
export const CATEGORY_LABELS: Record<CategoryCode, string> = {
  gold: "Oro",
  silver: "Plata",
  surgicalsteel: "Acero quirúrgico",
  variety: "Variedad",
};

export const CATEGORIES = [
  "Todos",
  ...Object.values(CATEGORY_LABELS),
] as const;

/** Se muestra cuando un producto no trajo ninguna foto desde la planilla. */
export const NO_PHOTO_LABEL = "foto no disponible";

export const STOCK_LABELS: Record<StockLevel, string> = {
  stock: "En stock",
  low: "Últimas unidades",
  out: "Sin stock",
};

/* Paleta Noir: oro para disponible, cobre para lo que se está por acabar y el
   gris cálido del pie de página para lo agotado. */
export const STOCK_COLORS: Record<StockLevel, string> = {
  stock: "#C9A24B",
  low: "#C97B3F",
  out: "#75695A",
};
