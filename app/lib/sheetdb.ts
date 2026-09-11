import {
  CATEGORY_LABELS,
  type CategoryCode,
  type Product,
  type StockLevel,
} from "../products";

/** Fila cruda tal como la devuelve la API de SheetDB. */
interface SheetDBRow {
  id: string;
  name: string;
  descripcion: string;
  price: string;
  category: string;
  material: string;
  stock: string;
  // Columnas de foto: `image`, y opcionalmente `image2`, `image3`, etc. si la
  // planilla llega a sumar más adelante. El carrusel solo muestra las que
  // vengan con datos.
  [key: `image${string}`]: string | undefined;
}

/** Junta `image`, `image2`, `image3`... en orden, descartando las vacías. */
function collectImages(row: SheetDBRow): string[] {
  return Object.keys(row)
    .filter((key) => /^image\d*$/.test(key))
    .sort()
    .map((key) => row[key as `image${string}`])
    .filter((value): value is string => Boolean(value && value.trim()));
}

/** `1-2` últimas unidades, `3+` en stock. Los productos con `0` no llegan acá: se filtran antes. */
function toStockLevel(quantity: number): StockLevel {
  if (quantity <= 2) return "low";
  return "stock";
}

function normalizeProduct(row: SheetDBRow): Product {
  const category = CATEGORY_LABELS[row.category as CategoryCode] ?? row.category;

  return {
    id: Number(row.id),
    category,
    name: row.name,
    price: `$ ${Number(row.price).toLocaleString("es-AR")}`,
    material: row.material,
    images: collectImages(row),
    stock: toStockLevel(Number(row.stock)),
    description: row.descripcion,
  };
}

/**
 * Trae el catálogo desde SheetDB. Sin caché: cada visita a `/catalog` pide
 * los datos frescos, así un cambio de precio o stock en la planilla se ve
 * de inmediato.
 */
export async function getProducts(): Promise<Product[]> {
  const url = process.env.SHEETDB_API_URL;
  if (!url) {
    console.error("SHEETDB_API_URL no está configurada.");
    return [];
  }

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      console.error(`SheetDB respondió ${res.status}`);
      return [];
    }
    const rows: SheetDBRow[] = await res.json();
    // Sin stock no se muestra en el catálogo.
    return rows.filter((row) => Number(row.stock) > 0).map(normalizeProduct);
  } catch (err) {
    console.error("No se pudo obtener el catálogo de SheetDB:", err);
    return [];
  }
}
