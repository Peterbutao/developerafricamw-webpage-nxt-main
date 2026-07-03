import styles from "../styles/sect5cntct.module.scss"
import BusinessCard from "./bussinesscard.js"

export default function sectionfive() {
  return (
    <article className={styles.contact}>
        <div className={styles.cnt}>
            <header>
                {/* <h1>WHAT WE DO</h1> */}
                <a href="/contact">WORK WITH US &rarr;   </a>
            </header>
            <main>
                <BusinessCard />
            </main>
            <footer>
                <a href="/bussinesscard.png" download="DEVELOPERAFRICAMW | business card 2023">
                    DOWNLOAD OUR BUSINESS CARD &darr;
                </a>
            </footer>
        </div>
    </article>
  )
}
