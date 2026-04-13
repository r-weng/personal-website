import { useState, useEffect, useRef } from 'react'
import './Gallery.css'
import { useScrollReveal } from './hooks'

const photos = Object.values(
  import.meta.glob('./assets/gallery/*', { eager: true, import: 'default' }) as Record<string, string>
)

export default function Gallery() {
  const ref = useRef<HTMLElement>(null)
  const [lightbox, setLightbox] = useState<string | null>(null)
  useScrollReveal(ref)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setLightbox(null); return }
      if (!lightbox) return
      const idx = photos.indexOf(lightbox)
      if (e.key === 'ArrowRight') setLightbox(photos[(idx + 1) % photos.length])
      if (e.key === 'ArrowLeft') setLightbox(photos[(idx - 1 + photos.length) % photos.length])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox])

  return (
    <main ref={ref} className="main gallery-page">
      <div className="section-header" data-reveal data-delay="0">
        <h1 className="section-title">Gallery</h1>
      </div>

      {photos.length === 0 ? (
        <p className="gallery-empty" data-reveal data-delay="0.1">Coming soon!</p>
      ) : (
        <div className="gallery-grid">
          {photos.map((src, i) => (
            <div key={i} className="gallery-item" data-reveal data-delay={i * 0.05} onClick={() => setLightbox(src)}>
              <img src={src} alt="" className="gallery-img" />
            </div>
          ))}
        </div>
      )}

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <img
            src={lightbox}
            alt=""
            className="lightbox-img"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </main>
  )
}
