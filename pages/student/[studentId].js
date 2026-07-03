import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import Layout from "/components/Layout"
import styles from '../../styles/student.module.scss'

const normalizeEnrollment = (enrollment) => ({
  ...enrollment,
  studentId: enrollment.studentId ?? enrollment.student_id,
  courseId: enrollment.courseId ?? enrollment.course_id,
  completionDate: enrollment.completionDate ?? enrollment.completion_date
})

export default function StudentProfile() {
  const router = useRouter()
  const { studentId } = router.query
  
  const [student, setStudent] = useState(null)
  const [courses, setCourses] = useState([])
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!studentId) return
    
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
        const normalizedEnrollments = (enrollmentsData || []).map(normalizeEnrollment)

        // Fetch course details for each enrollment
        if (normalizedEnrollments.length > 0) {
          const courseIds = normalizedEnrollments.map(e => e.courseId)
          const { data: coursesData, error: coursesError } = await supabase
            .from('courses')
            .select('*')
            .in('id', courseIds)

          if (coursesError) throw coursesError

          // Merge enrollment data with course data
          const enrolledCourses = normalizedEnrollments.map(enrollment => {
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

  useEffect(() => {
    if (!student) return

    const generateStudentQr = async () => {
      const QRCode = (await import('qrcode')).default
      const profileUrl = `${window.location.origin}/student/${student.studentid}`
      const qrDataUrl = await QRCode.toDataURL(JSON.stringify({
        studentId: student.studentid,
        name: student.name,
        profileUrl,
        type: 'student-profile'
      }), {
        width: 260,
        margin: 2,
        color: {
          dark: '#113411',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      })

      setQrCodeUrl(qrDataUrl)
    }

    generateStudentQr()
  }, [student])

  if (loading) {
    return (
      <Layout title="Student Profile">
      <div className={styles.container}>
        <a href="/" className={styles.homeLogo} aria-label="Go to home page">
          <img src="/logo.png" alt="" />
        </a>
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
        <a href="/" className={styles.homeLogo} aria-label="Go to home page">
          <img src="/logo.png" alt="" />
        </a>
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
        <a href="/" className={styles.homeLogo} aria-label="Go to home page">
          <img src="/logo.png" alt="" />
        </a>
        <div className={styles.profileCard}>
          <header className={styles.profileHeader}>
            <div className={styles.headerInfo}>
              <h1>{student.name}</h1>
              <p className={styles.studentId}>Student ID: {student.studentid}</p>
              <div className={styles.contactInfo}>
                {student.email && <p>Email: {student.email}</p>}
                {student.phone && <p>Phone: {student.phone}</p>}
              </div>
            </div>
            <div className={styles.qrPanel}>
              {qrCodeUrl && <img src={qrCodeUrl} alt={`${student.name} student QR code`} />}
              <p>Student QR</p>
            </div>
          </header>

          <section className={styles.coursesSection}>
            <h2>Learning Record</h2>
            {courses.length === 0 ? (
              <p className={styles.noCourses}>No courses enrolled.</p>
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
        </div>
      </div>
    </Layout>
  )
}
