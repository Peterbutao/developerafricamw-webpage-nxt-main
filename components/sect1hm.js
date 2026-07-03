import Image from "next/image"
import styles from "../styles/Sect1hm.module.scss"

export default function sectionone() {
  return (
    <article className={styles.home}>
        <section>
            <div className={styles.image}>
                <Image
                    className={styles.logo}
                    src="/logo.png"
                    alt="developer africa logo"
                    width={300}
                    height={300}
                    priority
                />

            </div>
            <div className={styles.text}>
                <h1>Building Africa's Future Through Tech & Development</h1>
                <p>
                We help organisations and communities across Malawi grow through
                technology training, capacity development, and project management support.
                </p>
            </div>
            <div className={styles.link}>
                <a
                    href="/partner"
                    className={styles.hirelink}
                    rel="noopener noreferrer"
                >
                    PARTNER WITH US &rarr;
                </a>
            </div>
        </section>
    </article>
  )
}
