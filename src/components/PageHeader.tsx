import { useEffect } from 'react'

interface PageHeaderProps {
  title: string
  purpose: string
}

export function PageHeader({ title, purpose }: PageHeaderProps) {
  useEffect(() => {
    document.title = `${title} | GRANTLY`
  }, [title])

  return (
    <div className="mb-8 max-w-3xl">
      <h1 className="font-display text-display leading-none font-semibold tracking-tight">{title}</h1>
      <p className="mt-4 text-lg text-muted">{purpose}</p>
    </div>
  )
}
