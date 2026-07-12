import Layout from "/components/Layout"
import styles from '../styles/approach.module.scss'

const phases = [
  ['Discover', 'We start by understanding your context, challenges, and goals through stakeholder interviews, needs assessments, and review of existing systems. This ensures solutions fit real needs and local realities.'],
  ['Design', 'Working collaboratively, we map out practical solutions, system requirements, and implementation plans. We prioritize simplicity, sustainability, and user ownership from the start.'],
  ['Build', 'We develop the technology, systems, or training materials with active participation from your team. Regular check-ins ensure progress stays aligned with needs and capacity.'],
  ['Deploy', 'Solutions go live with comprehensive training, documentation, and support structures. We ensure smooth handover and establish clear pathways for ongoing maintenance.'],
  ['Measure', 'We set up monitoring frameworks, collect relevant data, and work with your team to track outcomes, learn from results, and iterate for continuous improvement.'],
  ['Strengthen', 'Beyond launch, we provide ongoing support, skills transfer, and system refinements to ensure long-term impact and organizational capacity building.']
]

const approaches = [
  ['User-Centered Design', 'Every solution starts with the people who will use it daily. We embed end-users throughout the process to ensure tools are practical and adopted.'],
  ['Open Source First', 'We prioritize open, accessible technologies that reduce costs and allow organizations to maintain systems independently.'],
  ['Skills Transfer', 'Training and documentation are built into every engagement. Your team gains capabilities that outlast any single project.'],
  ['Data-Driven', 'Clear metrics and practical reporting systems help organizations make informed decisions and demonstrate impact to stakeholders.']
]

export async function getServerSideProps() {
  return { props: {} }
}

export default function Approach() {
  return (
    <Layout title="Our Approach | Development Africa MW">
      <main className={styles.aboutPage}>
        <section className={styles.intro}>
          <p className={styles.eyebrow}>Our Approach</p>
          <div className={styles.introGrid}>
            <h1>A practical methodology for sustainable development technology.</h1>
            <div>
              <p>
                Our approach combines development expertise with practical technology
                skills to deliver solutions that work in the Malawian context and
                continue delivering value long after launch.
              </p>
              <p>
                We believe in building with organizations, not for them - ensuring
                tools, systems, and skills become lasting assets for development work.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.statement}>
          <div>
            <span>01</span>
            <h2>Our Process</h2>
          </div>
          <p>
            Every project follows a structured six-phase approach that balances
            technical excellence with practical implementation. This ensures solutions
            are both effective and sustainable in real-world conditions.
          </p>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <p>Step by Step</p>
            <h2>How we work with organizations</h2>
          </div>
          <div className={styles.phaseGrid}>
            {phases.map(([title, text], index) => (
              <article key={title} className={styles.phaseCard}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <p>Key Principles</p>
            <h2>Foundational approaches that guide our work</h2>
          </div>
          <div className={styles.approachList}>
            {approaches.map(([title, text]) => (
              <article key={title} className={styles.approachItem}>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.cta}>
          <h2>Ready to start a project or program?</h2>
          <a href="/contact">Get in Touch &rarr;</a>
        </section>
      </main>
    </Layout>
  )
}