import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import styles from "../styles/sect7edu.module.scss"
import Image from "next/image"
import { MdGroups, MdSchool, MdInsights } from "react-icons/md"

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function SectionSevenEdu() {
  const sectionRef = useRef(null)
  const headerRef = useRef(null)
  const iconsRef = useRef(null)
  const textRef = useRef(null)
  const imageRef = useRef(null)
  const linksRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const ctx = gsap.context(() => {
      // Header animation
      const headerElements = headerRef.current?.querySelectorAll('h1, p')
      if (headerElements) {
        gsap.fromTo(headerElements,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: 'power3.out',
            scrollTrigger: { trigger: headerRef.current, start: 'top 85%', once: true }
          }
        )
      }

      // Icons stagger in with bounce
      const icons = iconsRef.current?.querySelectorAll('span')
      if (icons) {
        gsap.fromTo(icons,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, stagger: 0.15, ease: 'back.out(2)',
            scrollTrigger: { trigger: iconsRef.current, start: 'top 80%', once: true }
          }
        )
      }

      // Text stagger
      const textSpans = textRef.current?.querySelectorAll('span')
      if (textSpans) {
        gsap.fromTo(textSpans,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.2, ease: 'power3.out',
            scrollTrigger: { trigger: textRef.current, start: 'top 85%', once: true }
          }
        )
      }

      // Image entrance
      gsap.fromTo(imageRef.current,
        { scale: 0.7, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.7, ease: 'back.out(1.5)',
          scrollTrigger: { trigger: imageRef.current, start: 'top 85%', once: true }
        }
      )

      // Links stagger
      const links = linksRef.current?.querySelectorAll('a')
      if (links) {
        gsap.fromTo(links,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, stagger: 0.15, ease: 'power3.out',
            scrollTrigger: { trigger: linksRef.current, start: 'top 90%', once: true }
          }
        )
      }
    })

    return () => ctx.revert()
  }, [])

  return (
    <article className={styles.edu} ref={sectionRef}>
      <div className={styles.artedu}>
        <header ref={headerRef}>
          <h1>BUILD PRACTICAL DEVELOPMENT SOLUTIONS WITH US</h1>
          <p>
            <span>Partner with </span>
            <span><strong>DEVELOPMENT AFRICA MW</strong> to strengthen skills, systems, and community impact.</span>
          </p>
        </header>

        <main>
          <div className={styles.logos} ref={iconsRef}>
            <span aria-label="Community partnerships"><MdGroups /></span>
            <span aria-label="Tech education"><MdSchool /></span>
            <span aria-label="Impact systems"><MdInsights /></span>
          </div>

          <div className={styles.text} ref={textRef}>
            <span>TECH EDUCATION, PROJECT SUPPORT, AND COMMUNICATION TOOLS </span>
            <span>FOR ORGANISATIONS SERVING COMMUNITIES IN MALAWI</span>
          </div>

          <div className={styles.image} ref={imageRef}>
            <Image
              src="/edu.png"
              alt="Development Africa MW learning and community support illustration"
              className="eduimage"
              width={180}
              height={180}
            />
          </div>
        </main>

        <footer ref={linksRef}>
          <a href="/courses">EXPLORE COURSES &rarr;</a>
          <a href="/about">LEARN ABOUT OUR WORK &rarr;</a>
        </footer>
      </div>
    </article>
  )
}