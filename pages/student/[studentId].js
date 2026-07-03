import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Layout from "/components/Layout"
import styles from '../../styles/student.module.scss'

export const config = {
  runtime: 'experimental-edge',  // Changed from 'edge'
};



export default function StudentProfile({ studentId }) {
  const [student, setStudent] = useState(null)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStudentData = async () => {
      setLoading(true)
      setCourses([])
      try {
        // Fetch student by studentId (not the UUID id)
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('*')
          .eq('studentid', studentId)
          .maybeSingle()

        if (studentError) throw studentError
        if (!studentData) {
          setStudent(null)
          setLoading(false)
          return
        }

        setStudent(studentData)

        // Fetch enrollments for this student
        const { data: enrollmentsData, error: enrollmentsError } = await supabase
          .from('enrollments')
          .select('*')
          .eq('studentId', studentData.id)

        if (enrollmentsError) throw enrollmentsError

        // Fetch course details for each enrollment
        if (enrollmentsData && enrollmentsData.length > 0) {
          const courseIds = enrollmentsData.map(e => e.courseId)
          const { data: coursesData, error: coursesError } = await supabase
            .from('courses')
            .select('*')
            .in('id', courseIds)

          if (coursesError) throw coursesError

          // Merge enrollment data with course data
          const enrolledCourses = enrollmentsData.map(enrollment => {
            const course = coursesData.find(c => c.id === enrollment.courseId)
            return course ? { ...course, completed: enrollment.completed, completionDate: enrollment.completionDate } : null
          }).filter(Boolean)

          setCourses(enrolledCourses)
        }
      } catch (err) {
        console.error('Error fetching student data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStudentData()
  }, [studentId])

  if (loading) {
    return (
      <Layout title="Student Profile">
        <div className={styles.container}>
          <div className={styles.loading}>
            <h1>Loading Student Profile</h1>
            <p>Please wait while we check the student record.</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!student) {
    return (
      <Layout title="Student Profile">
        <div className={styles.container}>
          <div className={styles.error}>
            <h1>Student Not Found</h1>
            <p>The student profile you're looking for doesn't exist.</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Student Profile">
      <div className={styles.container}>
        <div className={styles.profileCard}>
          <header className={styles.profileHeader}>
            <div className={styles.avatar}>
              {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <div className={styles.headerInfo}>
              <p className={styles.eyebrow}>Development Africa MW Learner Profile</p>
              <h1>{student.name}</h1>
              <p className={styles.studentId}>Student ID: {student.studentid}</p>
              <div className={styles.contactInfo}>
                {student.email && <p>Email: {student.email}</p>}
                {student.phone && <p>Phone: {student.phone}</p>}
              </div>
            </div>
          </header>

          <section className={styles.coursesSection}>
            <h2>Learning Record</h2>
            {courses.length === 0 ? (
              <p className={styles.noCourses}>No courses have been added to this learner profile yet.</p>
            ) : (
              <div className={styles.coursesList}>
                {courses.map((course, index) => (
                  <div key={index} className={styles.courseCard}>
                    <div className={styles.courseInfo}>
                      <h3>{course.name}</h3>
                      {course.description && <p>{course.description}</p>}
                      {course.duration && <p>Duration: {course.duration}</p>}
                      <p className={course.completed ? styles.completed : styles.inProgress}>
                        {course.completed ? 'Completed' : 'In Progress'}
                      </p>
                      {course.completionDate && (
                        <p>Completed: {new Date(course.completionDate).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className={styles.noteSection}>
            <h2>Record Summary</h2>
            <p>
              This page shows the learner details and course progress currently
              registered with Development Africa MW.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  )
}

export async function getServerSideProps(context) {
  const { studentId } = context.params
  return {
    props: {
      studentId
    }
  }
}
