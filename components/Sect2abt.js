import Image from "next/image"
import styles from "../styles/Sect2abt.module.scss"
export default function sectiontwo() {
  return (
    <article className={styles.abtcard}>
        <header>
            <div className={styles.abtcdimgs}>
                
                <span>
                    <Image
                            className={styles.logo}
                            src="/brand2.png"
                            alt="brand logo"
                            width={350}
                            height={350}
                            priority
                    />
                </span>

                <span>
                    <Image
                            className={styles.logo}
                            src="/brand1.png"
                            alt="brand logo"
                            width={350}
                            height={350}
                            priority
                    />                
                </span>
                <span>
                    <Image
                            className={styles.logo}
                            src="/brand3.png"
                            alt="brand logo"
                            width={350}
                            height={350}
                            priority
                    />
                </span>
            </div>
        </header>
        <main>
            <div className={styles.mn}>
                <h1>
                    <span>TRUSTED BY LEADING</span><span>ORGANISATIONS & PARTNERS</span>
                </h1>
                <p> 
                    Development Africa MW is a Malawian organisation working at the
                    intersection of technology and community development. We believe
                    lasting change comes from people who have the skills, tools, and
                    systems to keep building after we've left the room.
                </p>
                <p>&</p>
                <p>
                    We're expert consultants in project development, tech integration,
                    and Monitoring &amp; Evaluation — helping organisations across Africa
                    turn that belief into practice.
 
                </p>
            </div>
        </main>
        <footer>
            <div className={styles.abtlink}>
                <a href="/about">ABOUT DEVELOPMENT AFRICA &rarr;</a>
            </div>
        </footer>
    </article>
  )
}
