import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'
import Layout from "/components/Layout"
import styles from '../styles/admin.module.scss'

const emptyStudent = { name: '', email: '', phone: '', studentid: '' }
const emptyCourse = { name: '', description: '', duration: '' }
const emptyEnrollment = { studentId: '', courseId: '', completionDate: '', completed: false }
const tabs = ['students', 'courses', 'enrollments', 'applications']

function Field({ field, value, onChange, children }) {
  const { name, label, type = 'text', required, placeholder, rows } = field

  return (
    <div className={styles.formGroup}>
      <label>{label}</label>
      {children || (type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
          rows={rows || 4}
        />
      ) : (
        <input
          type={type}
          value={type === 'checkbox' ? undefined : value}
          onChange={(e) => onChange(name, type === 'checkbox' ? e.target.checked : e.target.value)}
          required={required}
          placeholder={placeholder}
          checked={type === 'checkbox' ? value : undefined}
        />
      ))}
    </div>
  )
}

function FormCard({ title, fields, form, setForm, onSubmit, submitLabel, children }) {
  const update = (name, value) => setForm((current) => ({ ...current, [name]: value }))

  return (
    <div className={styles.formCard}>
      <h2>{title}</h2>
      <form onSubmit={onSubmit} className={styles.form}>
        {children || fields.map((field) => (
          <Field
            key={field.name}
            field={field}
            value={form[field.name]}
            onChange={update}
          />
        ))}
        <button type="submit" className={styles.submitBtn}>{submitLabel}</button>
      </form>
    </div>
  )
}

function ListCard({ title, count, empty, children }) {
  return (
    <div className={styles.listCard}>
      <h2>{title} ({count})</h2>
      <div className={styles.list}>
        {count ? children : <p className={styles.empty}>{empty}</p>}
      </div>
    </div>
  )
}

