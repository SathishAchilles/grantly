import type { ComponentProps } from 'react'
import { Link } from 'react-router'

type Variant = 'primary' | 'secondary'

const base =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-pill px-5 text-small font-bold transition-[background-color,box-shadow,transform] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-55'

const variants: Record<Variant, string> = {
  primary: 'bg-forest text-white shadow-soft hover:bg-forest-deep hover:shadow-lift',
  secondary: 'border-2 border-border bg-surface text-ink hover:border-forest hover:bg-forest-soft',
}

interface ButtonProps extends ComponentProps<'button'> {
  variant?: Variant
}

/** A pill-shaped action button; the secondary variant is for lower-priority actions beside a primary one. */
export function Button({ variant = 'primary', className = '', type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={`${base} ${variants[variant]} ${className}`} {...props} />
}

interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variant?: Variant
}

/** A router link styled as a button, for actions that navigate to another page instead of changing state. */
export function ButtonLink({ variant = 'primary', className = '', ...props }: ButtonLinkProps) {
  return <Link className={`${base} ${variants[variant]} ${className}`} {...props} />
}
