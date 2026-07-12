import styles from '../styles/Home.module.css'

import Layout from "/components/Layout"
import SectionOneHome from "/components/SectionOneHome.js"
import SectionTwoAbout from "/components/SectionTwoAbout.js"
import SectionServices from "/components/SectionServices.js"
import SectionThreeCard from "/components/Sect3Card.js"
import SectionFourBanner from "/components/SectionFourBanner.js"
import SectionFiveContact from "/components/SectionFiveContact.js"
import SectionSevenEdu  from "/components/SectionSevenEdu.js"
import Footer  from "/components/Footer.js"

export async function getServerSideProps() {
  return { props: {} }
}

const projects = [
  ['LUANAR Timetable app', 'Built as part of our tech education program - a mobile ride-hailing and battery swapping solution developed during our youth coding bootcamp', '/pro.png',"https://luanarapp.netlify.app/app"],
  ['Groceries Magement App', 'Delivered through our consulting practice for education sector digital transformation and administrative efficiency', '/pro1.png',"https://budgetpage.netlify.app/"],
  ['ANOVA statics webapp', 'Impact monitoring system developed for an NGO to track community health program outcomes across rural Malawi', '/pro2.png',"https://luanaranovaonline.netlify.app/"],
  // ['Agri Invoice System', 'Digital platform built for agricultural cooperative to streamline supply chain management and increase farmer incomes', '/pro5.png'],
  // ['Budget Management App', 'Financial tracking tool developed during our digital literacy program for small business entrepreneurs', '/pro2.png'],
  // ['Plant Disease Detection Platform', 'AI-powered agricultural tool created through our youth tech innovation challenge for crop disease identification', '/pro3.png'],
  // ['Donor Reporting Dashboard', 'M&E data visualization system built for nonprofit organizations to track impact metrics and generate donor reports', '/pro4.png']
]

export default function Home() {
  return (
    <Layout title="Development Africa MW">
      <main className={styles.main}>

        <div className={styles.center}>
          <SectionOneHome />
          <SectionTwoAbout />        
        </div>
        
        <SectionServices />
        
        <div className={styles.heading}>
          <h1>PROJECTS & IMPACT</h1>
        </div>
        <div className={styles.grid}>
          {projects.map(([name, description, image, link]) => (
            <SectionThreeCard
              key={name}
              name={name}
              description={description}
              link={link}
              github="https://github.com"
              image={image}
            />
          ))}
        </div>
        <div className={styles.viewalllink}>
          <a href="/projects">VIEW ALL PROJECTS &rarr;</a>
        </div>
        <div className={styles.sections}>
          <SectionFourBanner />
          <div className={styles.heading}>
            {/* <h1>WHAT WE DO</h1> */}
          </div>
          <SectionFiveContact />
          <SectionSevenEdu />
          <Footer />
         
        </div>
      </main>
    </Layout>
  )
}
