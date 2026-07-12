import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'
import Layout from "/components/Layout"
import styles from '../styles/admin.module.scss'
import { FaDownload, FaQrcode, FaRegSave, FaSignOutAlt, FaTrashAlt, FaUserCheck } from 'react-icons/fa'

const emptyStudent = { name: '', email: '', phone: '', studentid: '', course_id: '' }
const emptyCourse = { name: '', description: '', duration: '' }
const tabs = ['students', 'courses', 'applications']
const certificateTemplate = '/certificate/Certificate of Completion - blank.png'
const certificateColumns = '*, courses(name, description, duration), certificate_url'
const bodyFont = '"Inter", "Segoe UI", Arial, sans-serif'
const nameFont = '"Amsterdam Three", "AmsterdamThree", "Brush Script MT", "Segoe Script", cursive'

const loadCanvasImage = (src) => new Promise((resolve, reject) => {
  const image = new Image()
  image.crossOrigin = 'anonymous'
  image.onload = () => resolve(image)
  image.onerror = reject
  image.src = src
})

const loadCertificateFonts = async () => {
  if (typeof document === 'undefined' || !document.fonts) return

  await Promise.allSettled([
    document.fonts.load(`400 42px ${bodyFont}`),
    document.fonts.load(`400 120px ${nameFont}`)
  ])
}

const removeBlankTemplateGuideMarks = (ctx) => {
  [
    [82, 246, 30, 30, 116, 246],
    [148, 554, 36, 36, 188, 554],
    [82, 744, 30, 30, 116, 744],
    [102, 1348, 32, 32, 138, 1348]
  ].forEach(([x, y, width, height, sourceX, sourceY]) => {
    ctx.drawImage(ctx.canvas, sourceX, sourceY, width, height, x, y, width, height)
  })
}

const sanitizeCertificatePart = (value) => String(value || '')
  .trim()
  .replace(/[^a-z0-9]+/gi, '-')
  .replace(/^-+|-+$/g, '')
  .toUpperCase()

const formatDate = (dateValue) => {
  const date = dateValue ? new Date(dateValue) : new Date()
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
}

const buildCertificateId = (student) => {
  const rawDate = student.completion_date || new Date().toISOString()
  const compactDate = new Date(rawDate).toISOString().slice(0, 10).replace(/-/g, '')
  return `CERT-${sanitizeCertificatePart(student.studentid)}-${compactDate}`
}

const fitText = (ctx, text, maxWidth, startSize, minSize, family, weight = '700') => {
  let size = startSize
  do {
    ctx.font = `${weight} ${size}px ${family}`
    if (ctx.measureText(text).width <= maxWidth || size <= minSize) return size
    size -= 4
  } while (size >= minSize)
  return minSize
}

const wrapText = (ctx, text, x, y, maxWidth, lineHeight, maxLines) => {
  const words = String(text || '').split(/\s+/).filter(Boolean)
  const lines = []
  let line = ''

  words.forEach((word) => {
    const testLine = line ? `${line} ${word}` : word
    if (ctx.measureText(testLine).width <= maxWidth) {
      line = testLine
      return
    }

    if (line) lines.push(line)
    line = word
  })

  if (line) lines.push(line)

  lines.slice(0, maxLines).forEach((lineText, index) => {
    const finalLine = index === maxLines - 1 && lines.length > maxLines ? `${lineText.replace(/[.,;:]?$/, '')}...` : lineText
    ctx.fillText(finalLine, x, y + (index * lineHeight))
  })
}

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

function StatusPill({ completed }) {
  return (
    <span className={completed ? styles.completedPill : styles.progressPill}>
      {completed ? 'Completed' : 'In Progress'}
    </span>
  )
}

