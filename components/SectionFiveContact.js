import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import styles from "../styles/sect5cntct.module.scss"
import BusinessCard from "./Businesscard"

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function SectionFiveContact() {
  const sectionRef = useRef(null)
  const headerRef = useRef(null)
  const cardRef = useRef(null)
  const footerRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const ctx = gsap.context(() => {
      // Header link anim
      gsap.fromTo(headerRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out',
          scrollTrigger: { trigger: headerRef.current, start: 'top 85%', once: true }
        }
      )

      // Business card entrance
      gsap.fromTo(cardRef.current,
        { scale: 0.8, rotation: -5, opacity: 0 },
        { scale: 1, rotation: 0, opacity: 1, duration: 0.8, ease: 'back.out(1.7)',
          scrollTrigger: { trigger: cardRef.current, start: 'top 80%', once: true }
        }
      )

      // Footer download link
      gsap.fromTo(footerRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, delay: 0.3, ease: 'power3.out',
          scrollTrigger: { trigger: footerRef.current, start: 'top 90%', once: true }
        }
      )
    })

    return () => ctx.revert()
  }, [])

  return (
    <article className={styles.contact} ref={sectionRef}>
        <div className={styles.cnt}>
            <header ref={headerRef}>
                <a href="/contact">WORK WITH US &rarr;</a>
            </header>
            <main ref={cardRef}>
                <BusinessCard />
            </main>
            <footer ref={footerRef}>
                <a href="/bussinesscard.png" download="DEVELOPERAFRICAMW | business card 2023">
                    DOWNLOAD OUR BUSINESS CARD &darr;
                </a>
            </footer>
        </div>
    </article>
  )
}