import Layout from "/components/Layout"
import styles from '../styles/about.module.scss'

export async function getServerSideProps() {
  return { props: {} }
}

export default function Partner() {
  return (
    <Layout title="Partner With Us - Development Africa MW">
      <main className={styles.aboutPage}>
        <section className={styles.intro}>
          <p className={styles.eyebrow}>Partner With Us</p>
          <div className={styles.introGrid}>
            <h1>Collaborate with Development Africa MW to strengthen communities through technology.</h1>
            <div>
              <p>
                We partner with NGOs, community organisations, educational institutions,
                and businesses to deliver tech education, project development, and digital
                transformation initiatives across Malawi.
              </p>
              <p>
                Whether you need training programs for youth, M&E systems for your projects,
                or digital tools for your organisation, we work alongside you to build
                practical, sustainable solutions.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.statement}>
          <div>
            <span>01</span>
            <h2>How We Partner</h2>
          </div>
          <p>
            Every partnership starts with understanding your context, goals, and community needs.
            We co-design programs that fit local realities and build lasting capacity.
          </p>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <p>Get In Touch</p>
            <h2>Ready to work together?</h2>
          </div>
          <div className={styles.cta} style={{ marginTop: '1rem' }}>
            <a href="/contact">Contact Us Today &rarr;</a>
          </div>
        </section>
      </main>
    </Layout>
  )
}