import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import styles from "../styles/footer.module.scss"
import BusinessCard from "./Businesscard"

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

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
  const footerRef = useRef(null)
  const headingRef = useRef(null)
  const linksRef = useRef(null)
  const cardRef = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const ctx = gsap.context(() => {
      // Heading
      gsap.fromTo(headingRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out',
          scrollTrigger: { trigger: headingRef.current, start: 'top 85%', once: true }
        }
      )

      // Link groups stagger
      const linkLists = linksRef.current?.querySelectorAll('ul')
      if (linkLists) {
        gsap.fromTo(linkLists,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.15, ease: 'power3.out',
            scrollTrigger: { trigger: linksRef.current, start: 'top 85%', once: true }
          }
        )
      }

      // Business card
      gsap.fromTo(cardRef.current,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.7, ease: 'back.out(1.5)',
          scrollTrigger: { trigger: cardRef.current, start: 'top 85%', once: true }
        }
      )

      // Bottom links
      gsap.fromTo(bottomRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, delay: 0.3, ease: 'power3.out',
          scrollTrigger: { trigger: bottomRef.current, start: 'top 90%', once: true }
        }
      )
    })

    return () => ctx.revert()
  }, [])

  return (
    <article className={styles.footer} ref={footerRef}>
      <div className={styles.ft}>
        <header ref={headingRef}>
          <h1>DEVELOPMENT AFRICA MW</h1>
        </header>
        <main ref={linksRef}>
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
          <div className={styles.center} ref={cardRef}>
            <BusinessCard />
          </div>
          <div className={styles.bottom} ref={bottomRef}>
            <a href="/bussinesscard.png" download="developer africa mw | 2023 business card">
              DOWNLOAD OUR BUSINESS CARD &rarr;
            </a>
          </div>
        </footer>
      </div>
    </article>
  )
}