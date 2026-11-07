import type { ComponentProps } from 'react'

/** A padded, bordered surface that groups one section of related content on a page. */
export function Card({ className = '', ...props }: ComponentProps<'section'>) {
  return (
    <section
      className={`rounded-card border border-hairline bg-surface p-5 shadow-soft sm:p-7 ${className}`}
      {...props}
    />
  )
}
