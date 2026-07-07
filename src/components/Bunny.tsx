import { useRef, useState } from 'react'
import { sound } from '../sound'

// One cell = 4 SVG units, matching the scene's virtual pixel grid.
const C = 4

interface PxProps {
  x: number
  y: number
  w?: number
  h?: number
  c: string
}

function Px({ x, y, w = 1, h = 1, c }: PxProps) {
  return <rect x={x * C} y={y * C} width={w * C} height={h * C} fill={`var(--px-${c})`} />
}

interface BunnyProps {
  /** Top-left of the bunny in grid cells (ears row). */
  x: number
  y: number
}

export default function Bunny({ x, y }: BunnyProps) {
  const [hopping, setHopping] = useState(false)
  const [heart, setHeart] = useState(0)
  const clicks = useRef(0)
  const hopTimer = useRef<number | undefined>(undefined)

  const activate = () => {
    sound.chirp()
    clicks.current++
    setHopping(true)
    window.clearTimeout(hopTimer.current)
    hopTimer.current = window.setTimeout(() => setHopping(false), 500)
    if (clicks.current % 5 === 0) setHeart((h) => h + 1)
  }

  return (
    <g
      className={`bunny${hopping ? ' is-hopping' : ''}`}
      role="button"
      tabIndex={0}
      aria-label="Pet the bunny"
      onClick={activate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          activate()
        }
      }}
    >
      {/* oversized invisible hit area */}
      <rect x={(x - 1) * C} y={(y - 1) * C} width={8 * C} height={10 * C} fill="transparent" />

      <g className="bunny-body-g">
        {/* ears */}
        <g className="ear-l">
          <Px x={x} y={y} w={1} h={3} c="bunny" />
          <Px x={x} y={y + 1} w={1} h={1} c="accent" />
        </g>
        <g className="ear-r">
          <Px x={x + 3} y={y} w={1} h={3} c="bunny" />
          <Px x={x + 3} y={y + 1} w={1} h={1} c="accent" />
        </g>

        {/* head */}
        <Px x={x - 1} y={y + 3} w={6} h={3} c="bunny" />
        {/* eye */}
        <g className="eye">
          <Px x={x} y={y + 4} w={1} h={1} c="outline" />
          <Px x={x + 3} y={y + 4} w={1} h={1} c="outline" />
        </g>
        {/* nose */}
        <Px x={x + 1} y={y + 5} w={2} h={1} c="accent" />

        {/* body */}
        <Px x={x - 1} y={y + 6} w={7} h={3} c="bunny" />
        <Px x={x - 1} y={y + 8} w={7} h={1} c="bunny-shade" />
        {/* tail */}
        <Px x={x + 6} y={y + 6} w={1} h={1} c="sheet" />
        {/* front paws */}
        <Px x={x} y={y + 8} w={1} h={1} c="bunny-shade" />
        <Px x={x + 3} y={y + 8} w={1} h={1} c="bunny-shade" />
      </g>

      {/* pixel heart pops on every 5th pet */}
      {heart > 0 && (
        <g key={heart} className="bunny-heart" aria-hidden="true">
          <Px x={x + 1} y={y - 4} w={1} h={1} c="accent" />
          <Px x={x + 3} y={y - 4} w={1} h={1} c="accent" />
          <Px x={x} y={y - 3} w={5} h={1} c="accent" />
          <Px x={x + 1} y={y - 2} w={3} h={1} c="accent" />
          <Px x={x + 2} y={y - 1} w={1} h={1} c="accent" />
        </g>
      )}
    </g>
  )
}
