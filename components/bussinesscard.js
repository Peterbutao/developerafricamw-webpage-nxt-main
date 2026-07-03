import Image from "next/image"
import styles from "../styles/bussinesscard.module.scss"

export default function BusinessCard() {
  return (
    <article className={styles.bussinesscard}>
      <div className={styles.bcrd}>
        <header>
          <h1>DEVELOPMENT AFRICA MW</h1>
        </header>
        <div className={styles.mainRow}>
          <div className={styles.info}>
            <section>
              <h2><a href="mailto:developerafricamw@gmail.com">developerafricamw@gmail.com</a></h2>
              <h2><a href="tel:0880164455">0880164455</a></h2>
            </section>
            <div className={styles.qrWrapper}>
              <Image src="/qr.png" alt="QR code" fill style={{ objectFit: 'contain' }} />
            </div>
          </div>
          <div className={styles.logo}>
            <div className={styles.logoWrapper}>
              <Image src="/logo1.png" alt="Development Africa MW" fill style={{ objectFit: 'contain' }} />
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
