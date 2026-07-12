import Layout from "/components/Layout"
import SectionThreeCard from "/components/Sect3card"
import styles from '../styles/Home.module.css'

const projects = [
  ['LUANAR Timetable app', 'Built as part of our tech education program - a mobile ride-hailing and battery swapping solution developed during our youth coding bootcamp', '/pro.png', "https://luanarapp.netlify.app/app"],
  ['Groceries Management App', 'Delivered through our consulting practice for education sector digital transformation and administrative efficiency', '/pro1.png', "https://budgetpage.netlify.app/"],
  ['ANOVA Statistics Webapp', 'Impact monitoring system developed for an NGO to track community health program outcomes across rural Malawi', '/pro2.png', "https://luanaranovaonline.netlify.app/"],
  ['Agri Invoice System', 'Digital platform built for agricultural cooperative to streamline supply chain management and increase farmer incomes', '/pro.png'],
  ['Budget Management App', 'Financial tracking tool developed during our digital literacy program for small business entrepreneurs', '/pro1.png'],
  ['Plant Disease Detection Platform', 'AI-powered agricultural tool created through our youth tech innovation challenge for crop disease identification', '/pro2.png'],
  ['Donor Reporting Dashboard', 'M&E data visualization system built for nonprofit organizations to track impact metrics and generate donor reports', '/edu.png']
]

export async function getServerSideProps() {
  return { props: {} }
}

export default function Projects() {
  return (
    <Layout title="Projects - Development Africa MW">
      <main className={styles.main}>
        <div className={styles.heading}>
          <h1>ALL PROJECTS & IMPACT</h1>
        </div>
        <div className={styles.grid}>
          {projects.map(([name, description, image, link]) => (
            <SectionThreeCard
              key={name}
              name={name}
              description={description}
              link={link || "#"}
              github="https://github.com"
              image={image}
            />
          ))}
        </div>
      </main>
    </Layout>
  )
}