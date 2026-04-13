import { useRef } from 'react'
import './Gallery.css'
import { useScrollReveal } from './hooks'

const photos = Object.values(
  import.meta.glob('./assets/gallery/*', { eager: true, import: 'default' }) as Record<string, string>
)

export default function Gallery() {
  const ref = useRef<HTMLElement>(null)
  useScrollReveal(ref)

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
            <div key={i} className="gallery-item" data-reveal data-delay={i * 0.05}>
              <img
                src={src}
                alt=""
                className="gallery-img"
                onLoad={e => e.currentTarget.classList.add('loaded')}
              />
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
