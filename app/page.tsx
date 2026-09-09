import Image from "next/image";
import NavBar from "../components/NavBar";
import styles from "./page.module.css";

const ADDRESS = "Av. Santa Fe 2456, CABA, Argentina";
const MAP_QUERY = encodeURIComponent(ADDRESS);

export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.bgLayer} aria-hidden>
        <div className={`${styles.shape} ${styles.shape1}`} />
        <div className={`${styles.shape} ${styles.shape2}`} />
        <div className={`${styles.shape} ${styles.shape3}`} />
        <div className={`${styles.shape} ${styles.shape4}`} />
        <div className={`${styles.shape} ${styles.shape5}`} />
        <div className={`${styles.shape} ${styles.shape6}`} />
      </div>

      <NavBar />

      <section className={styles.hero}>
        <div className={styles.heroTextCol}>
          <span className={styles.eyebrow}>Sobre el local</span>
          <p className={styles.heroPara}>
            Joyería en oro, plata y acero quirúrgico, elegida para el uso
            diario. Trabajamos con materiales que no se manchan ni pierden
            brillo, para que cada pieza acompañe sin pedir cuidados especiales.
          </p>
        </div>
        <div className={styles.heroImageCol}>
          <div className={styles.heroImageFrame}>
            <Image
              src="/hero-joya.webp"
              alt="Joya destacada en primer plano"
              fill
              priority
              sizes="(max-width: 899px) 100vw, 45vw"
              className={styles.heroImage}
            />
          </div>
          <div className={`${styles.behindPanel} ${styles.behindPanelTop}`} />
          <div
            className={`${styles.behindPanel} ${styles.behindPanelBottom}`}
          />
        </div>
      </section>

      <section id="contacto" className={styles.find}>
        <div className={styles.mapCol}>
          <iframe
            className={styles.mapFrame}
            src={`https://www.google.com/maps?q=${MAP_QUERY}&output=embed`}
            loading="lazy"
            title="Ubicación de Joyasamormio"
          />
        </div>
        <div className={styles.findTextCol}>
          <span className={styles.eyebrow}>Cómo encontrarnos</span>
          <span className={styles.address}>{ADDRESS}</span>
          <span className={styles.hours}>Lunes a sábado, de 10 a 19h</span>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${MAP_QUERY}`}
            className={styles.directionsLink}
            target="_blank"
            rel="noreferrer"
          >
            Ver cómo llegar →
          </a>
        </div>
      </section>
    </div>
  );
}
