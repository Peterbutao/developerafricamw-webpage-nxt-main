import Layout from "/components/Layout"
import BusinessCard from "/components/bussinesscard"
import styles from '../styles/about.module.scss'

export async function getServerSideProps() {
  return { props: {} }
}

export default function Contact() {
  return (
    <Layout title="Contact Us - Development Africa MW">
      <main className={styles.aboutPage}>
        <section className={styles.intro}>
          <p className={styles.eyebrow}>Contact Us</p>
          <div className={styles.introGrid}>
            <h1>Get in touch with Development Africa MW.</h1>
            <div>
              <p>
                We'd love to hear from you. Whether you have a project idea, want to partner
                with us, or are interested in our programs, reach out and we'll respond promptly.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.statement}>
          <div>
            <span>01</span>
            <h2>Contact Information</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p><strong>Email:</strong> <a href="mailto:developerafricamw@gmail.com">developerafricamw@gmail.com</a></p>
            <p><strong>Phone:</strong> <a href="tel:0880164455">0880164455</a></p>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <p>Our Business Card</p>
            <h2>Download or scan to connect</h2>
          </div>
          <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
            <BusinessCard />
          </div>
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <a href="/bussinesscard.png" download="DEVELOPERAFRICAMW | business card 2023" style={{ textDecoration: 'underline' }}>
              Download Our Business Card &darr;
            </a>
          </div>
        </section>
      </main>
    </Layout>
  )
}