export default function Admin() {
  const router = useRouter()
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [applications, setApplications] = useState([])
  const [loadingApplications, setLoadingApplications] = useState(false)
  const [activeTab, setActiveTab] = useState('students')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [barcodeUrl, setBarcodeUrl] = useState('')
  const [barcodeStudentId, setBarcodeStudentId] = useState('')
  const [studentForm, setStudentForm] = useState(emptyStudent)
  const [courseForm, setCourseForm] = useState(emptyCourse)
  const [enrollmentForm, setEnrollmentForm] = useState(emptyEnrollment)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingData, setLoadingData] = useState(false)
  const [approvedApplicants, setApprovedApplicants] = useState([])
  const [loadingApproved, setLoadingApproved] = useState(false)

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      // Check if user is admin
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, email')
        .eq('id', session.user.id)
        .single()

      if (error || !profile || profile.role !== 'admin') {
        await supabase.auth.signOut()
        router.push('/login')
        return
      }

      setUser(session.user)
      setLoading(false)
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Auto-generate student ID with format DEV-MW{YY}{COHORT}{SEQ}
  const generateStudentId = () => {
    const now = new Date()
    const year = now.getFullYear().toString().slice(-2)
    const cohort = '01'
    const prefix = `DEV-MW${year}${cohort}`
    
    const existingNumbers = students
      .filter(s => s.studentid && s.studentid.startsWith(prefix))
      .map(s => {
        const numPart = s.studentid.slice(prefix.length)
        return parseInt(numPart, 10)
      })
      .filter(num => !isNaN(num))
    
    const nextSeq = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1
    const seqStr = nextSeq.toString().padStart(2, '0')
    
    return `${prefix}${seqStr}`
  }

  // Auto-fill student ID when form is initialized
  useEffect(() => {
    if (!studentForm.studentid) {
      const newId = generateStudentId()
      setStudentForm(prev => ({ ...prev, studentid: newId }))
    }
  }, [students.length])

  // Fetch data from Supabase
  const fetchData = async () => {
    setLoadingData(true)
    try {
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false })

      if (studentsError) throw studentsError
      setStudents(studentsData || [])

      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('name')

      if (coursesError) throw coursesError
      setCourses(coursesData || [])

      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('*')
        .order('created_at', { ascending: false })

      if (enrollmentsError) throw enrollmentsError
      setEnrollments(enrollmentsData || [])
    } catch (err) {
      console.error('Error fetching data:', err)
      alert('Error loading data: ' + err.message)
    } finally {
      setLoadingData(false)
    }
  }

  // Fetch data when user is authenticated
  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const studentById = useMemo(() => new Map(students.map((student) => [student.id, student])), [students])
  const courseById = useMemo(() => new Map(courses.map((course) => [course.id, course])), [courses])

  // Add student to Supabase
  const handleAddStudent = async (event) => {
    event.preventDefault()
    
    const existingStudent = students.find(s => s.studentid === studentForm.studentid || s.email === studentForm.email)
    if (existingStudent) {
      alert('A student with this Student ID or Email already exists!')
      return
    }
    
    try {
      const { data, error } = await supabase
        .from('students')
        .insert([{
          name: studentForm.name,
          email: studentForm.email,
          phone: studentForm.phone,
          studentid: studentForm.studentid
        }])
        .select()
        .single()

      if (error) throw error
      
      setStudents((items) => [data, ...items])
      setStudentForm(emptyStudent)
      alert('Student added successfully!')
      
      if (data.id) {
        setTimeout(() => {
          generateBarcode(data.id)
        }, 100)
      }
    } catch (err) {
      alert('Error adding student: ' + err.message)
    }
  }

  const handleAddCourse = async (event) => {
    event.preventDefault()
    
    try {
      const { data, error } = await supabase
        .from('courses')
        .insert([{
          name: courseForm.name,
          description: courseForm.description,
          duration: courseForm.duration
        }])
        .select()
        .single()

      if (error) throw error
      
      setCourses((items) => [data, ...items])
      setCourseForm(emptyCourse)
      alert('Course added successfully!')
    } catch (err) {
      alert('Error adding course: ' + err.message)
    }
  }

  const addEnrollment = async (event) => {
    event.preventDefault()
    
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .insert([{
          studentId: enrollmentForm.studentId,
          courseId: enrollmentForm.courseId,
          completionDate: enrollmentForm.completionDate || null,
          completed: enrollmentForm.completed || false
        }])
        .select()
        .single()

      if (error) throw error
      
      setEnrollments((items) => [data, ...items])
      setEnrollmentForm(emptyEnrollment)
      alert('Student enrolled successfully!')
    } catch (err) {
      alert('Error enrolling student: ' + err.message)
    }
  }

  const deleteStudent = async (id) => {
    if (!confirm('Are you sure you want to delete this student?')) return
    
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setStudents((items) => items.filter((student) => student.id !== id))
      setEnrollments((items) => items.filter((enrollment) => enrollment.studentId !== id))
    } catch (err) {
      alert('Error deleting student: ' + err.message)
    }
  }

  const deleteCourse = async (id) => {
    if (!confirm('Are you sure you want to delete this course?')) return
    
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setCourses((items) => items.filter((course) => course.id !== id))
      setEnrollments((items) => items.filter((enrollment) => enrollment.courseId !== id))
    } catch (err) {
      alert('Error deleting course: ' + err.message)
    }
  }

  // Fetch approved applications
  const fetchApprovedApplicants = async () => {
    setLoadingApproved(true)
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*, courses(name)')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (error) throw error
      setApprovedApplicants(data || [])
    } catch (err) {
      console.error('Error fetching approved applicants:', err)
    } finally {
      setLoadingApproved(false)
    }
  }

  // Fetch approved applicants when switching to students tab
  useEffect(() => {
    if (activeTab === 'students') {
      fetchApprovedApplicants()
    }
  }, [activeTab])

  // Convert approved applicant to student with ID
  const convertToStudent = async (applicant) => {
    const studentid = generateStudentId()
    
    try {
      const { data, error } = await supabase
        .from('students')
        .insert([{
          name: applicant.name,
          email: applicant.email,
          phone: applicant.phone,
          studentid: studentid
        }])
        .select()
        .single()

      if (error) throw error
      
      setStudents((items) => [data, ...items])
      
      // Update application status to indicate student was created
      await supabase
        .from('applications')
        .update({ status: 'converted' })
        .eq('id', applicant.id)
      
      // Refresh approved applicants list
      fetchApprovedApplicants()
      
      alert(`Student created successfully! ID: ${studentid}`)
      
      // Generate barcode for the new student
      if (data.id) {
        setTimeout(() => {
          generateBarcode(data.id)
        }, 100)
      }
    } catch (err) {
      alert('Error creating student: ' + err.message)
    }
  }

  // Fetch applications from Supabase
  const fetchApplications = async () => {
    setLoadingApplications(true)
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*, courses(name)')
        .order('created_at', { descending: false })

      if (error) throw error
      setApplications(data || [])
    } catch (err) {
      console.error('Error fetching applications:', err)
    } finally {
      setLoadingApplications(false)
    }
  }

  // Fetch applications when switching to applications tab
  useEffect(() => {
    if (activeTab === 'applications') {
      fetchApplications()
    }
  }, [activeTab])

  // Approve application
  const approveApplication = async (applicationId) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: 'approved', updated_at: new Date().toISOString() })
        .eq('id', applicationId)

      if (error) throw error

      fetchApplications()
      alert('Application approved successfully!')
    } catch (err) {
      alert('Error approving application: ' + err.message)
    }
  }

  // Reject application
  const rejectApplication = async (applicationId) => {
    if (!confirm('Are you sure you want to reject this application?')) return

    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', applicationId)

      if (error) throw error

      fetchApplications()
      alert('Application rejected.')
    } catch (err) {
      alert('Error rejecting application: ' + err.message)
    }
  }

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return '#217821'
      case 'rejected':
        return '#b42318'
      case 'converted':
        return '#2563eb'
      default:
        return '#d97706'
    }
  }

  const generateQRCode = async (studentId) => {
    const student = studentById.get(studentId)
    if (!student) return

    const profileCourses = enrollments
      .filter((enrollment) => enrollment.studentId === studentId)
      .map((enrollment) => {
        const course = courseById.get(enrollment.courseId)
        return course ? { ...course, completed: enrollment.completed, completionDate: enrollment.completionDate } : null
      })
      .filter(Boolean)

    const QRCode = (await import('qrcode')).default
    const profileUrl = `https://developmentafricamw.pages.dev/student/${student.id}`
    const qrDataUrl = await QRCode.toDataURL(JSON.stringify({
      student,
      courses: profileCourses,
      profileUrl
    }), {
      width: 300,
      margin: 2,
      color: { dark: '#113411', light: '#ffffff' }
    })

    setQrCodeUrl(qrDataUrl)
  }

  const generateBarcode = async (studentId) => {
    const student = studentById.get(studentId)
    if (!student) return

    setBarcodeStudentId(studentId)
    
    const QRCode = (await import('qrcode')).default
    const profileUrl = `https://developmentafricamw.pages.dev/student/${student.id}`
    const qrDataUrl = await QRCode.toDataURL(JSON.stringify({
      student,
      profileUrl,
      type: 'student-qr'
    }), {
      width: 350,
      margin: 3,
      color: {
        dark: '#2563eb',
        light: '#f0f9ff'
      },
      errorCorrectionLevel: 'H'
    })
    
    setBarcodeUrl(qrDataUrl)
  }

  if (loading) {
    return (
      <Layout title="Loading...">
        <div className={styles.loading}>
          <p>Loading...</p>
        </div>
      </Layout>
    )
  }

  if (!user) {
    return null
  }

  return (
    <Layout title="Admin Dashboard">
      <div className={styles.adminContainer}>
        <header className={styles.adminHeader}>
          <div className={styles.headerContent}>
            <div>
              <h1>Admin Dashboard</h1>
              <p>Manage students, courses, and enrollments for Development Africa MW learning programs.</p>
            </div>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Logout
            </button>
          </div>
        </header>

        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? styles.activeTab : ''}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'students' && (
          <div className={styles.tabContent}>
            <div>
              <FormCard
                title="Add New Student"
                fields={[
                  { name: 'studentid', label: 'Student ID *', required: true, placeholder: 'e.g., STU001' },
                  { name: 'name', label: 'Full Name *', required: true, placeholder: 'John Doe' },
                  { name: 'email', label: 'Email *', type: 'email', required: true, placeholder: 'john@example.com' },
                  { name: 'phone', label: 'Phone', type: 'tel', placeholder: '+265 888 123 456' }
                ]}
                form={studentForm}
                setForm={setStudentForm}
                onSubmit={handleAddStudent}
                submitLabel="Add Student"
              />
              
              {/* Approved Applicants Section */}
              <div className={styles.formCard} style={{ marginTop: '1.5rem' }}>
                <h2>Approved Applicants ({approvedApplicants.length})</h2>
                <p style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '1rem' }}>
                  Assign student IDs and generate QR codes for approved applicants
                </p>
                {loadingApproved ? (
                  <p className={styles.loadingText}>Loading approved applicants...</p>
                ) : approvedApplicants.length === 0 ? (
                  <p className={styles.empty}>No approved applicants. Approve applications first in the Applications tab.</p>
                ) : (
                  <div className={styles.applicationsList}>
                    {approvedApplicants.map((applicant) => (
                      <div key={applicant.id} className={styles.applicationItem}>
                        <div className={styles.applicationInfo}>
                          <h3>{applicant.name}</h3>
                          <p><strong>Email:</strong> {applicant.email}</p>
                          <p><strong>Phone:</strong> {applicant.phone}</p>
                          <p><strong>Course:</strong> {applicant.courses?.name || 'N/A'}</p>
                          <p><strong>Applied:</strong> {new Date(applicant.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className={styles.applicationActions}>
                          <button 
                            onClick={() => convertToStudent(applicant)} 
                            className={styles.approveBtn}
                          >
                            Assign ID & Create
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <ListCard title="Students List" count={students.length} empty="No students added yet">
              {students.map((student) => (
                <div key={student.id} className={styles.listItem}>
                  <div className={styles.itemInfo}>
                    <a href={`/student/${student.studentid}`} className={styles.studentLink}>
                      <h3>{student.name}</h3>
                    </a>
                    <p>ID: {student.studentid}</p>
                    <p>Email: {student.email}</p>
                    {student.phone && <p>Phone: {student.phone}</p>}
                  </div>
                  <div className={styles.itemActions}>
                    <button onClick={() => generateQRCode(student.id)} className={styles.qrBtn}>Profile QR</button>
                    <button onClick={() => generateBarcode(student.id)} className={styles.barcodeBtn}>Student QR</button>
                    <button onClick={() => deleteStudent(student.id)} className={styles.deleteBtn}>Delete</button>
                  </div>
                </div>
              ))}
            </ListCard>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className={styles.tabContent}>
              <FormCard
                title="Add New Course"
                fields={[
                  { name: 'name', label: 'Course Name *', required: true, placeholder: 'e.g., Web Development Fundamentals' },
                  { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Course description...' },
                  { name: 'duration', label: 'Duration', placeholder: 'e.g., 12 weeks' }
                ]}
                form={courseForm}
                setForm={setCourseForm}
                onSubmit={handleAddCourse}
                submitLabel="Add Course"
              />
            <ListCard title="Courses List" count={courses.length} empty="No courses added yet">
              {courses.map((course) => (
                <div key={course.id} className={styles.listItem}>
                  <div className={styles.itemInfo}>
                    <h3>{course.name}</h3>
                    {course.description && <p>{course.description}</p>}
                    {course.duration && <p>Duration: {course.duration}</p>}
                  </div>
                  <button onClick={() => deleteCourse(course.id)} className={styles.deleteBtn}>Delete</button>
                </div>
              ))}
            </ListCard>
          </div>
        )}

        {activeTab === 'enrollments' && (
          <div className={styles.tabContent}>
            <FormCard
              title="Enroll Student in Course"
              form={enrollmentForm}
              setForm={setEnrollmentForm}
              onSubmit={addEnrollment}
              submitLabel="Enroll Student"
            >
              <div className={styles.formGroup}>
                <label>Select Student *</label>
                <select
                  value={enrollmentForm.studentId}
                  onChange={(e) => setEnrollmentForm((form) => ({ ...form, studentId: e.target.value }))}
                  required
                >
                  <option value="">-- Select Student --</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>{student.name} ({student.studentid})</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Select Course *</label>
                <select
                  value={enrollmentForm.courseId}
                  onChange={(e) => setEnrollmentForm((form) => ({ ...form, courseId: e.target.value }))}
                  required
                >
                  <option value="">-- Select Course --</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </select>
              </div>
              <Field
                field={{ name: 'completionDate', label: 'Completion Date', type: 'date' }}
                value={enrollmentForm.completionDate}
                onChange={(name, value) => setEnrollmentForm((form) => ({ ...form, [name]: value }))}
              />
              <Field
                field={{ name: 'completed', label: 'Course Completed', type: 'checkbox' }}
                value={enrollmentForm.completed}
                onChange={(name, value) => setEnrollmentForm((form) => ({ ...form, [name]: value }))}
              />
            </FormCard>
            <ListCard title="Enrollments List" count={enrollments.length} empty="No enrollments yet">
              {enrollments.map((enrollment) => {
                const student = studentById.get(enrollment.studentId)
                const course = courseById.get(enrollment.courseId)

                return (
                  <div key={enrollment.id} className={styles.listItem}>
                    <div className={styles.itemInfo}>
                      <h3>{student?.name || 'Unknown Student'}</h3>
                      <p>Course: {course?.name || 'Unknown Course'}</p>
                      <p>Status: {enrollment.completed ? 'Completed' : 'In Progress'}</p>
                      {enrollment.completionDate && <p>Completed: {new Date(enrollment.completionDate).toLocaleDateString()}</p>}
                    </div>
                  </div>
                )
              })}
            </ListCard>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className={styles.tabContent}>
            <ListCard 
              title="Applications" 
              count={applications.length} 
              empty="No applications yet"
            >
              {loadingApplications ? (
                <p className={styles.loadingText}>Loading applications...</p>
              ) : (
                <div className={styles.applicationsList}>
                  {applications.map((application) => (
                    <div key={application.id} className={styles.applicationItem}>
                      <div className={styles.applicationInfo}>
                        <h3>{application.name}</h3>
                        <p><strong>Email:</strong> {application.email}</p>
                        <p><strong>Phone:</strong> {application.phone}</p>
                        <p><strong>Course:</strong> {application.courses?.name || 'N/A'}</p>
                        <p><strong>Applied:</strong> {new Date(application.created_at).toLocaleDateString()}</p>
                        <div className={styles.statusBadge} style={{ backgroundColor: getStatusColor(application.status) }}>
                          {application.status}
                        </div>
                      </div>
                      {application.status === 'pending' && (
                        <div className={styles.applicationActions}>
                          <button 
                            onClick={() => approveApplication(application.id)} 
                            className={styles.approveBtn}
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => rejectApplication(application.id)} 
                            className={styles.rejectBtn}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ListCard>
          </div>
        )}

        {qrCodeUrl && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h2>Student Profile QR Code</h2>
              <img src={qrCodeUrl} alt="QR Code" className={styles.qrImage} />
              <p>Scan this QR code to view student profile</p>
              <button onClick={() => setQrCodeUrl('')} className={styles.closeBtn}>Close</button>
            </div>
          </div>
        )}

        {barcodeUrl && barcodeStudentId && (() => {
          const barcodeStudent = studentById.get(barcodeStudentId)
          if (!barcodeStudent) return null
          
          return (
            <div className={styles.modal}>
              <div className={styles.modalContent}>
                <h2>Student Profile Barcode</h2>
                <div className={styles.barcodeInfo}>
                  <img src={barcodeUrl} alt="Barcode" className={styles.barcodeImage} />
                  <div className={styles.studentDetails}>
                    <h3>Student Information</h3>
                    <p><strong>Name:</strong> {barcodeStudent.name}</p>
                    <p><strong>Student ID:</strong> {barcodeStudent.studentid}</p>
                    <p><strong>Email:</strong> {barcodeStudent.email}</p>
                    <p><strong>Phone:</strong> {barcodeStudent.phone || 'N/A'}</p>
                    <p><strong>Profile Link:</strong> https://developmentafricamw.pages.dev/{barcodeStudent.studentid}</p>
                  </div>
                </div>
                <button onClick={() => { setBarcodeUrl(''); setBarcodeStudentId('') }} className={styles.closeBtn}>Close</button>
              </div>
            </div>
          )
        })()}
      </div>
    </Layout>
  )
}