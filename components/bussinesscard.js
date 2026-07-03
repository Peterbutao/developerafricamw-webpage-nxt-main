import Image from "next/image"
import styles from "../styles/bussinesscard.module.scss"

export default function BusinessCard() {
  return (
    <article className={styles.bussinesscard}>
      <div className={styles.bcrd}>
        <header>
          <h1>DEVELOPMENT AFRICA MW</h1>
        </header>
        <main>
          <div className={styles.info}>
            <section>
              <h2><a href="mailto:developerafricamw@gmail.com">developerafricamw@gmail.com</a></h2>
              <h2><a href="tel:0880164455">0880164455</a></h2>
            </section>
            <Image src="/qr.png" alt="QR code" width={45} height={45} />
          </div>
          <div className={styles.logo}>
            <Image src="/logo1.png" alt="Development Africa MW" width={100} height={100} />
          </div>
        </main>
      </div>
    </article>
  )
}
