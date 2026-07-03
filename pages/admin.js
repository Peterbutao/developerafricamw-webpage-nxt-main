import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'
import Layout from "/components/Layout"
import styles from '../styles/admin.module.scss'

const emptyStudent = { name: '', email: '', phone: '', studentid: '', course_id: '' }
const emptyCourse = { name: '', description: '', duration: '' }
const tabs = ['students', 'courses', 'applications']

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
  const [applications, setApplications] = useState([])
  const [loadingApplications, setLoadingApplications] = useState(false)
  const [activeTab, setActiveTab] = useState('students')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [barcodeUrl, setBarcodeUrl] = useState('')
  const [barcodeStudentId, setBarcodeStudentId] = useState('')
  const [studentForm, setStudentForm] = useState(emptyStudent)
  const [courseForm, setCourseForm] = useState(emptyCourse)
  const [progressForms, setProgressForms] = useState({})
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingData, setLoadingData] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

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

  const countRows = async (table) => {
    const { count, error } = await supabase
      .from(table)
      .select('id', { count: 'exact', head: true })

    if (error) throw error
    return count || 0
  }

  const deleteAllRows = async (table) => {
    const { error } = await supabase
      .from(table)
      .delete()
      .not('id', 'is', null)

    if (error) throw error

    const remaining = await countRows(table)
    if (remaining > 0) {
      throw new Error(
        `${remaining} ${table} row${remaining === 1 ? '' : 's'} could not be deleted. Check the Supabase delete policy for admin users.`
      )
    }
  }

  const clearDatabase = async () => {
    if (!confirm('⚠️ WARNING: This will permanently delete ALL students and applications. Are you sure you want to continue?')) return

    try {
      await deleteAllRows('applications')
      await deleteAllRows('students')

      // Refresh data
      setStudents([])
      setApplications([])
      setProgressForms({})
      alert('Database cleared successfully! All students and applications have been deleted.')
    } catch (err) {
      alert('Error clearing database: ' + err.message)
    }
  }

  const generateStudentId = () => {
    const now = new Date()
    const year = now.getFullYear().toString().slice(-2)
    const cohort = '01'
    const prefix = `DEV-MW${year}${cohort}`

    const existingNumbers = students
      .filter(s => s.studentid && s.studentid.startsWith(prefix))
      .map(s => parseInt(s.studentid.slice(prefix.length), 10))
      .filter(num => !isNaN(num))

    const nextSeq = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1
    return `${prefix}${nextSeq.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    if (!studentForm.studentid) {
      setStudentForm(prev => ({ ...prev, studentid: generateStudentId() }))
    }
  }, [students.length])

  const hydrateProgressForms = (studentItems) => {
    setProgressForms(Object.fromEntries(studentItems.map((student) => [
      student.id,
      {
        course_id: student.course_id || '',
        completion_date: student.completion_date || '',
        completed: Boolean(student.completed)
      }
    ])))
  }

  const fetchData = async () => {
    setLoadingData(true)
    try {
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('name')

      if (coursesError) throw coursesError
      setCourses(coursesData || [])

      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*, courses(name, description, duration)')
        .order('created_at', { ascending: false })

      if (studentsError) throw studentsError
      setStudents(studentsData || [])
      hydrateProgressForms(studentsData || [])
    } catch (err) {
      console.error('Error fetching data:', err)
      alert('Error loading data: ' + err.message)
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const studentById = useMemo(() => new Map(students.map((student) => [student.id, student])), [students])

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
          studentid: studentForm.studentid,
          course_id: studentForm.course_id || null,
          completed: false,
          completion_date: null
        }])
        .select('*, courses(name, description, duration)')
        .single()

      if (error) throw error

      setStudents((items) => [data, ...items])
      setProgressForms((forms) => ({
        ...forms,
        [data.id]: { course_id: data.course_id || '', completion_date: data.completion_date || '', completed: Boolean(data.completed) }
      }))
      setStudentForm({ ...emptyStudent, studentid: generateStudentId() })
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

  const updateStudentProgressForm = (studentId, name, value) => {
    setProgressForms((forms) => ({
      ...forms,
      [studentId]: {
        ...forms[studentId],
        [name]: value
      }
    }))
  }

  const saveStudentProgress = async (studentId) => {
    const form = progressForms[studentId]
    if (!form) return

    try {
      const { data, error } = await supabase
        .from('students')
        .update({
          course_id: form.course_id || null,
          completed: Boolean(form.completed),
          completion_date: form.completion_date || null
        })
        .eq('id', studentId)
        .select('*, courses(name, description, duration)')
        .single()

      if (error) throw error

      setStudents((items) => items.map((student) => student.id === studentId ? data : student))
      alert('Student course progress updated.')
    } catch (err) {
      alert('Error updating student: ' + err.message)
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
      setProgressForms((forms) => {
        const nextForms = { ...forms }
        delete nextForms[id]
        return nextForms
      })
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
      fetchData()
    } catch (err) {
      alert('Error deleting course: ' + err.message)
    }
  }

  const fetchApplications = async () => {
    setLoadingApplications(true)
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*, courses(name)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setApplications(data || [])
    } catch (err) {
      console.error('Error fetching applications:', err)
      alert('Error loading applications: ' + err.message)
    } finally {
      setLoadingApplications(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'applications') {
      fetchApplications()
    }
  }, [activeTab])

  const approveApplication = async (application) => {
    const studentid = generateStudentId()

    try {
      const { data, error } = await supabase
        .from('students')
        .insert([{
          name: application.name,
          email: application.email,
          phone: application.phone,
          studentid,
          course_id: application.course_id,
          completed: false,
          completion_date: null
        }])
        .select('*, courses(name, description, duration)')
        .single()

      if (error) throw error

      const { error: updateError } = await supabase
        .from('applications')
        .update({ status: 'converted', updated_at: new Date().toISOString() })
        .eq('id', application.id)

      if (updateError) throw updateError

      setStudents((items) => [data, ...items])
      setProgressForms((forms) => ({
        ...forms,
        [data.id]: { course_id: data.course_id || '', completion_date: '', completed: false }
      }))
      fetchApplications()
      alert(`Student created successfully! ID: ${studentid}`)
    } catch (err) {
      alert('Error approving application: ' + err.message)
    }
  }

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'converted':
        return '#2563eb'
      case 'rejected':
        return '#b42318'
      default:
        return '#d97706'
    }
  }

  const generateQRCode = async (studentId) => {
    const student = studentById.get(studentId)
    if (!student) return

    const QRCode = (await import('qrcode')).default
    const profileUrl = `https://developmentafricamw.pages.dev/student/${student.studentid}`
    const qrDataUrl = await QRCode.toDataURL(JSON.stringify({
      student,
      course: student.courses || null,
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
    const profileUrl = `https://developmentafricamw.pages.dev/student/${student.studentid}`
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
              <p>Manage students, courses, and completion records in one place.</p>
            </div>
            <div className={styles.headerActions}>
              <button onClick={clearDatabase} className={styles.clearDbButton}>
                Clear Database
              </button>
              <button onClick={handleLogout} className={styles.logoutButton}>
                Logout
              </button>
            </div>
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
            <FormCard
              title="Add Student"
              form={studentForm}
              setForm={setStudentForm}
              onSubmit={handleAddStudent}
              submitLabel="Add Student"
            >
              <Field
                field={{ name: 'studentid', label: 'Student ID *', required: true, placeholder: 'e.g., DEV-MW260101' }}
                value={studentForm.studentid}
                onChange={(name, value) => setStudentForm((form) => ({ ...form, [name]: value }))}
              />
              <Field
                field={{ name: 'name', label: 'Full Name *', required: true, placeholder: 'Student name' }}
                value={studentForm.name}
                onChange={(name, value) => setStudentForm((form) => ({ ...form, [name]: value }))}
              />
              <Field
                field={{ name: 'email', label: 'Email *', type: 'email', required: true, placeholder: 'student@example.com' }}
                value={studentForm.email}
                onChange={(name, value) => setStudentForm((form) => ({ ...form, [name]: value }))}
              />
              <Field
                field={{ name: 'phone', label: 'Phone', type: 'tel', placeholder: '+265 888 123 456' }}
                value={studentForm.phone}
                onChange={(name, value) => setStudentForm((form) => ({ ...form, [name]: value }))}
              />
              <div className={styles.formGroup}>
                <label>Course *</label>
                <select
                  value={studentForm.course_id}
                  onChange={(e) => setStudentForm((form) => ({ ...form, course_id: e.target.value }))}
                  required
                >
                  <option value="">-- Select Course --</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </select>
              </div>
            </FormCard>

            <ListCard title="Students" count={students.length} empty={loadingData ? 'Loading students...' : 'No students yet'}>
              {students.map((student) => {
                const form = progressForms[student.id] || { course_id: '', completion_date: '', completed: false }

                return (
                  <div key={student.id} className={styles.listItem}>
                    <div className={styles.itemInfo}>
                      <a href={`/student/${student.studentid}`} className={styles.studentLink}>
                        <h3>{student.name}</h3>
                      </a>
                      <p>ID: {student.studentid}</p>
                      <p>Email: {student.email}</p>
                      {student.phone && <p>Phone: {student.phone}</p>}
                      <p>Course: {student.courses?.name || 'No course selected'}</p>
                      <p>Status: {student.completed ? 'Completed' : 'In Progress'}</p>
                      {student.completion_date && <p>Completed: {new Date(student.completion_date).toLocaleDateString()}</p>}

                      <div className={styles.progressControls}>
                        <select
                          value={form.course_id}
                          onChange={(e) => updateStudentProgressForm(student.id, 'course_id', e.target.value)}
                        >
                          <option value="">-- Select Course --</option>
                          {courses.map((course) => (
                            <option key={course.id} value={course.id}>{course.name}</option>
                          ))}
                        </select>
                        <input
                          type="date"
                          value={form.completion_date || ''}
                          onChange={(e) => updateStudentProgressForm(student.id, 'completion_date', e.target.value)}
                        />
                        <label className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={form.completed}
                            onChange={(e) => updateStudentProgressForm(student.id, 'completed', e.target.checked)}
                          />
                          Completed
                        </label>
                        <button onClick={() => saveStudentProgress(student.id)} className={styles.saveBtn}>Save</button>
                      </div>
                    </div>
                    <div className={styles.itemActions}>
                      <button onClick={() => generateQRCode(student.id)} className={styles.qrBtn}>Profile QR</button>
                      <button onClick={() => generateBarcode(student.id)} className={styles.barcodeBtn}>Student QR</button>
                      <button onClick={() => deleteStudent(student.id)} className={styles.deleteBtn}>Delete</button>
                    </div>
                  </div>
                )
              })}
            </ListCard>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className={styles.tabContent}>
            <FormCard
              title="Add Course"
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
            <ListCard title="Courses" count={courses.length} empty="No courses added yet">
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

        {activeTab === 'applications' && (
          <div className={styles.tabContentSingle}>
            <ListCard
              title="Applications"
              count={applications.length}
              empty={loadingApplications ? 'Loading applications...' : 'No applications yet'}
            >
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
                      <button onClick={() => approveApplication(application)} className={styles.approveBtn}>
                        Approve & Create Student
                      </button>
                      <button onClick={() => rejectApplication(application.id)} className={styles.rejectBtn}>
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
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
                <h2>Student Profile QR</h2>
                <div className={styles.barcodeInfo}>
                  <img src={barcodeUrl} alt="Student QR" className={styles.barcodeImage} />
                  <div className={styles.studentDetails}>
                    <h3>Student Information</h3>
                    <p><strong>Name:</strong> {barcodeStudent.name}</p>
                    <p><strong>Student ID:</strong> {barcodeStudent.studentid}</p>
                    <p><strong>Email:</strong> {barcodeStudent.email}</p>
                    <p><strong>Phone:</strong> {barcodeStudent.phone || 'N/A'}</p>
                    <p><strong>Course:</strong> {barcodeStudent.courses?.name || 'N/A'}</p>
                    <p><strong>Profile Link:</strong> https://developmentafricamw.pages.dev/student/{barcodeStudent.studentid}</p>
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
