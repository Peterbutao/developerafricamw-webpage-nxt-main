import { useEffect, useRef } from "react"
import Image from "next/image"
/* GSAP import removed */
/* ScrollTrigger import removed */
import styles from "../styles/Sect3card.module.scss"

/* GSAP plugin registration removed */

export default function SectionThreeCard({name, description, link, github, image}) {
  const cardRef = useRef(null)

/* GSAP animations removed from SectionThreeCard component */

  return (
    <article className={styles.cards}>
      <div className={styles.card} ref={cardRef}>
        <header>
          <div className={styles.image}>
            <Image 
              className={styles.projectimage}
              src={image}
              alt={`${name} project screenshot`}
              width={350}
              height={350}
            />
          </div>
        </header>
        <main>
          <h1>{name}</h1>
          <p>{description}</p>
        </main>
        <footer>
          <a href={link}>VIEW PROJECT &rarr;</a>
          <a href={github}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.477 2 2 6.477 2 12C2 16.419 4.865 20.166 8.839 21.489C9.339 21.579 9.521 21.271 9.521 21.005C9.521 20.769 9.512 20.139 9.507 19.306C6.725 19.908 6.138 17.966 6.138 17.966C5.683 16.809 5.028 16.501 5.028 16.501C4.119 15.881 5.097 15.893 5.097 15.893C6.101 15.964 6.629 16.923 6.629 16.923C7.52 18.452 8.97 18.012 9.539 17.756C9.63 17.109 9.888 16.67 10.174 16.419C7.954 16.168 5.619 15.308 5.619 11.476C5.619 10.385 6.009 9.492 6.649 8.794C6.546 8.54 6.202 7.524 6.746 6.148C6.746 6.148 7.586 5.879 9.496 7.173C10.295 6.95 11.15 6.84 12 6.836C12.85 6.84 13.705 6.95 14.504 7.172C16.413 5.878 17.252 6.147 17.252 6.147C17.798 7.523 17.454 8.541 17.352 8.793C17.992 9.492 18.378 10.384 18.378 11.475C18.378 15.316 16.041 16.162 13.813 16.41C14.172 16.717 14.492 17.327 14.492 18.262C14.492 19.597 14.48 20.677 14.48 21.003C14.48 21.272 14.66 21.582 15.168 21.484C19.138 20.161 22 16.416 22 12C22 6.477 17.523 2 12 2Z" fill="black"/>
            </svg>
          </a>
        </footer>
      </div>
    </article>
  )
}