import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import styles from '../styles/admin.module.scss'

export async function getServerSideProps() {
  return { props: {} }
}

export default function Register() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    course: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [courses, setCourses] = useState([])
  const [loadingCourses, setLoadingCourses] = useState(true)

  // Fetch available courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('id, name, description')
          .order('name')

        if (error) throw error
        setCourses(data || [])
      } catch (err) {
        console.error('Error fetching courses:', err)
      } finally {
        setLoadingCourses(false)
      }
    }

    fetchCourses()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Insert application into Supabase
      const { data, error } = await supabase
        .from('applications')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            course_id: formData.course,
            status: 'pending'
          }
        ])

      if (error) throw error

      setSuccess(true)
      setFormData({ name: '', email: '', phone: '', course: '' })

      setTimeout(() => {
        router.push('/')
      }, 1200)
    } catch (err) {
      setError(err.message || 'Failed to submit application. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerCard}>
        <div className={styles.registerHeader}>
          <h1>Student Registration</h1>
          <p>Apply for a course at Development Africa MW</p>
        </div>

        {success && (
          <div className={styles.successMessage}>
            <strong>Application Submitted!</strong>
            <p>Thank you for your interest. We will review your application and contact you soon.</p>
          </div>
        )}

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.registerForm}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Full Name *</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address *</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your.email@example.com"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phone">Phone Number *</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="+265 888 123 456"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="course">Select Course *</label>
            {loadingCourses ? (
              <p className={styles.loadingText}>Loading courses...</p>
            ) : (
              <select
                id="course"
                name="course"
                value={formData.course}
                onChange={handleChange}
                required
              >
                <option value="">-- Select a Course --</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading || loadingCourses || courses.length === 0} 
            className={styles.submitButton}
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>

        <div className={styles.registerFooter}>
          <p>By submitting this form, you agree to our terms and conditions.</p>
        </div>
      </div>
    </div>
  )
}