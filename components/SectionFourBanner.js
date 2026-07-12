import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import styles from "../styles/sect4banner.module.scss"
import { useState } from "react"
import { supabase } from "../lib/supabase"

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function SectionFourBanner() {
  const [courses, setCourses] = useState([])
  const [startX, setStartX] = useState(0)
  const scrollContainer = useRef(null)
  const sectionRef = useRef(null)
  const linksRef = useRef(null)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('id, name, description')
          .limit(6)
          .order('name')

        if (error) throw error
        setCourses(data || [])
      } catch (err) {
        console.log('Error loading courses:', err.message)
      }
    }

    fetchCourses()
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const ctx = gsap.context(() => {
      // Carousel entrance
      if (scrollContainer.current) {
        gsap.fromTo(scrollContainer.current,
          { x: -80, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
              once: true
            }
          }
        )
      }

      // Links stagger in
      const links = linksRef.current?.querySelectorAll('a, p')
      if (links) {
        gsap.fromTo(links,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.15, ease: 'power3.out',
            scrollTrigger: {
              trigger: linksRef.current,
              start: 'top 85%',
              once: true
            }
          }
        )
      }
    })

    return () => ctx.revert()
  }, [courses])

  const handleMouseDown = (e) => {
    setStartX(e.clientX)
  }

  const handleMouseMove = (e) => {
    if (startX === 0) return
    const diff = startX - e.clientX
    if (scrollContainer.current) {
      scrollContainer.current.scrollLeft += diff
    }
    setStartX(e.clientX)
  }

  const handleMouseUp = () => {
    setStartX(0)
  }

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX)
  }

  const handleTouchMove = (e) => {
    if (startX === 0) return
    const diff = startX - e.touches[0].clientX
    if (scrollContainer.current) {
      scrollContainer.current.scrollLeft += diff
    }
    setStartX(e.touches[0].clientX)
  }

  const handleTouchEnd = () => {
    setStartX(0)
  }

  return (
    <article className={styles.banner} ref={sectionRef}>
        <div className={styles.artbn}>
          
            <div className={styles.coursesCarousel}>
              <div 
                ref={scrollContainer}
                className={styles.coursesScroll}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {courses.map((course, idx) => (
                  <div key={course.id || idx} className={styles.courseCard}>
                    <h3>{course.name}</h3>
                    <p>{course.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div ref={linksRef}>
              <a href="/courses">Our Courses &rarr;</a>
              <p>
                  <span>From community challenges</span><span>to real development solutions</span>
              </p>
              <a href="/approach">Our Approach &rarr;</a>
            </div>

        </div>
    </article>
  )
}