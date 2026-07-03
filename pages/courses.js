import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Layout from "/components/Layout"
import styles from '../styles/courses.module.scss'

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('id, name, description, duration')
          .order('name')

        if (error) throw error
        setCourses(data || [])
      } catch (err) {
        setError(err.message || 'Failed to load courses. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  if (loading) {
    return (
      <Layout title="Courses | Development Africa MW">
        <main className={styles.coursesPage}>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <p>Our Courses</p>
              <h2>Loading available courses...</h2>
            </div>
          </section>
        </main>
      </Layout>
    )
  }

  return (
    <Layout title="Courses | Development Africa MW">
      <main className={styles.coursesPage}>
        <section className={styles.intro}>
          <p className={styles.eyebrow}>Learning Programs</p>
          <div className={styles.introGrid}>
            <h1>Courses designed for practical impact in Malawi.</h1>
            <div>
              <p>
                Our courses combine technical skills with development context, preparing
                participants to build solutions that address real challenges in their communities.
              </p>
              <p>
                Each program includes hands-on projects, mentorship, and ongoing support
                to ensure you can apply what you learn immediately.
              </p>
            </div>
          </div>
        </section>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <p>Available Programs</p>
            <h2>Join a course that builds your future</h2>
          </div>
          
          {courses.length === 0 && !error ? (
            <div className={styles.empty}>
              <p>No courses are currently available. Please check back soon or contact us for more information.</p>
              <a href="/contact">Contact Us &rarr;</a>
            </div>
          ) : (
            <div className={styles.coursesGrid}>
              {courses.map((course) => (
                <article key={course.id} className={styles.courseCard}>
                  <div className={styles.courseContent}>
                    <h3>{course.name}</h3>
                    {course.duration && (
                      <span className={styles.duration}>{course.duration}</span>
                    )}
                    <p>{course.description || 'Practical training in technology and development skills.'}</p>
                  </div>
                  <a href="/register" className={styles.registerButton}>
                    Register Now &rarr;
                  </a>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className={styles.cta}>
          <h2>Have questions about our courses?</h2>
          <a href="/contact">Get in Touch &rarr;</a>
        </section>
      </main>
    </Layout>
  )
}