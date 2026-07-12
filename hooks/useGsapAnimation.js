import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * Hook: useGsapAnimation
 * @param {Object} options
 * @param {string} options.animation - 'fadeUp' | 'fadeLeft' | 'fadeRight' | 'fadeIn' | 'scaleIn' | 'staggerFade'
 * @param {number} options.delay - delay in seconds
 * @param {number} options.duration - duration in seconds
 * @param {number} options.stagger - stagger delay for children
 * @param {number} options.triggerOffset - ScrollTrigger start offset (default "top 85%")
 * @param {boolean} options.once - animate only once (default true)
 * @param {Array} options.deps - dependency array for re-triggering
 * @returns {React.RefObject} ref - attach to the element to animate
 */
export default function useGsapAnimation(options = {}) {
  const ref = useRef(null)
  const {
    animation = 'fadeUp',
    delay = 0,
    duration = 0.8,
    stagger = 0.1,
    triggerOffset = 'top 85%',
    once = true,
    deps = []
  } = options

  useEffect(() => {
    const el = ref.current
    if (!el || typeof window === 'undefined') return

    // Kill any existing animations
    const ctx = gsap.context(() => {
      const defaults = {
        duration,
        ease: 'power3.out',
        delay
      }

      // Set initial state
      gsap.set(el, { opacity: 0 })

      const buildAnimation = () => {
        const children = el.children.length > 0 ? el.children : [el]

        switch (animation) {
          case 'fadeUp':
            gsap.fromTo(children, 
              { y: 60, opacity: 0 },
              { ...defaults, y: 0, opacity: 1, stagger }
            )
            break

          case 'fadeLeft':
            gsap.fromTo(children,
              { x: -80, opacity: 0 },
              { ...defaults, x: 0, opacity: 1, stagger }
            )
            break

          case 'fadeRight':
            gsap.fromTo(children,
              { x: 80, opacity: 0 },
              { ...defaults, x: 0, opacity: 1, stagger }
            )
            break

          case 'fadeIn':
            gsap.to(children, { ...defaults, opacity: 1, stagger })
            break

          case 'scaleIn':
            gsap.fromTo(children,
              { scale: 0.8, opacity: 0 },
              { ...defaults, scale: 1, opacity: 1, stagger }
            )
            break

          case 'staggerFade':
            gsap.fromTo(children,
              { y: 30, opacity: 0 },
              { ...defaults, y: 0, opacity: 1, stagger: stagger || 0.15 }
            )
            break

          case 'none':
            gsap.set(el, { opacity: 1 })
            break

          default:
            gsap.fromTo(children,
              { y: 60, opacity: 0 },
              { ...defaults, y: 0, opacity: 1, stagger }
            )
        }
      }

      // Check if this is a heading/text we want to animate on scroll
      if (once) {
        ScrollTrigger.create({
          trigger: el,
          start: triggerOffset,
          onEnter: buildAnimation,
          once: true
        })
      } else {
        // Always animate on enter/re-enter
        ScrollTrigger.create({
          trigger: el,
          start: triggerOffset,
          onEnter: buildAnimation,
          onLeaveBack: () => gsap.set(el, { opacity: 0 }),
          onEnterBack: buildAnimation
        })
      }
    }, el)

    return () => ctx.revert()
  }, [animation, delay, duration, stagger, triggerOffset, once, ...deps])

  return ref
}

/**
 * Parallax hook for background elements
 */
export function useParallax(speed = 0.3) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          gsap.set(el, { y: self.progress * speed * 200 })
        }
      })
    }, el)

    return () => ctx.revert()
  }, [speed])

  return ref
}