import type { ReactNode } from 'react'

interface SectionHeadingProps {
  id: string
  title: ReactNode
  subtitle?: string
}

export function SectionHeading({ id, title, subtitle }: SectionHeadingProps) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
      <h2 id={id} className="text-3xl font-medium tracking-tight text-primary md:text-4xl">
        {title}
      </h2>
      {subtitle && <p className="text-gray-900 md:text-lg">{subtitle}</p>}
    </div>
  )
}
