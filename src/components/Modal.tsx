import { useEffect, useRef, type ReactNode } from 'react'
import './Modal.css'

interface ModalProps {
  title: string
  /** Fixed height, so long scrolling sections all match. */
  tall?: boolean
  onClose: () => void
  children: ReactNode
}

export default function Modal({ title, tall, onClose, children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    panelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={panelRef}
        className={`pixel-panel modal-panel${tall ? ' modal-tall' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        <span className="pixel-panel-title">{title}</span>
        <button className="modal-close pixel-btn" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <div className="modal-content">{children}</div>
      </div>
    </div>
  )
}