export async function getServerSideProps() {
  return { props: {} }
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
  const [generatingCertificateId, setGeneratingCertificateId] = useState('')
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
        .select(certificateColumns)
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
        .select(certificateColumns)
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
      const currentStudent = studentById.get(studentId)
      const completed = Boolean(form.completed)
      const completionDate = completed
        ? (form.completion_date || new Date().toISOString().slice(0, 10))
        : null
      const certificateId = completed
        ? (currentStudent?.certificate_id || buildCertificateId({
          ...currentStudent,
          studentid: currentStudent?.studentid,
          completion_date: completionDate
        }))
        : null
      const progressPayload = {
        course_id: form.course_id || null,
        completed,
        completion_date: completionDate
      }
      const certificatePayload = completed ? {
        certificate_id: certificateId,
        certificate_issued_at: currentStudent?.certificate_issued_at || new Date().toISOString(),
        certificate_template: certificateTemplate
      } : {
        certificate_id: null,
        certificate_issued_at: null,
        certificate_template: null
      }

      const { data, error } = await supabase
        .from('students')
        .update({ ...progressPayload, ...certificatePayload })
        .eq('id', studentId)
        .select(certificateColumns)
        .single()

      if (error) {
        const missingCertificateColumn = /certificate_/i.test(error.message || '')
        if (!missingCertificateColumn) throw error

        const { data: fallbackData, error: fallbackError } = await supabase
          .from('students')
          .update(progressPayload)
          .eq('id', studentId)
          .select(certificateColumns)
          .single()

        if (fallbackError) throw fallbackError

        setStudents((items) => items.map((student) => student.id === studentId ? {
          ...fallbackData,
          certificate_id: certificateId,
          certificate_issued_at: completed ? new Date().toISOString() : null,
          certificate_template: completed ? certificateTemplate : null
        } : student))
        setProgressForms((forms) => ({
          ...forms,
          [studentId]: { ...forms[studentId], completion_date: completionDate || '', completed }
        }))
        alert('Student progress updated. Certificate is ready in this admin session; run the Supabase SQL to persist certificate assignment fields.')
        return
      }

      setStudents((items) => items.map((student) => student.id === studentId ? data : student))
      setProgressForms((forms) => ({
        ...forms,
        [studentId]: { ...forms[studentId], completion_date: completionDate || '', completed }
      }))
      alert(completed ? 'Student completed and certificate assigned.' : 'Student course progress updated.')
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
        .eq('status', 'pending')
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
        .select(certificateColumns)
        .single()

      if (error) throw error

      const { error: deleteError } = await supabase
        .from('applications')
        .delete()
        .eq('id', application.id)

      if (deleteError) throw deleteError

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
        .delete()
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
    const profileUrl = `${window.location.origin}/student/${student.studentid}`
    const qrDataUrl = await QRCode.toDataURL(JSON.stringify({
      student,
      course: student.courses || null,
      profileUrl
    }), {
      width: 320,
      margin: 3,
      color: {
        dark: '#114311',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M',
      type: 'image/png'
    })

    setQrCodeUrl(qrDataUrl)
  }

  const downloadQR = (dataUrl, filename) => {
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const generateBarcode = async (studentId) => {
    const student = studentById.get(studentId)
    if (!student) return

    setBarcodeStudentId(studentId)

    const QRCode = (await import('qrcode')).default
    const profileUrl = `${window.location.origin}/student/${student.studentid}`
    const qrDataUrl = await QRCode.toDataURL(JSON.stringify({
      student,
      profileUrl,
      type: 'student-qr'
    }), {
      width: 360,
      margin: 2,
      color: {
        dark: '#114311',
        light: '#f8fafc'
      },
      errorCorrectionLevel: 'H'
    })

    setBarcodeUrl(qrDataUrl)
  }

  const generateCertificate = async (studentId) => {
    const student = studentById.get(studentId)
    if (!student) return

    if (!student.completed) {
      alert('Approve this student as completed before generating a certificate.')
      return
    }

    setGeneratingCertificateId(studentId)
    try {
      const QRCode = (await import('qrcode')).default
      const profileUrl = `${window.location.origin}/student/${student.studentid}`
      const certificateId = student.certificate_id || buildCertificateId(student)
      const qrDataUrl = await QRCode.toDataURL(JSON.stringify({
        certificateId,
        studentId: student.studentid,
        name: student.name,
        course: student.courses?.name || 'Completed Course',
        completed: student.completion_date || null,
        profileUrl,
        type: 'completion-certificate'
      }), {
        width: 360,
        margin: 2,
        color: {
          dark: '#114311',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      })

      await loadCertificateFonts()

      const [templateImage, qrImage] = await Promise.all([
        loadCanvasImage(certificateTemplate),
        loadCanvasImage(qrDataUrl)
      ])

      const canvas = document.createElement('canvas')
      canvas.width = templateImage.width
      canvas.height = templateImage.height
      const ctx = canvas.getContext('2d')

      ctx.drawImage(templateImage, 0, 0)
      removeBlankTemplateGuideMarks(ctx)

      const courseName = student.courses?.name || 'Completed Course'
      const description = student.courses?.description ||
        `Successfully completed comprehensive training in ${courseName}. Demonstrated practical understanding, discipline, and readiness to apply the knowledge gained through the programme.`

      ctx.fillStyle = '#005f95'
      ctx.textBaseline = 'alphabetic'
      ctx.textAlign = 'left'
      ctx.font = `500 44px ${bodyFont}`
      wrapText(ctx, courseName, 90, 263, 1520, 56, 1)

      ctx.fillStyle = '#005f95'
      const nameSize = fitText(ctx, student.name, 900, 132, 78, nameFont, '400')
      ctx.font = `400 ${nameSize}px ${nameFont}`
      ctx.fillText(student.name, 92, 565)

      ctx.fillStyle = '#005f95'
      ctx.font = `400 34px ${bodyFont}`
      wrapText(ctx, description, 86, 746, 1250, 52, 4)

      ctx.font = `700 24px ${bodyFont}`
      ctx.fillText(`Certificate ID: ${certificateId}`, 86, 1238)
      ctx.font = `600 24px ${bodyFont}`
      ctx.fillText(`Completed: ${formatDate(student.completion_date)}`, 86, 1274)

      ctx.fillStyle = '#ffffff'
      ctx.fillRect(101, 1282, 146, 146)
      ctx.drawImage(qrImage, 101, 1282, 146, 146)

      const certificateDataUrl = canvas.toDataURL('image/png', 1)
      
      // Download the certificate
      downloadQR(certificateDataUrl, `certificate-${student.studentid}.png`)

      // Upload to Supabase Storage
      const uploadSuccess = await uploadCertificateToStorage(
        studentId,
        student.studentid,
        certificateDataUrl,
        certificateId
      )

      if (uploadSuccess) {
        alert(`Certificate generated and uploaded to storage for ${student.name}.`)
      }
    } catch (err) {
      alert('Error generating certificate: ' + err.message)
    } finally {
      setGeneratingCertificateId('')
    }
  }

  const uploadCertificateToStorage = async (studentId, studentIdValue, certificateDataUrl, certificateId) => {
    try {
      // Convert data URL to blob
      const response = await fetch(certificateDataUrl)
      const blob = await response.blob()
      
      // Create file path: certificates/{studentId}/{certificateId}.png
      const filePath = `certificates/${studentId}/${certificateId}.png`
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('certificates')
        .upload(filePath, blob, {
          contentType: 'image/png',
          upsert: true
        })

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        alert('Certificate downloaded but failed to upload to storage: ' + uploadError.message)
        return { success: false, url: null }
      }

      // Get public URL for the uploaded certificate
      const { data: urlData } = supabase.storage
        .from('certificates')
        .getPublicUrl(filePath)

      const certificateUrl = urlData?.publicUrl

      // Update student record with certificate URL
      const { error: updateError } = await supabase
        .from('students')
        .update({ certificate_url: certificateUrl })
        .eq('id', studentId)

      if (updateError) {
        console.error('Update error:', updateError)
        console.warn('Certificate uploaded but could not update database with URL')
      }

      // Update local state
      setStudents((items) => items.map((s) => 
        s.id === studentId ? { ...s, certificate_url: certificateUrl } : s
      ))

      return { success: true, url: certificateUrl }
    } catch (err) {
      console.error('Upload exception:', err)
      alert('Certificate downloaded but failed to upload to storage: ' + err.message)
      return { success: false, url: null }
    }
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
                <FaTrashAlt aria-hidden="true" />
                Clear Database
              </button>
              <button onClick={handleLogout} className={styles.logoutButton}>
                <FaSignOutAlt aria-hidden="true" />
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
                      <div className={styles.studentTopline}>
                        <a href={`/student/${student.studentid}`} className={styles.studentLink}>
                          <h3>{student.name}</h3>
                        </a>
                        <StatusPill completed={student.completed} />
                      </div>

                      <div className={styles.studentMetaGrid}>
                        <p><span>ID</span>{student.studentid}</p>
                        <p><span>Email</span>{student.email}</p>
                        {student.phone && <p><span>Phone</span>{student.phone}</p>}
                        <p><span>Course</span>{student.courses?.name || 'No course selected'}</p>
                        {student.completion_date && <p><span>Completed</span>{new Date(student.completion_date).toLocaleDateString()}</p>}
                        {student.certificate_id && <p><span>Certificate</span>{student.certificate_id}</p>}
                        {student.certificate_url && <p><span>Certificate URL</span><a href={student.certificate_url} target="_blank" rel="noopener noreferrer">View in Storage</a></p>}
                      </div>

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
                        <button onClick={() => saveStudentProgress(student.id)} className={styles.saveBtn}>
                          <FaRegSave aria-hidden="true" />
                          Save
                        </button>
                      </div>
                    </div>
                    <div className={styles.itemActions}>
                      <button
                        onClick={() => generateCertificate(student.id)}
                        className={styles.certificateBtn}
                        disabled={!student.completed || generatingCertificateId === student.id}
                      >
                        <FaDownload aria-hidden="true" />
                        {generatingCertificateId === student.id ? 'Building...' : 'Download Certificate'}
                      </button>
                      <div className={styles.secondaryActions}>
                        <button onClick={() => generateQRCode(student.id)} className={styles.qrBtn}>
                          <FaQrcode aria-hidden="true" />
                          Profile QR
                        </button>
                        <button onClick={() => generateBarcode(student.id)} className={styles.barcodeBtn}>
                          <FaUserCheck aria-hidden="true" />
                          Student QR
                        </button>
                      </div>
                      <button onClick={() => deleteStudent(student.id)} className={styles.deleteBtn}>
                        <FaTrashAlt aria-hidden="true" />
                        Delete
                      </button>
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
                  <button onClick={() => deleteCourse(course.id)} className={styles.deleteBtn}>
                    <FaTrashAlt aria-hidden="true" />
                    Delete
                  </button>
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
                        <FaUserCheck aria-hidden="true" />
                        Approve & Create Student
                      </button>
                      <button onClick={() => rejectApplication(application.id)} className={styles.rejectBtn}>
                        <FaTrashAlt aria-hidden="true" />
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
              <div className={styles.modalActions}>
                <button onClick={() => downloadQR(qrCodeUrl, 'student-qr.png')} className={styles.downloadBtn}>
                  <FaDownload aria-hidden="true" />
                  Download PNG
                </button>
              </div>
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
                    <p><strong>Profile Link:</strong> {window.location.origin}/student/{barcodeStudent.studentid}</p>
                  </div>
                </div>
                <div className={styles.modalActions}>
                  <button onClick={() => downloadQR(barcodeUrl, `student-qr-${barcodeStudent.studentid}.png`)} className={styles.downloadBtn}>
                    <FaDownload aria-hidden="true" />
                    Download PNG
                  </button>
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
