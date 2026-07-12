import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
/* GSAP animations removed to keep only hero section animations */
import styles from '../styles/layout.module.scss'

const navItems = [
  ['About', '/about'],
  ['Projects', '/projects'],
  ['Contact', '/contact'],
  ['Approach', '/approach'],
  ['Courses', '/courses'],
  ['Register', '/register']
]

export default function Layout({ children, title }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const headerRef = useRef(null)
  const navRef = useRef(null)
  const brandRef = useRef(null)
  const ctaRef = useRef(null)

/* GSAP animations removed from Layout component */

/* Mobile menu animation removed (GSAP) */

  return (
    <>
      <Head>
        <title>{title || 'Development Africa MW'}</title>
        <meta name="theme-color" content="#d9ddde" />
        <meta name="description" content="Development Africa MW | Empowering communities through tech education, youth development, and consulting services" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" />
        {/* Open Graph / Facebook */}
        <meta property="og:title" content={title || 'Development Africa MW'} />
        <meta property="og:description" content="Empowering communities through tech education, youth development, and consulting services" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://developerafricamw.com" />
        <meta property="og:image" content="/logo.png" />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title || 'Development Africa MW'} />
        <meta name="twitter:description" content="Empowering communities through tech education, youth development, and consulting services" />
        <meta name="twitter:image" content="/logo.png" />
        {/* JSON‑LD Structured Data */}
        <script type="application/ld+json">{`{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Development Africa MW",
  "url": "https://developerafricamw.com",
  "logo": "https://developerafricamw.com/logo.png",
  "description": "Empowering communities through tech education, youth development, and consulting services"
}`}</script>
      </Head>
      
      <main className={styles.main}>
        <div className={styles.header} ref={headerRef}>
          <div className={styles.brand} ref={brandRef}>
            <p>
              <a href='/'>
               DEVELOPMENT AFRICA MW           
              </a>
            </p>
          </div>
          
          <button 
            className={styles.hamburger}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          
          <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`} ref={navRef}>
            {navItems.map(([label, href]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}>
                {label}
              </a>
            ))}
          </nav>
          
        </div>
        
        {children}
      </main>
    </>
  )
}