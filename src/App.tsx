import { useState, useEffect, useRef } from 'react'
import './App.css'

// ── Types ──────────────────────────────────────────────────────────────────

interface Project {
  name: string
  description: string
  tech: string[]
  links: { label: string; url: string; external?: boolean }[]
  award?: string
}

interface Experience {
  period: string
  company: string
  role: string
  description: string
}

// ── Data ───────────────────────────────────────────────────────────────────

const projects: Project[] = [
  {
    name: 'Project Name',
    description: 'One or two sentences describing what this project does and why it matters.',
    tech: ['TypeScript', 'React', 'Node.js'],
    links: [
      { label: 'GitHub ↗', url: '#', external: true },
      { label: 'Live ↗', url: '#', external: true },
    ],
  },
  {
    name: 'Project Name',
    award: '1st Place · Some Hackathon',
    description: 'One or two sentences describing what this project does and why it matters.',
    tech: ['Python', 'FastAPI', 'PostgreSQL'],
    links: [
      { label: 'GitHub ↗', url: '#', external: true },
    ],
  },
  {
    name: 'Project Name',
    description: 'One or two sentences describing what this project does and why it matters.',
    tech: ['Go', 'Redis'],
    links: [
      { label: 'GitHub ↗', url: '#', external: true },
    ],
  },
]

const experience: Experience[] = [
  {
    period: '2023 — Present',
    company: 'Company Name',
    role: 'Job Title',
    description: 'Brief description of your role and key responsibilities or accomplishments.',
  },
  {
    period: '2021 — 2023',
    company: 'Company Name',
    role: 'Job Title',
    description: 'Brief description of your role and key responsibilities or accomplishments.',
  },
  {
    period: '2017 — 2021',
    company: 'University Name',
    role: 'B.S. Computer Science',
    description: 'Any relevant coursework, honors, or activities worth mentioning.',
  },
]

// ── Theme hook ─────────────────────────────────────────────────────────────

function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (document.documentElement.classList.contains('dark')) return 'dark'
    return 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    root.style.colorScheme = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggle = () => setTheme(t => (t === 'light' ? 'dark' : 'light'))
  return { theme, toggle }
}

// ── Icons ──────────────────────────────────────────────────────────────────

function EmailIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  )
}

// ── Nav ────────────────────────────────────────────────────────────────────

interface NavProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

function Nav({ theme, onToggleTheme }: NavProps) {
  return (
    <header className="nav-header">
      <nav className="nav-inner">
        <a href="#about" className="nav-logo">翁睿</a>

        <ul className="nav-links">
          <li><a href="#about">About</a></li>
          <li><a href="#projects">Projects</a></li>
          <li><a href="#experience">Experience</a></li>
        </ul>

        <div className="nav-actions">
          <button
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
        </div>
      </nav>
    </header>
  )
}

// ── Sections ───────────────────────────────────────────────────────────────

function useScrollOut(ref: React.RefObject<HTMLElement | null>) {
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
        // scrolled past upward — exit to top
        const progress = Math.min(1, -rect.top / (vh * 1.2))
        el.style.opacity = String(Math.max(0, 1 - progress * 1.5))
        el.style.transform = `translateY(-${progress * 30}vh)`
      } else {
        // below viewport — exit to bottom
        const progress = Math.min(1, (rect.top - vh) / (vh * 1.2))
        el.style.opacity = String(Math.max(0, 1 - progress * 1.5))
        el.style.transform = `translateY(${progress * 30}vh)`
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
}

function useScrollReveal(ref: React.RefObject<HTMLElement | null>) {
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
      ([entry]) => { entry.isIntersecting ? reveal() : hide() },
      { threshold: 0.1 }
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [ref])
}

function About() {
  const ref = useRef<HTMLElement>(null)
  useScrollReveal(ref)
  useScrollOut(ref)

  return (
    <section ref={ref} id="about" className="section section-about">
      <h1 className="hero-name" data-reveal data-delay="0.05">Rui Weng</h1>
      <p className="hero-bio" data-reveal data-delay="0.2">
        I'm currently a second-year computer science and math student at the University of Toronto.
        I enjoy building to solve real-world problems. Feel free to reach out!
      </p>
      <div className="hero-links" data-reveal data-delay="0.35">
        <a href="mailto:rui.weng@mail.utoronto.ca" className="hero-link" aria-label="Email">
          <EmailIcon />
        </a>
        <a href="https://github.com/r-weng" target="_blank" rel="noreferrer" className="hero-link" aria-label="GitHub">
          <GitHubIcon />
        </a>
        <a href="https://www.linkedin.com/in/rui-weng-a52a44264/" target="_blank" rel="noreferrer" className="hero-link" aria-label="LinkedIn">
          <LinkedInIcon />
        </a>
      </div>
    </section>
  )
}

function Projects() {
  const ref = useRef<HTMLElement>(null)
  useScrollReveal(ref)
  useScrollOut(ref)

  return (
    <section ref={ref} id="projects" className="section">
      <div className="section-header" data-reveal data-delay="0">
        <h2 className="section-title">Projects</h2>
      </div>
      <div className="project-list">
        {projects.map((p, i) => (
          <article key={p.name + i} className="project-item" data-reveal data-delay={i * 0.1}>
            <div className="project-top">
              <h3 className="project-name">{p.name}</h3>
              {p.award && <span className="project-award">{p.award}</span>}
            </div>
            <p className="project-desc">{p.description}</p>
            <div className="project-bottom">
              <div className="project-tags">
                {p.tech.map((t) => <span key={t} className="project-tag">{t}</span>)}
              </div>
              <div className="project-links">
                {p.links.map((l) => (
                  <a
                    key={l.label}
                    href={l.url}
                    target={l.external ? '_blank' : undefined}
                    rel={l.external ? 'noreferrer' : undefined}
                    className="project-link"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function Experience() {
  const ref = useRef<HTMLElement>(null)
  useScrollReveal(ref)
  useScrollOut(ref)

  return (
    <section ref={ref} id="experience" className="section">
      <div className="section-header" data-reveal data-delay="0">
        <h2 className="section-title">Experience</h2>
      </div>
      <div className="exp-list">
        {experience.map((e, i) => (
          <article key={e.company + i} className="exp-item" data-reveal data-delay={i * 0.1}>
            <span className="exp-period">{e.period}</span>
            <div className="exp-header">
              <h3 className="exp-company">{e.company}</h3>
              <span className="exp-role">{e.role}</span>
            </div>
            <p className="exp-desc">{e.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

// ── App ────────────────────────────────────────────────────────────────────

export default function App() {
  const { theme, toggle } = useTheme()

  return (
    <div className="page">
      <Nav theme={theme} onToggleTheme={toggle} />
      <main className="main">
        <About />
        <Projects />
        <Experience />
      </main>
    </div>
  )
}
