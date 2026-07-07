// ── Types ──────────────────────────────────────────────────────────────────

export type SectionId = 'about' | 'projects' | 'experience' | 'contact'

export interface Project {
  name: string
  description: string
  tech: string[]
  links: { label: string; url: string; external?: boolean }[]
}

export interface Experience {
  period: string
  company: string
  role: string
  description: string
}

// ── Data ───────────────────────────────────────────────────────────────────

export const projects: Project[] = [
  {
    name: 'The Mind Museum',
    description: 'A full-stack, AI-powered 3D museum that transforms PDFs into interactive virtual exhibits, enabling immersive, spatial learning through LLM-generated content and real-time user exploration.',
    tech: ['Next.js', 'Three.js', 'Flask', 'ChromaDB', 'Sentence Transformers', 'LLM APIs'],
    links: [
      { label: 'GitHub', url: 'https://github.com/BryanYeeee/TheMindMuseum', external: true },
    ],
  },
  {
    name: 'Rostr',
    description: 'A full-stack fantasy baseball decision-support platform using a custom grading algorithm to evaluate trades, compute pitcher performance scores, and generate optimized pitching order recommendations.',
    tech: ['React', 'Node.js', 'TypeScript', 'Tailwind CSS', 'Docker', 'PostgreSQL'],
    links: [
      { label: 'GitHub', url: 'https://github.com/rostr-ftl2025/rostr', external: true },
    ],
  },
  {
    name: 'YouLingo (now Mora)',
    description: 'A full-stack web application that enables users to learn languages through personalized YouTube content.',
    tech: ['React', 'Node.js', 'Flask', 'Google Cloud Firestore', 'Auth0'],
    links: [
      { label: 'GitHub', url: 'https://github.com/Cindyzzz616/Mora', external: true },
    ],
  },
]

export const experience: Experience[] = [
  {
    period: 'May 2026 — Present',
    company: 'Acceleration Consortium',
    role: 'Research Assistant',
    description: 'Building an agentic AI system to automate research workflows and accelerate experiment execution in SDL6, the self-driving lab for human organ mimicry. Supervised by Dr. Ilya Yakavets.',
  },
  {
    period: 'May 2026 — Present',
    company: 'Department of Computer Science, University of Toronto',
    role: 'Software Developer',
    description: 'Designing and maintaining Courseography, an interactive course planning and prerequisite visualization tool used by 3900+ students. Supervised by Professor David Liu.',
  },
  {
    period: 'Feb 2026 — Present',
    company: 'UofTHacks',
    role: 'Software Engineer',
    description: 'Building the official UofTHacks 14 website.',
  },
  {
    period: 'Sep 2024 — May 2028',
    company: 'University of Toronto',
    role: 'B.S. Computer Science and Math',
    description: 'Currently studying computer science and math at the University of Toronto.',
  },
]
