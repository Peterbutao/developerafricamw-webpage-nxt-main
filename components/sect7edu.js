import styles from "../styles/sect7edu.module.scss"
import Image from "next/image"
import { MdGroups, MdSchool, MdInsights } from "react-icons/md"

export default function sectionseven() {
  return (
    <article className={styles.edu}>
      <div className={styles.artedu}>
        <header>
          <h1>BUILD PRACTICAL DEVELOPMENT SOLUTIONS WITH US</h1>
          <p>
            <span>Partner with </span>
            <span><strong>DEVELOPMENT AFRICA MW</strong> to strengthen skills, systems, and community impact.</span>
          </p>
        </header>

        <main>
          <div className={styles.logos}>
            <span aria-label="Community partnerships">
              <MdGroups />
            </span>
            <span aria-label="Tech education">
              <MdSchool />
            </span>
            <span aria-label="Impact systems">
              <MdInsights />
            </span>
          </div>

          <div className={styles.text}>
            <span>TECH EDUCATION, PROJECT SUPPORT, AND COMMUNICATION TOOLS </span>
            <span>FOR ORGANISATIONS SERVING COMMUNITIES IN MALAWI</span>
          </div>

          <div className={styles.image}>
            <Image
              src="/edu.png"
              alt="Development Africa MW learning and community support"
              className="eduimage"
              width={180}
              height={180}
            />
          </div>
        </main>

        <footer>
          <a href="/courses">EXPLORE COURSES &rarr;</a>
          <a href="/about">LEARN ABOUT OUR WORK &rarr;</a>
        </footer>
      </div>
    </article>
  )
}
