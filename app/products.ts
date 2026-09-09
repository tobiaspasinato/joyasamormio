export type StockLevel = "stock" | "low" | "out";

export interface Product {
  id: number;
  category: string;
  name: string;
  price: string;
  material: string;
  weight: string;
  stock: StockLevel;
  description: string;
}

/** Número de WhatsApp del negocio, en formato internacional sin `+`. */
export const WHATSAPP_NUMBER = "5490000000000";

export const CATEGORIES = [
  "Todos",
  "Oro",
  "Plata",
  "Acero quirúrgico",
  "Variedad",
] as const;

export const PHOTO_LABELS = [
  "foto: vista frontal",
  "foto: detalle / cierre",
  "foto: puesto en modelo",
];

export const STOCK_LABELS: Record<StockLevel, string> = {
  stock: "En stock",
  low: "Últimas unidades",
  out: "Sin stock",
};

export const STOCK_COLORS: Record<StockLevel, string> = {
  stock: "#76ABAE",
  low: "#E0B75C",
  out: "#8A8F98",
};

export const PRODUCTS: Product[] = [
  {
    id: 1,
    category: "Oro",
    name: "Anillo Solitario 18k",
    price: "$ 189.000",
    material: "Oro amarillo 18k",
    weight: "3.2 g",
    stock: "stock",
    description:
      "Anillo solitario clásico en oro amarillo de 18 quilates, con circonia central de 4mm. Pieza atemporal, ideal para uso diario o como regalo de compromiso.",
  },
  {
    id: 2,
    category: "Oro",
    name: "Cadena Barbada 45cm",
    price: "$ 245.000",
    material: "Oro amarillo 18k",
    weight: "5.8 g",
    stock: "stock",
    description:
      "Cadena de eslabones barbados macizos, terminación pulida a espejo. Cierre de mosquetón reforzado, largo 45cm.",
  },
  {
    id: 3,
    category: "Oro",
    name: "Aros Argolla Chicos",
    price: "$ 96.000",
    material: "Oro amarillo 18k",
    weight: "1.4 g",
    stock: "low",
    description:
      "Argollas pequeñas de 10mm de diámetro, livianas para uso diario. Cierre a presión de seguridad.",
  },
  {
    id: 4,
    category: "Plata",
    name: "Anillo Trenzado",
    price: "$ 34.000",
    material: "Plata 925",
    weight: "2.9 g",
    stock: "stock",
    description:
      "Anillo de diseño trenzado en plata 925 con baño de rodio, evita el oscurecimiento natural de la plata y mantiene el brillo por más tiempo.",
  },
  {
    id: 5,
    category: "Plata",
    name: "Cadena Cubana 50cm",
    price: "$ 52.000",
    material: "Plata 925",
    weight: "8.1 g",
    stock: "stock",
    description:
      "Cadena cubana de eslabones planos entrelazados, un clásico versátil que combina con cualquier colgante.",
  },
  {
    id: 6,
    category: "Plata",
    name: "Dije Luna y Estrella",
    price: "$ 21.000",
    material: "Plata 925",
    weight: "1.1 g",
    stock: "out",
    description:
      "Dije delicado con motivo de luna y estrella, incluye cadena fina de 40cm. Se agotó por alta demanda, consultá por reposición.",
  },
  {
    id: 7,
    category: "Acero quirúrgico",
    name: "Pulsera Eslabón Cubano",
    price: "$ 18.500",
    material: "Acero quirúrgico 316L",
    weight: "14 g",
    stock: "stock",
    description:
      "Pulsera robusta de acero quirúrgico hipoalergénico, no se mancha ni se oxida con el uso diario ni el contacto con agua.",
  },
  {
    id: 8,
    category: "Acero quirúrgico",
    name: "Aros Mini Aro Dorado",
    price: "$ 9.800",
    material: "Acero quirúrgico dorado PVD",
    weight: "0.6 g",
    stock: "stock",
    description:
      "Aros diminutos con baño dorado PVD de alta durabilidad, ideales para piercing de segundo agujero o uso diario sin quitar.",
  },
  {
    id: 9,
    category: "Variedad",
    name: "Set Anillos Apilables",
    price: "$ 15.200",
    material: "Acero + baño oro",
    weight: "4.5 g",
    stock: "stock",
    description:
      "Set de 3 anillos finos para combinar y apilar entre sí. Ideal para regalo o para armar tu propio combo de estilo.",
  },
  {
    id: 10,
    category: "Variedad",
    name: "Collar Perlas Cultivadas",
    price: "$ 42.000",
    material: "Perla cultivada + plata 925",
    weight: "6 g",
    stock: "stock",
    description:
      "Collar de perlas cultivadas de agua dulce, broche de plata 925. Pieza elegante para looks formales.",
  },
];
