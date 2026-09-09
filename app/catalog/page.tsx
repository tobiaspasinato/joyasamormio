import type { Metadata } from "next";

import NavBar from "../components/NavBar";
import Catalog from "./catalog";

export const metadata: Metadata = {
  title: "Catálogo | Joyasamormio",
  description:
    "Catálogo de joyas en oro, plata, acero quirúrgico y variedad. Consultá por WhatsApp.",
};

export default function CatalogPage() {
  return (
    <>
      <NavBar />
      <Catalog />
    </>
  );
}
