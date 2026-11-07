import type { ComponentProps } from 'react'
import { Link } from 'react-router'

type Variant = 'primary' | 'secondary'

const base =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-4 text-small font-semibold transition-colors'

const variants: Record<Variant, string> = {
  primary: 'bg-forest text-white hover:bg-forest-deep',
  secondary: 'border border-border bg-surface text-ink hover:bg-paper',
}

interface ButtonProps extends ComponentProps<'button'> {
  variant?: Variant
}

export function Button({ variant = 'primary', className = '', type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={`${base} ${variants[variant]} ${className}`} {...props} />
}

interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variant?: Variant
}

export function ButtonLink({ variant = 'primary', className = '', ...props }: ButtonLinkProps) {
  return <Link className={`${base} ${variants[variant]} ${className}`} {...props} />
}
