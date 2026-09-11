import type { Metadata } from "next";

import { getProducts } from "../lib/sheetdb";
import Catalog from "./catalog";

export const metadata: Metadata = {
  title: "Catálogo | Joyasamormio",
  description:
    "Catálogo de joyas en oro, plata, acero quirúrgico y variedad. Consultá por WhatsApp.",
};

export default async function CatalogPage({
  searchParams,
}: PageProps<"/catalog">) {
  // La home enlaza cada material como `/catalog?categoria=Oro`. Leerlo acá, y
  // no con `useSearchParams`, deja la grilla ya filtrada en el HTML.
  const { categoria } = await searchParams;
  const products = await getProducts();

  // `key`: navegar a otra categoría remonta el catálogo con ese filtro.
  return (
    <Catalog
      key={typeof categoria === "string" ? categoria : "todos"}
      products={products}
      requestedCategory={typeof categoria === "string" ? categoria : null}
    />
  );
}
