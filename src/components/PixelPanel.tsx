import type { ReactNode } from 'react'

interface PixelPanelProps {
  title?: string
  className?: string
  children: ReactNode
}

export default function PixelPanel({ title, className, children }: PixelPanelProps) {
  return (
    <div className={`pixel-panel${className ? ` ${className}` : ''}`}>
      {title && <span className="pixel-panel-title">{title}</span>}
      {children}
    </div>
  )
}
