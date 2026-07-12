import { useEffect, useRef } from "react"
import Image from "next/image"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import styles from "../styles/Sect1hm.module.scss"

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function SectionOneHome() {
  const sectionRef = useRef(null)
  const imageRef = useRef(null)
  const textRef = useRef(null)
  const linkRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const ctx = gsap.context(() => {
      // Logo entrance: scale + rotate
      gsap.fromTo(imageRef.current,
        { scale: 0.5, rotation: -10, opacity: 0 },
        { scale: 1, rotation: 0, opacity: 1, duration: 1, ease: 'elastic.out(1, 0.5)' }
      )

      // Text entrance: fade up with stagger
      const textElements = textRef.current?.querySelectorAll('h1, p')
      if (textElements) {
        gsap.fromTo(textElements,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, stagger: 0.2, delay: 0.5, ease: 'power3.out' }
        )
      }

      // Button entrance
      gsap.fromTo(linkRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, delay: 1, ease: 'back.out(1.7)' }
      )

      // Floating animation on the logo
      gsap.to(imageRef.current, {
        y: -15,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1.5
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    <article className={styles.home} ref={sectionRef}>
        <section>
            <div className={styles.image} ref={imageRef}>
                <Image
                    className={styles.logo}
                    src="/logo.png"
                    alt="Development Africa MW logo"
                    width={300}
                    height={300}
                    priority
                />
            </div>
            <div className={styles.text} ref={textRef}>
                <h1>Building Africa's Future Through Tech & Development</h1>
                <p>
                We help organisations and communities across Malawi grow through
                technology training, capacity development, and project management support.
                </p>
            </div>
            <div className={styles.link} ref={linkRef}>
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