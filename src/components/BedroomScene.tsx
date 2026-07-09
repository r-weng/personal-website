import { useState, useSyncExternalStore, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import Bunny from './Bunny'
import { sound } from '../sound'
import type { SectionId } from '../data'
import './BedroomScene.css'

// Wide viewports crop the scene edges slightly (slice); narrower ones fit the
// whole room (meet) with wall/floor-colored letterbox bands.
const wideQuery = window.matchMedia('(min-aspect-ratio: 8/5)')

function useWideViewport() {
  return useSyncExternalStore(
    (cb) => {
      wideQuery.addEventListener('change', cb)
      return () => wideQuery.removeEventListener('change', cb)
    },
    () => wideQuery.matches,
  )
}

// The scene is drawn on a virtual pixel grid: one cell = 4 SVG units,
// viewBox 384x216 = 96x54 cells. All art below is cell coordinates.
const C = 4

// [x, y, w, h, colorToken, opacity?]
type Cell = [number, number, number, number, string, number?]

// Shift a sprite's cells so objects can be repositioned as a unit.
function shift(dx: number, dy: number, list: Cell[]): Cell[] {
  return list.map(([x, y, w, h, c, o]) => [x + dx, y + dy, w, h, c, o])
}

function cells(list: Cell[]) {
  return list.map(([x, y, w, h, c, o], i) => (
    <rect
      key={i}
      x={x * C}
      y={y * C}
      width={w * C}
      height={h * C}
      fill={`var(--px-${c})`}
      fillOpacity={o}
    />
  ))
}

// ── Pixel art data ──────────────────────────────────────────────────────────

const BACKGROUND: Cell[] = [
  [0, 0, 96, 36, 'wall'],
  [0, 36, 96, 2, 'wall-shade'],
  [0, 38, 96, 1, 'floor-dark'],
  [0, 39, 96, 15, 'floor'],
  // floorboard seams
  [3, 42, 9, 0.25, 'floor-dark'], [18, 42, 11, 0.25, 'floor-dark'],
  [36, 42, 9, 0.25, 'floor-dark'], [52, 42, 11, 0.25, 'floor-dark'],
  [70, 42, 9, 0.25, 'floor-dark'], [86, 42, 8, 0.25, 'floor-dark'],
  [10, 46, 11, 0.25, 'floor-dark'], [28, 46, 9, 0.25, 'floor-dark'],
  [46, 46, 11, 0.25, 'floor-dark'], [64, 46, 9, 0.25, 'floor-dark'],
  [80, 46, 10, 0.25, 'floor-dark'],
  [5, 50, 9, 0.25, 'floor-dark'], [22, 50, 11, 0.25, 'floor-dark'],
  [42, 50, 9, 0.25, 'floor-dark'], [60, 50, 11, 0.25, 'floor-dark'],
  [78, 50, 9, 0.25, 'floor-dark'],
]

// centered over the bed + nightstand group (x8–35, center 21.5)
const WINDOW_FRAME: Cell[] = shift(10, 7, [
  [5, 4, 13, 11, 'wood'],
  [6, 5, 11, 9, 'sky'],
  [11.25, 5, 0.5, 9, 'wood'],
  [6, 9.25, 11, 0.5, 'wood'],
  [4, 15, 15, 1, 'wood-dark'],
])

const WINDOW_DAY: Cell[] = shift(10, 7, [
  [14, 6, 2, 2, 'sun-moon'],
  [7, 8, 4, 1, 'cloud-star'],
  [8, 7.5, 2, 0.5, 'cloud-star'],
  [13, 11.5, 3, 1, 'cloud-star'],
])

const WINDOW_NIGHT: Cell[] = shift(10, 7, [
  [14, 6, 2, 2, 'sun-moon'],
  [13.5, 6.5, 1, 1, 'sky'],
  [7.5, 7, 0.5, 0.5, 'cloud-star'],
  [9.5, 11.5, 0.5, 0.5, 'cloud-star'],
  [13, 10, 0.5, 0.5, 'cloud-star'],
  [7, 12.5, 0.5, 0.5, 'cloud-star'],
  [16, 11, 0.5, 0.5, 'cloud-star'],
  [10, 6, 0.5, 0.5, 'cloud-star'],
])

// Square clock face; hands are drawn separately, rotated to the real time.
const CLOCK_FACE: Cell[] = shift(7, 9, [
  [32, 5, 4, 4, 'outline'],
  [32.5, 5.5, 3, 3, 'sheet'],
])

// Clock center in SVG units: cell (41, 16)
const CLOCK_CX = 41 * 4
const CLOCK_CY = 16 * 4

const RUG: Cell[] = shift(13, 9, [
  [29, 33, 12, 7, 'accent-3'],
  [29, 33, 12, 1, 'accent'],
  [29, 39, 12, 1, 'accent'],
  [29, 34, 1, 5, 'accent'],
  [40, 34, 1, 5, 'accent'],
  [31, 35, 1, 1, 'sheet'],
  [38, 37, 1, 1, 'sheet'],
])

const BED: Cell[] = shift(6, 7, [
  [2, 23, 2, 10, 'wood'],          // headboard
  [16, 25, 2, 8, 'wood'],          // footboard
  [4, 25, 12, 5, 'sheet'],         // mattress (reaches the bed base — no wall gap)
  [4, 25, 4, 2, 'sheet'],          // pillow, level with the sheets
  [8, 25, 8, 5, 'accent'],         // blanket
  [8, 28, 8, 1, 'accent-3'],       // blanket stripe
  [4, 30, 12, 2, 'wood'],          // bed base
  [4, 32, 1, 2.5, 'wood-dark'],    // legs (ground line at y41.5, like all furniture)
  [15, 32, 1, 2.5, 'wood-dark'],
])

const BOOKSHELF: Cell[] = shift(25, 9.5, [
  [55, 10, 8, 22, 'wood'],
  [56, 11, 6, 20, 'wood-dark'],
  [56, 17, 6, 1, 'wood'],
  [56, 24, 6, 1, 'wood'],
  // trophy on top shelf
  [58, 13, 2, 2, 'gold'],
  [58.75, 15, 0.5, 1, 'gold'],
  [58.25, 16, 1.5, 1, 'gold'],
  // middle shelf books
  [56, 20, 1, 4, 'accent'],
  [57, 21, 1, 3, 'accent-2'],
  [58, 20, 1, 4, 'accent-3'],
  [59, 21, 1, 3, 'accent'],
  [60, 20, 1, 4, 'accent-2'],
  [61, 21, 1, 3, 'accent-3'],
  // bottom shelf books
  [56, 27, 1, 4, 'accent-3'],
  [57, 28, 1, 3, 'accent-2'],
  [58, 27, 1, 4, 'accent'],
  [59, 28, 1, 3, 'accent-3'],
  [60, 27, 1, 4, 'accent-2'],
])

// desk is static decor; only the computer on it is the Projects hotspot
const DESK: Cell[] = shift(19, 7, [
  [42, 26, 14, 1.5, 'wood'],
  [42, 27.5, 1.5, 7, 'wood-dark'],
  [54.5, 27.5, 1.5, 7, 'wood-dark'],
])

// monitor on the right side of the desk, clear of the figure
const MONITOR: Cell[] = shift(19, 7, [
  [48, 18, 8, 6, 'outline'],
  [51.5, 24, 1, 2, 'outline'],
  [50.5, 25.5, 3, 0.5, 'outline'],
])

const MONITOR_SCREEN: Cell[] = shift(19, 7, [
  [49, 19, 6, 4, 'screen'],
])

// code editor: lines with indents filling the screen
const MONITOR_CODE: Cell[] = shift(19, 7, [
  [49.5, 19.5, 2.5, 0.5, 'screen-dark'],
  [50.25, 20.25, 3, 0.5, 'screen-dark'],
  [50.25, 21, 2, 0.5, 'screen-dark'],
  [51, 21.75, 2.5, 0.5, 'screen-dark'],
  [49.5, 22.5, 2, 0.5, 'screen-dark'],
  [53.5, 19.5, 1, 0.5, 'screen-dark'],
])

// Standing figure at the desk, back view — tapered silhouette:
// shoulders 4 → chest 4.5 → 3.5 → waist 2.5 → hips 4
const RUI: Cell[] = shift(18, 8.5, [
  [46.5, 27, 1, 5, 'skin'],        // left leg
  [48.5, 27, 1, 5, 'skin'],        // right leg
  [46.25, 32, 1.5, 1, 'outline'],  // left shoe (on the floor)
  [48.25, 32, 1.5, 1, 'outline'],  // right shoe
  [46, 25.5, 4, 1.5, 'accent-3'],  // shorts/hips
  [46.75, 24.5, 2.5, 1, 'skin'],   // narrow bare waist
  [46, 22, 4, 1, 'top'],           // shoulders
  [45.75, 23, 4.5, 1, 'top'],      // chest (widest)
  [46.25, 24, 3.5, 0.5, 'top'],    // hem tapering in
  [45.5, 22.5, 0.5, 3, 'skin'],    // left arm
  [50, 22.5, 0.5, 3, 'skin'],      // right arm
  [47.5, 21.5, 1, 0.5, 'skin'],    // neck
  [46.5, 19, 3, 2.5, 'hair'],      // head
  [46, 21, 4, 0.5, 'hair'],        // hair flare at the nape
  [47.75, 21.5, 1.5, 0.5, 'hair'], // ponytail tie
  [48, 22, 1, 3, 'hair'],          // ponytail down the back
  // highlights so the hair reads against the monitor frame
  [47, 19.5, 1.5, 0.5, 'hair-hi'],
  [46.75, 20.25, 0.5, 0.75, 'hair-hi'],
  [48.5, 20, 0.75, 0.5, 'hair-hi'],
  [48.25, 22.5, 0.5, 1.25, 'hair-hi'],
  [48.25, 24.25, 0.5, 0.5, 'hair-hi'],
])

const NIGHTSTAND: Cell[] = shift(7, 7, [
  [21, 26, 7, 1, 'wood'],
  [22, 27, 5, 6, 'wood-dark'],
  [24, 29, 1, 1, 'gold'],          // knob
  [22, 33, 1, 1.5, 'wood-dark'],   // legs (ground line at y41.5, like all furniture)
  [26, 33, 1, 1.5, 'wood-dark'],
])

const PHONE: Cell[] = shift(7, 7, [
  [25.5, 24, 2, 2, 'accent-3'],
  [26, 24.5, 1, 1, 'screen'],
])

const PHONE_NOTIF: Cell[] = shift(7, 7, [
  [27, 23.75, 0.5, 0.5, 'accent'],
])

// nudged right: the staggered layout leans left, so the visual center
// sits left of the bounding-box center
const PHOTO_WALL: Cell[] = shift(11.5, 7.5, [
  [38, 5, 3, 3, 'sheet'],
  [38.5, 5.5, 2, 1.5, 'accent-3'],
  [42, 5, 3, 3, 'sheet'],
  [42.5, 5.5, 2, 1.5, 'accent-2'],
  [40, 9, 3, 3, 'sheet'],
  [40.5, 9.5, 2, 1.5, 'accent'],
  [44, 9, 3, 3, 'sheet'],
  [44.5, 9.5, 2, 1.5, 'screen'],
])

const LAMP: Cell[] = shift(7, 7, [
  [21, 20, 4, 3, 'gold'],          // shade
  [22.5, 23, 1, 3, 'wood-dark'],   // stem
  [22, 25.5, 2, 0.5, 'wood-dark'], // base
])

const LAMP_GLOW: Cell[] = shift(7, 7, [
  [17, 16, 12, 12, 'glow', 0.08],
  [19, 18, 8, 8, 'glow', 0.15],
  [20.5, 19.5, 5, 5, 'glow', 0.25],
])

// Clock and caption both show Toronto time, wherever the visitor is.
function torontoTime(d: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Toronto',
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0)
  return { h: get('hour'), m: get('minute') }
}

