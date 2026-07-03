import styles from "../styles/sect4banner.module.scss"
import { useState, useRef, useEffect } from "react"
import { supabase } from "../lib/supabase"

export default function sectionfour() {
  const [courses, setCourses] = useState([])
  const [startX, setStartX] = useState(0)
  const scrollContainer = useRef(null)

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

  const handleMouseDown = (e) => {
    if (window.innerWidth > 700) {
      setStartX(e.clientX)
    }
  }

  const handleMouseMove = (e) => {
    if (startX === 0 || window.innerWidth <= 700) return
    const diff = startX - e.clientX
    if (scrollContainer.current) {
      scrollContainer.current.scrollLeft += diff
    }
    setStartX(e.clientX)
  }

  const handleMouseUp = () => {
    setStartX(0)
  }

  return (
    <article className={styles.banner}>
        <div className={styles.artbn}>
          
            <div className={styles.coursesCarousel}>
              <div 
                ref={scrollContainer}
                className={styles.coursesScroll}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {courses.map((course, idx) => (
                  <div key={course.id || idx} className={styles.courseCard}>
                    <h3>{course.name}</h3>
                    <p>{course.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <a href="/courses">organisation Courses &rarr;</a>
            <p>
                <span>From community challenges</span><span>to real development solutions</span>
            </p>
            <a href="/approach">Our Approach &rarr;</a>

        </div>
    </article>
  )
}
