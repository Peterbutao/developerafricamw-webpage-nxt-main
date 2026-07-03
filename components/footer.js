import styles from "../styles/footer.module.scss"
import BusinessCard from "./bussinesscard"

const groups = [
  ['START LEARNING', [
    ['Learning journey', '/edu#learningjourney'],
    ['Courses', '/edu#courses'],
    ['Resources', '/edu#resources']
  ]],
  ['ABOUT DEVELOPMENT AFRICA MW', [
    ['Careers', '/about#careers'],
    ['News', '/blog'],
    ['Goals and values', '/about#goalsandvalues']
  ]],
  ['COMPANY', [
    ['Support us', '/'],
    ['Help and feedback', '/contact'],
    ['About', '/about']
  ]],
  ['CONTACT DEVELOPMENT AFRICA MW', [
    ['developerafricamw@gmail.com', 'mailto:developerafricamw@gmail.com'],
    ['0880164455', 'tel:0880164455'],
    ['Twitter', 'https://twitter.com'],
    ['Facebook', 'https://facebook.com'],
    ['Instagram', 'https://instagram.com'],
    ['LinkedIn', 'https://linkedin.com'],
    ['GitHub', 'https://github.com']
  ]]
]

export default function Footer() {
  return (
    <article className={styles.footer}>
      <div className={styles.ft}>
        <header>
          <h1>DEVELOPMENT AFRICA MW</h1>
        </header>
        <main>
          {groups.map(([title, links]) => (
            <ul key={title}>
              <h1>{title}</h1>
              {links.map(([label, href]) => (
                <li key={label}>
                  <a href={href}>{label}</a>
                </li>
              ))}
            </ul>
          ))}
        </main>
        <footer>
          <div className={styles.head}>
            <h1>Created by <a href="/author">BUTAO PETER | DEVELOPMENT AFRICA MW</a></h1>
          </div>
          <div className={styles.center}>
            <BusinessCard />
          </div>
          <div className={styles.bottom}>
            <a href="/bussinesscard.png" download="developer africa mw | 2023 business card">
              DOWNLOAD OUR BUSINESS CARD &rarr;
            </a>
          </div>
        </footer>
      </div>
    </article>
  )
}
