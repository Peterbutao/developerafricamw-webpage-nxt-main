import { useEffect, useRef } from "react"
import Image from "next/image"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import styles from "../styles/Sect2abt.module.scss"

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function SectionTwoAbout() {
  const sectionRef = useRef(null)
  const imagesRef = useRef(null)
  const textRef = useRef(null)
  const linkRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const ctx = gsap.context(() => {
      // Brand images stagger in from left
      const brandImages = imagesRef.current?.querySelectorAll('span')
      if (brandImages) {
        gsap.fromTo(brandImages,
          { x: -60, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
              once: true
            }
          }
        )
      }

      // Text content fade up
      const textElements = textRef.current?.querySelectorAll('h1, p')
      if (textElements) {
        gsap.fromTo(textElements,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: 'power3.out',
            scrollTrigger: {
              trigger: textRef.current,
              start: 'top 85%',
              once: true
            }
          }
        )
      }

      // Link button
      gsap.fromTo(linkRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out',
          scrollTrigger: {
            trigger: linkRef.current,
            start: 'top 90%',
            once: true
          }
        }
      )
    })

    return () => ctx.revert()
  }, [])

  return (
    <article className={styles.abtcard} ref={sectionRef}>
        <header>
            <div className={styles.abtcdimgs} ref={imagesRef}>
                <span>
                    <Image className={styles.logo} src="/brand2.png" alt="Partner logo - brand 2" width={280} height={280} priority />
                </span>
                <span>
                    <Image className={styles.logo} src="/brand1.png" alt="Partner logo - brand 1" width={280} height={280} priority />
                </span>
                <span>
                    <Image className={styles.logo} src="/brand3.png" alt="Partner logo - brand 3" width={280} height={280} priority />
                </span>
                <span>
                    <Image className={styles.logo} src="/brand4.png" alt="Partner logo - brand 4" width={280} height={280} priority />
                </span>
            </div>
        </header>
        <main>
            <div className={styles.mn} ref={textRef}>
                <h1><span>TRUSTED BY LEADING</span><span>ORGANISATIONS & PARTNERS</span></h1>
                <p> 
                    Development Africa MW is a Malawian organisation working at the
                    intersection of technology and community development. We believe
                    lasting change comes from people who have the skills, tools, and
                    systems to keep building after we've left the room.
                </p>
                <p>&</p>
                <p>
                    We're expert consultants in project development, tech integration,
                    and Monitoring & Evaluation — helping organisations across Africa
                    turn that belief into practice.
                </p>
            </div>
        </main>
        <footer>
            <div className={styles.abtlink} ref={linkRef}>
                <a href="/about">ABOUT DEVELOPMENT AFRICA &rarr;</a>
            </div>
        </footer>
    </article>
  )
}