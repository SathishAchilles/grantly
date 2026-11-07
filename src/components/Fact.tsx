import { useId, type ReactNode } from 'react'

interface FactProps {
  label: string
  children: ReactNode
  termClassName?: string
  valueClassName?: string
}

/** A term and its value in a description list, with the value named by its term for assistive technology. */
export function Fact({ label, children, termClassName = 'font-semibold', valueClassName = '' }: FactProps) {
  const id = useId()
  return (
    <>
      <dt id={id} className={termClassName}>
        {label}
      </dt>
      <dd aria-labelledby={id} className={valueClassName}>
        {children}
      </dd>
    </>
  )
}
