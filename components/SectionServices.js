import styles from '../styles/SectionServices.module.scss'
import { MdSchool, MdBusiness, MdPalette } from 'react-icons/md'

export default function SectionServices() {
  return (
    <section className={styles.services}>
      <div className={styles.sectionContent}>
        <h2>Our Core Services</h2>
        <div className={styles.servicesGrid}>
          <div className={styles.serviceCard}>
            <div className={styles.serviceIcon}>
              <MdSchool />
            </div>
            <h3>Tech Education</h3>
            <p>Hands-on coding and digital skills programs for children and young people, empowering the next generation of tech leaders.</p>
          </div>
          
          <div className={styles.serviceCard}>
            <div className={styles.serviceIcon}>
              <MdBusiness />
            </div>
            <h3>Consulting</h3>
            <p>Project design and digital transformation support for organisations, helping you build sustainable tech solutions.</p>
          </div>
          
          <div className={styles.serviceCard}>
            <div className={styles.serviceIcon}>
              <MdPalette />
            </div>
            <h3>Design & Communications</h3>
            <p>Infographics, reports, presentations, newsletters, dashboards, and websites that turn your organisation's work into something people actually read.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
