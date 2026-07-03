import { useState } from 'react'
import Head from 'next/head'
import styles from '../styles/layout.module.scss'

const navItems = [
  ['About', '/about'],
  ['Projects', '/projects'],
  ['Contact', '/contact'],
  ['Register', '/register']
]

export default function Layout({ children, title }) {
  const [menuOpen, setMenuOpen] = useState(false)
  
  return (
    <>
      <Head>
        <title>{title || 'Development Africa MW'}</title>
        <meta name="theme-color" content="#d9ddde" />
        <meta name="description" content="Development Africa MW | Empowering communities through tech education, youth development, and consulting services" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      
      <main className={styles.main}>
        <div className={styles.header}>
          <div className={styles.brand}>
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
          
          <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
            {navItems.map(([label, href]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}>
                {label}
              </a>
            ))}
          </nav>
          
          <div className={styles.cta}>
            <a
              href="/partner"
              target="_blank"
              rel="noopener noreferrer"
            >
              <h3>Learn With Us &rarr;</h3>
            </a>
          </div>
        </div>
        
        {children}
      </main>
    </>
  )
}