// WMO weather codes → short description (Open-Meteo)
function wmoText(code: number): string {
  if (code === 0) return 'clear'
  if (code <= 2) return 'partly cloudy'
  if (code === 3) return 'overcast'
  if (code === 45 || code === 48) return 'foggy'
  if (code <= 57) return 'drizzly'
  if (code <= 67) return 'rainy'
  if (code <= 77) return 'snowy'
  if (code <= 82) return 'rain showers'
  if (code <= 86) return 'snow showers'
  return 'thunderstorms'
}

// ── Hotspot ─────────────────────────────────────────────────────────────────

interface HotspotProps {
  href: string
  label: string
  caption: string
  hit: [number, number, number, number][]
  onCaption: (text: string | null) => void
  onClick: (e: React.MouseEvent) => void
  children: ReactNode
}

function Hotspot({ href, label, caption, hit, onCaption, onClick, children }: HotspotProps) {
  return (
    <a
      href={href}
      className="hotspot"
      aria-label={label}
      onMouseEnter={() => {
        sound.blip()
        onCaption(caption)
      }}
      onMouseLeave={() => onCaption(null)}
      onFocus={() => onCaption(caption)}
      onBlur={() => onCaption(null)}
      onClick={(e) => {
        sound.confirm()
        onClick(e)
      }}
    >
      <g className="obj">{children}</g>
      {hit.map(([x, y, w, h], i) => (
        <rect key={i} x={x * C} y={y * C} width={w * C} height={h * C} fill="transparent" />
      ))}
    </a>
  )
}

