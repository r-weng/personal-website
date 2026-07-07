import { useEffect, type RefObject } from 'react'

export function useScrollOut(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const handleScroll = () => {
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight

      if (rect.top >= 0 && rect.top <= vh) {
        el.style.opacity = '1'
        el.style.transform = 'none'
        return
      }

      if (rect.top < 0) {
        const progress = Math.min(1, -rect.top / (vh * 1.2))
        el.style.opacity = String(Math.max(0, 1 - progress * 1.5))
        el.style.transform = `translateY(-${progress * 30}vh)`
      } else {
        const progress = Math.min(1, (rect.top - vh) / (vh * 1.2))
        el.style.opacity = String(Math.max(0, 1 - progress * 1.5))
        el.style.transform = `translateY(${progress * 30}vh)`
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [ref])
}

export function useScrollReveal(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const container = ref.current
    if (!container) return
    const items = Array.from(container.querySelectorAll<HTMLElement>('[data-reveal]'))

    const reveal = () => {
      items.forEach((el) => {
        el.style.transitionDelay = `${el.dataset.delay ?? '0'}s`
        el.classList.add('revealed')
      })
    }

    const hide = () => {
      items.forEach((el) => {
        el.style.transitionDuration = '0s'
        el.classList.remove('revealed')
        requestAnimationFrame(() => { el.style.transitionDuration = '' })
      })
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) reveal()
        else hide()
      },
      { threshold: 0.1 }
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [ref])
}
