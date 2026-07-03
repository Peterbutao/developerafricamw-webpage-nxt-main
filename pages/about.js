import Layout from "/components/Layout"
import styles from '../styles/about.module.scss'

const audiences = [
  'NGOs & Nonprofits',
  'Community Organisations',
  'Youth & Education Programs',
  'Agricultural Cooperatives',
  'Small Business Entrepreneurs',
  'African Organisations'
]

const services = [
  ['Tech Education', 'Practical coding and digital skills programs for young people who want to build useful local technology.'],
  ['Consulting', 'Project design, digital transformation, monitoring, evaluation, and systems support for growing organisations.'],
  ['Design & Communications', 'Reports, dashboards, websites, presentations, and visual tools that make development work easier to understand.']
]

const principles = [
  ['Local capacity', 'We build with people, not around them. Skills transfer and ownership sit at the center of the work.'],
  ['Useful technology', 'Tools should solve real problems, support daily decisions, and keep working after launch.'],
  ['Measurable impact', 'Clear data, practical reporting, and strong systems help organisations learn and improve.']
]

export default function About() {
  return (
    <Layout title="About Development Africa MW">
      <main className={styles.aboutPage}>
        <section className={styles.intro}>
          <p className={styles.eyebrow}>About Development Africa MW</p>
          <div className={styles.introGrid}>
            <h1>Technology and development support for communities across Malawi.</h1>
            <div>
              <p>
                Development Africa MW works at the intersection of tech education,
                project development, monitoring and evaluation, and communication
                design.
              </p>
              <p>
                We help organisations turn ideas into practical systems, train
                young people with relevant digital skills, and communicate impact
                in ways partners and communities can act on.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.statement}>
          <div>
            <span>01</span>
            <h2>Our Philosophy</h2>
          </div>
          <p>
            Lasting change comes from people who have the skills, tools, and
            systems to keep building. Our role is to strengthen that capacity
            through practical technology, clear project design, and grounded
            development support.
          </p>
        </section>

        <section className={styles.partners}>
          <div className={styles.sectionHeader}>
            <p>Trusted By</p>
            <h2>Organisations and partners we have supported</h2>
          </div>
          <div className={styles.brandRow}>
            <img src="/brand2.png" alt="Partner logo" />
            <img src="/brand1.png" alt="Partner logo" />
            <img src="/brand3.png" alt="Partner logo" />
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <p>What Guides Us</p>
            <h2>How we approach the work</h2>
          </div>
          <div className={styles.principleGrid}>
            {principles.map(([title, text], index) => (
              <article key={title} className={styles.principleCard}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.splitSection}>
          <div className={styles.sectionHeader}>
            <p>Who We Serve</p>
            <h2>Built for organisations doing practical development work</h2>
          </div>
          <div className={styles.audienceList}>
            {audiences.map((audience) => (
              <span key={audience}>{audience}</span>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <p>Core Services</p>
            <h2>Focused support across learning, systems, and communication</h2>
          </div>
          <div className={styles.serviceList}>
            {services.map(([title, text]) => (
              <article key={title} className={styles.serviceItem}>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.expertise}>
          <div>
            <p className={styles.eyebrow}>Lead Expertise</p>
            <h2>Peter Rodriguez Butao</h2>
            <p className={styles.credentials}>B.Sc. SSY; Cert. MEAL; Cert. PM; DCS, RTR; M.Sc. PM</p>
          </div>
          <div>
            <strong>M&E Consultant</strong>
            <p>
              Peter leads the consulting practice with a focus on project
              management, monitoring and evaluation, data-driven impact, and
              sustainable development outcomes.
            </p>
          </div>
        </section>

        <section className={styles.cta}>
          <h2>Have a project, program, or learning initiative?</h2>
          <a href="/contact">Work With Us &rarr;</a>
        </section>
      </main>
    </Layout>
  )
}