// ── Scene ───────────────────────────────────────────────────────────────────

interface BedroomSceneProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  onOpenSection: (section: SectionId) => void
}

const DEFAULT_CAPTION = 'Click on objects around my room to learn about me!'

export default function BedroomScene({ theme, onToggleTheme, onOpenSection }: BedroomSceneProps) {
  const navigate = useNavigate()
  const [caption, setCaption] = useState<string | null>(null)
  const wide = useWideViewport()

  const onCaption = (text: string | null) => setCaption(text)

  const open = (section: SectionId) => (e: React.MouseEvent) => {
    e.preventDefault()
    onOpenSection(section)
  }

  const toggleLamp = () => {
    sound.power(theme === 'light')
    onToggleTheme()
  }

  const [now, setNow] = useState(() => new Date())
  const toronto = torontoTime(now)
  const hourAngle = ((toronto.h % 12) + toronto.m / 60) * 30
  const minuteAngle = toronto.m * 6

  const [weather, setWeather] = useState<string | null>(null)

  const checkWeather = async () => {
    sound.power(true)
    if (weather) {
      onCaption(`[Window] It's ${weather} in Toronto right now.`)
      return
    }
    onCaption('[Window] Checking the weather…')
    try {
      const r = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=43.6532&longitude=-79.3832&current=temperature_2m,weather_code',
      )
      const d = await r.json()
      const text = `${wmoText(d.current.weather_code)}, ${Math.round(d.current.temperature_2m)}°C`
      setWeather(text)
      onCaption(`[Window] It's ${text} in Toronto right now.`)
    } catch {
      onCaption("[Window] Unable to check the current weather :(")
    }
  }

  const tellTime = () => {
    const t = new Date()
    setNow(t)
    sound.power(true)
    onCaption(`[Clock] It's currently ${t.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', timeZone: 'America/Toronto' })} in Toronto.`)
  }

  return (
    <div className="scene-wrap">
      <p className="visually-hidden">
        Interactive pixel-art bedroom: objects in the room open the site sections.
        You can also use the navigation bar at the top of the page.
      </p>
      <svg
        className="bedroom-scene"
        viewBox="0 0 384 216"
        preserveAspectRatio={wide ? 'xMidYMid slice' : 'xMidYMid meet'}
        shapeRendering="crispEdges"
        aria-label="Pixel art bedroom with Rui at her desk and a pet bunny"
      >
        {/* background */}
        {cells(BACKGROUND)}

        {/* window (sky swaps with theme) — click for Toronto weather */}
        <g
          className="hotspot"
          role="button"
          tabIndex={0}
          aria-label="[Window] Check the weather in Toronto."
          onMouseEnter={() => {
            sound.blip()
            onCaption("[Window] How's it looking outside?")
          }}
          onMouseLeave={() => onCaption(null)}
          onFocus={() => onCaption("[Window] How's it looking outside?")}
          onBlur={() => onCaption(null)}
          onClick={checkWeather}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              void checkWeather()
            }
          }}
        >
          <g className="obj">
            {cells(WINDOW_FRAME)}
            <g className="day-only" aria-hidden="true">{cells(WINDOW_DAY)}</g>
            <g className="night-only" aria-hidden="true">{cells(WINDOW_NIGHT)}</g>
          </g>
          <rect x={14 * C} y={10.5 * C} width={16 * C} height={13 * C} fill="transparent" />
        </g>

        {/* clock — click to read the time */}
        <g
          className="hotspot"
          role="button"
          tabIndex={0}
          aria-label="[Clock] Check the time in Toronto."
          onMouseEnter={() => {
            sound.blip()
            onCaption('[Clock] What time is it right now?')
          }}
          onMouseLeave={() => onCaption(null)}
          onFocus={() => onCaption('[Clock] What time is it right now?')}
          onBlur={() => onCaption(null)}
          onClick={tellTime}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              tellTime()
            }
          }}
        >
          <g className="obj">
            {cells(CLOCK_FACE)}
            <rect
              x={CLOCK_CX - 0.5}
              y={CLOCK_CY - 4.5}
              width={1}
              height={4.5}
              fill="var(--px-outline)"
              transform={`rotate(${hourAngle} ${CLOCK_CX} ${CLOCK_CY})`}
            />
            <rect
              x={CLOCK_CX - 0.5}
              y={CLOCK_CY - 5.5}
              width={1}
              height={5.5}
              fill="var(--px-outline)"
              transform={`rotate(${minuteAngle} ${CLOCK_CX} ${CLOCK_CY})`}
            />
          </g>
          <rect x={38 * C} y={13 * C} width={6 * C} height={6 * C} fill="transparent" />
        </g>

        {/* decor */}
        {cells(RUG)}

        {/* bed is static decor */}
        {cells(BED)}

        {/* desk is static decor; only the computer lifts on hover */}
        {cells(DESK)}

        {/* projects — computer on the desk */}
        <Hotspot
          href="#projects"
          label="[Computer] Projects"
          caption="[Computer] Projects"
          hit={[[66.5, 24.5, 9, 9]]}
          onCaption={onCaption}
          onClick={open('projects')}
        >
          {cells(MONITOR)}
          <g className="screen-glow">{cells(MONITOR_SCREEN)}</g>
          {cells(MONITOR_CODE)}
        </Hotspot>

        {/* about — Rui at the desk; drawn after the computer hotspot so
            clicking or hovering her opens About, not Projects */}
        <Hotspot
          href="#about"
          label="[Rui] About"
          caption="[Rui] About :)"
          hit={[[63, 26.5, 6.5, 15.5]]}
          onCaption={onCaption}
          onClick={open('about')}
        >
          {cells(RUI)}
        </Hotspot>

        {/* experience — bookshelf */}
        <Hotspot
          href="#experience"
          label="[Bookshelf] Experience"
          caption="[Bookshelf] Experience"
          hit={[[79, 18.5, 10, 24]]}
          onCaption={onCaption}
          onClick={open('experience')}
        >
          {cells(BOOKSHELF)}
        </Hotspot>

        {/* nightstand stays put; only the phone reacts to hover */}
        {cells(NIGHTSTAND)}

        {/* contact — phone on the nightstand */}
        <Hotspot
          href="#contact"
          label="[Phone] Contact"
          caption="[Phone] Contact"
          hit={[[31.5, 30, 4, 4.5]]}
          onCaption={onCaption}
          onClick={open('contact')}
        >
          {cells(PHONE)}
          <g className="phone-notif">{cells(PHONE_NOTIF)}</g>
        </Hotspot>

        {/* gallery — photo wall */}
        <Hotspot
          href="/gallery"
          label="[Photo wall] Gallery"
          caption="[Photo wall] Gallery"
          hit={[[48.5, 11.5, 11, 9]]}
          onCaption={onCaption}
          onClick={(e) => {
            e.preventDefault()
            navigate('/gallery')
            window.scrollTo({ top: 0, behavior: 'instant' })
          }}
        >
          {cells(PHOTO_WALL)}
        </Hotspot>

        {/* lamp — theme toggle */}
        <g
          className="hotspot"
          role="button"
          tabIndex={0}
          aria-label="[Lamp] Toggle day/night"
          aria-pressed={theme === 'dark'}
          onMouseEnter={() => {
            sound.blip()
            onCaption('[Lamp] Toggle day/night')
          }}
          onMouseLeave={() => onCaption(null)}
          onFocus={() => onCaption('[Lamp] Toggle day/night')}
          onBlur={() => onCaption(null)}
          onClick={toggleLamp}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              toggleLamp()
            }
          }}
        >
          <g className="obj">{cells(LAMP)}</g>
          <rect x={27.5 * C} y={26.5 * C} width={4.5 * C} height={7 * C} fill="transparent" />
        </g>

        {/* bunny — easter egg */}
        <Bunny x={45.5} y={33} onCaption={onCaption} />

        {/* lamp glow overlay (night only) */}
        <g className="lamp-glow" pointerEvents="none" aria-hidden="true">
          {cells(LAMP_GLOW)}
        </g>
      </svg>

      <div className="pixel-panel scene-caption" aria-live="polite">
        {caption && <span className="caption-accent">▶</span>}
        {caption ?? DEFAULT_CAPTION}
      </div>
    </div>
  )
}
