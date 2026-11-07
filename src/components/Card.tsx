import type { ComponentProps } from 'react'

export function Card({ className = '', ...props }: ComponentProps<'section'>) {
  return <section className={`rounded-card border border-hairline bg-surface p-6 ${className}`} {...props} />
}
