import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import Layout from "/components/Layout"
import styles from '../../styles/student.module.scss'
import { FaDownload } from 'react-icons/fa'

export async function getServerSideProps() {
  return { props: {} }
}

export default function StudentProfile() {
  const router = useRouter()
  const { studentId } = router.query

  const [student, setStudent] = useState(null)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!studentId) return

    const fetchStudentData = async () => {
      setLoading(true)
      try {
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('*, courses(name, description, duration), certificate_id, certificate_issued_at, certificate_template, certificate_url')
          .eq('studentid', studentId)
          .maybeSingle()

        if (studentError) throw studentError
        setStudent(studentData || null)
      } catch (err) {
        console.error('Error fetching student data:', err)
        setStudent(null)
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
        course: student.courses?.name || null,
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

          {student.certificate_url && (
            <section className={styles.certificateSection}>
              <div className={styles.certificatePreview}>
                <img src={student.certificate_url} alt="Certificate" className={styles.certificateImage} />
                <div className={styles.certificateActions}>
                  <a href={student.certificate_url} target="_blank" rel="noopener noreferrer" className={styles.certificateBtn}>
                    <FaDownload aria-hidden="true" />
                    Download Certificate
                  </a>
                </div>
              </div>
            </section>
          )}

          <section className={styles.coursesSection}>
            <h2>Course Details</h2>
            {student.courses ? (
              <div className={styles.coursesList}>
                <div className={styles.courseCard}>
                  <div className={styles.courseInfo}>
                    <h3>{student.courses.name}</h3>
                    {student.courses.description && <p>{student.courses.description}</p>}
                    {student.courses.duration && <p>Duration: {student.courses.duration}</p>}
                    <p className={student.completed ? styles.completed : styles.inProgress}>
                      {student.completed ? 'Completed' : 'In Progress'}
                    </p>
                    {student.completion_date && (
                      <p>Completed: {new Date(student.completion_date).toLocaleDateString()}</p>
                    )}
                    {student.certificate_id && (
                      <p><strong>Certificate ID:</strong> {student.certificate_id}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className={styles.noCourses}>No course selected.</p>
            )}
          </section>
        </div>
      </div>
    </Layout>
  )
}
