import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import './App.css'
import './retro.css'
import Gallery from './Gallery'
import { projects, experience, type SectionId } from './data'
import BedroomScene from './components/BedroomScene'
import Modal from './components/Modal'
import { useSound } from './useSound'

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

function CameraIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  )
}

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 5 6 9H2v6h4l5 4V5Z" />
      {muted
        ? <path d="m16 9 6 6M22 9l-6 6" />
        : <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />}
    </svg>
  )
}

function MusicIcon({ on }: { on: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
      {!on && <path d="M2 2l20 20" />}
    </svg>
  )
}

// ── Nav ────────────────────────────────────────────────────────────────────

interface NavProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  onOpenSection: (section: SectionId | null) => void
}

function Nav({ theme, onToggleTheme, onOpenSection }: NavProps) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { sfxMuted, musicOn, toggleSfx, toggleMusic } = useSound()

  const openSection = (section: SectionId) => {
    if (pathname !== '/') navigate('/')
    onOpenSection(section)
  }

  return (
    <header className="nav-header">
      <nav className="nav-inner">
        <a
          href="/"
          className="nav-logo"
          onClick={(e) => {
            e.preventDefault()
            navigate('/')
            onOpenSection(null)
          }}
        >
          RW
        </a>

        <ul className="nav-links">
          {(['about', 'projects', 'experience'] as SectionId[]).map((s) => (
            <li key={s}>
              <button className="nav-link-btn" onClick={() => openSection(s)}>
                {s[0].toUpperCase() + s.slice(1)}
              </button>
            </li>
          ))}
        </ul>

        <div className="nav-actions">
          <button
            className="theme-toggle"
            onClick={toggleSfx}
            aria-label={sfxMuted ? 'Unmute sound effects' : 'Mute sound effects'}
            aria-pressed={!sfxMuted}
          >
            <SpeakerIcon muted={sfxMuted} />
          </button>
          <button
            className="theme-toggle"
            onClick={toggleMusic}
            aria-label={musicOn ? 'Stop chiptune music' : 'Play chiptune music'}
            aria-pressed={musicOn}
          >
            <MusicIcon on={musicOn} />
          </button>
          <Link to="/gallery" className="theme-toggle" aria-label="Gallery" onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}>
            <CameraIcon />
          </Link>
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

// ── Section content (rendered inside modals) ───────────────────────────────

function SocialLinks() {
  return (
    <div className="hero-links">
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
  )
}

function AboutContent() {
  return (
    <div>
      <h1 className="hero-name blink-caret">Rui Weng</h1>
      <p className="hero-bio">
        I'm currently a third-year computer science and math student at the University of Toronto.
        I enjoy building to solve real-world problems.
      </p>
      <p className="hero-bio">
        If I'm not coding, then I'm probably baking, reading, or playing badminton.
      </p>
      <SocialLinks />
    </div>
  )
}

function ProjectsContent() {
  return (
    <div className="project-list">
      {projects.map((p) => (
        <article key={p.name} className="project-item pixel-panel">
          <h3 className="project-name">{p.name}</h3>
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
                  aria-label={l.label}
                >
                  {l.label.toLowerCase().includes('github') ? <GitHubIcon /> : l.label}
                </a>
              ))}
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

function ExperienceContent() {
  return (
    <div className="exp-list">
      {experience.map((e) => (
        <article key={e.company} className="exp-item">
          <span className="exp-period">{e.period}</span>
          <div className="exp-header">
            <h3 className="exp-company">{e.company}</h3>
            <span className="exp-role">{e.role}</span>
          </div>
          <p className="exp-desc">{e.description}</p>
        </article>
      ))}
    </div>
  )
}

function ContactContent() {
  return (
    <div>
      <p className="hero-bio">
        I'm always happy to chat. Feel free to reach out!
      </p>
      <div className="contact-menu">
        <a href="mailto:rui.weng@mail.utoronto.ca">
          <EmailIcon /> Email
        </a>
        <a href="https://github.com/r-weng" target="_blank" rel="noreferrer">
          <GitHubIcon /> GitHub
        </a>
        <a href="https://www.linkedin.com/in/rui-weng-a52a44264/" target="_blank" rel="noreferrer">
          <LinkedInIcon /> LinkedIn
        </a>
      </div>
    </div>
  )
}

const SECTIONS: Record<SectionId, { title: string; content: () => React.ReactNode }> = {
  about: { title: 'About', content: AboutContent },
  projects: { title: 'Projects', content: ProjectsContent },
  experience: { title: 'Experience', content: ExperienceContent },
  contact: { title: 'Contact', content: ContactContent },
}

// ── Home ───────────────────────────────────────────────────────────────────

interface HomeProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  activeSection: SectionId | null
  onOpenSection: (section: SectionId | null) => void
}

function Home({ theme, onToggleTheme, activeSection, onOpenSection }: HomeProps) {
  // support old /#about style deep links
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash in SECTIONS) {
      onOpenSection(hash as SectionId)
      history.replaceState(null, '', '/')
    }
  }, [onOpenSection])

  const section = activeSection ? SECTIONS[activeSection] : null

  return (
    <main className="scene-stage">
      <BedroomScene theme={theme} onToggleTheme={onToggleTheme} onOpenSection={onOpenSection} />
      {section && (
        <Modal title={section.title} onClose={() => onOpenSection(null)}>
          {section.content()}
        </Modal>
      )}
    </main>
  )
}

export default function App() {
  const { theme, toggle } = useTheme()
  const [activeSection, setActiveSection] = useState<SectionId | null>(null)

  return (
    <div className="page">
      <Nav theme={theme} onToggleTheme={toggle} onOpenSection={setActiveSection} />
      <Routes>
        <Route
          path="/"
          element={
            <Home
              theme={theme}
              onToggleTheme={toggle}
              activeSection={activeSection}
              onOpenSection={setActiveSection}
            />
          }
        />
        <Route path="/gallery" element={<Gallery />} />
      </Routes>
      <Analytics />
    </div>
  )
}
