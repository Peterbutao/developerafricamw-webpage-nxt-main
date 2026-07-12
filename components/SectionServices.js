import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from '../styles/SectionServices.module.scss'
import { MdSchool, MdBusiness, MdPalette } from 'react-icons/md'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function SectionServices() {
  const sectionRef = useRef(null)
  const headingRef = useRef(null)
  const cardsRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const ctx = gsap.context(() => {
      // Heading animation
      gsap.fromTo(headingRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 85%',
            once: true
          }
        }
      )

      // Service cards stagger from below with scale
      const cards = cardsRef.current?.querySelectorAll('[data-service-card]')
      if (cards) {
        gsap.fromTo(cards,
          { y: 60, scale: 0.95, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, duration: 0.6, stagger: 0.2, ease: 'back.out(1.5)',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 80%',
              once: true
            }
          }
        )

        // Hover animations for each card
        cards.forEach((card) => {
          card.addEventListener('mouseenter', () => {
            gsap.to(card, { y: -8, scale: 1.02, duration: 0.3, ease: 'power2.out' })
          })
          card.addEventListener('mouseleave', () => {
            gsap.to(card, { y: 0, scale: 1, duration: 0.3, ease: 'power2.out' })
          })
        })
      }
    })

    return () => ctx.revert()
  }, [])

  return (
    <section className={styles.services} ref={sectionRef}>
      <div className={styles.sectionContent}>
        <h2 ref={headingRef}>Our Core Services</h2>
        <div className={styles.servicesGrid} ref={cardsRef}>
<div className={styles.serviceCard} data-service-card>
  <div className={styles.serviceHeader}>
    <div className={styles.serviceIcon}>
      <MdSchool />
    </div>
    <h3>Tech Education</h3>
  </div>
  <p>Hands-on coding and digital skills programs for children and young people, empowering the next generation of tech leaders.</p>
</div>
          
<div className={styles.serviceCard} data-service-card>
  <div className={styles.serviceHeader}>
    <div className={styles.serviceIcon}>
      <MdBusiness />
    </div>
    <h3>Consulting</h3>
  </div>
  <p>Project design and digital transformation support for organisations, helping you build sustainable tech solutions.</p>
</div>
          
<div className={styles.serviceCard} data-service-card>
  <div className={styles.serviceHeader}>
    <div className={styles.serviceIcon}>
      <MdPalette />
    </div>
    <h3>Design & Communications</h3>
  </div>
  <p>Infographics, reports, presentations, newsletters, dashboards, and websites that turn your organization's work into something people actually read.</p>
</div>
        </div>
      </div>
    </section>
  )
}