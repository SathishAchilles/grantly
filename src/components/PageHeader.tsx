import { useEffect } from 'react'

interface PageHeaderProps {
  title: string
  purpose: string
}

/** The page title and a one-line purpose, which also sets the browser tab title so each page is identifiable. */
export function PageHeader({ title, purpose }: PageHeaderProps) {
  useEffect(() => {
    document.title = `${title} | GRANTLY`
  }, [title])

  return (
    <div className="mb-8 max-w-3xl">
      <span aria-hidden="true" className="mb-4 flex gap-1.5">
        <span className="h-2 w-10 rounded-pill bg-forest" />
        <span className="h-2 w-4 rounded-pill bg-marigold" />
        <span className="h-2 w-2 rounded-pill bg-rust/70" />
      </span>
      <h1 className="font-display text-display leading-[1.05] font-extrabold tracking-tight">{title}</h1>
      <p className="mt-3 text-lg leading-relaxed text-muted sm:text-xl">{purpose}</p>
    </div>
  )
}
