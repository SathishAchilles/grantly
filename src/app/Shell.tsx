import { ShieldCheck, Sprout } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link, NavLink, Outlet, ScrollRestoration, useLocation } from 'react-router'
import { PersonSwitch } from '@/components/PersonSwitch'
import { ResetDemo } from '@/components/ResetDemo'
import { areas } from './areas'

/** The page frame: skip link, header with navigation, main area, footer and scroll restoration. */
export function Shell() {
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const previousPathname = useRef(pathname)

  useEffect(() => {
    if (previousPathname.current === pathname) return
    previousPathname.current = pathname
    mainRef.current?.focus()
  }, [pathname])

  useEffect(() => {
    const nav = navRef.current
    const link = nav?.querySelector<HTMLElement>('[aria-current="page"]')
    if (nav && link) nav.scrollLeft = link.offsetLeft - (nav.clientWidth - link.offsetWidth) / 2
  }, [pathname])

  return (
    <div className="flex min-h-dvh flex-col pb-24 xl:pb-0">
      <a
        href="#main"
        className="fixed top-2 left-2 z-50 -translate-y-20 rounded-pill bg-forest px-5 py-3 text-small font-bold text-white shadow-lift focus:translate-y-0"
      >
        Skip to main content
      </a>

      <header className="border-b border-hairline bg-paper/90 xl:sticky xl:top-0 xl:z-30 xl:backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 rounded-pill pr-2 text-2xl leading-10 font-extrabold tracking-tight text-ink"
          >
            <span
              aria-hidden="true"
              className="grid size-10 place-items-center rounded-[0.9rem] bg-forest text-white shadow-soft"
            >
              <Sprout size={22} strokeWidth={2.4} />
            </span>
            Grantly
          </Link>

          <PersonSwitch />

          <nav
            ref={navRef}
            aria-label="Primary"
            className="fixed inset-x-0 bottom-0 z-40 overflow-x-auto border-t border-hairline bg-surface/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_-12px_rgb(74_46_20/0.25)] backdrop-blur-md xl:static xl:w-full xl:overflow-visible xl:border-0 xl:bg-transparent xl:pb-0 xl:shadow-none xl:backdrop-blur-none"
          >
            <ul className="mx-auto flex w-max min-w-full justify-between px-1 xl:gap-1.5 xl:px-0">
              {areas.map(({ path, label, icon: Icon }) => (
                <li key={path}>
                  <NavLink
                    to={path}
                    end={path === '/'}
                    className="group flex min-h-16 min-w-24 flex-col items-center justify-center gap-0.5 rounded-control px-2 py-1.5 text-center text-label leading-tight font-semibold text-muted transition-colors hover:text-ink focus-visible:outline-offset-[-3px] aria-[current=page]:font-extrabold aria-[current=page]:text-forest-deep xl:min-h-11 xl:min-w-0 xl:flex-row xl:gap-2 xl:rounded-pill xl:px-4 xl:text-small xl:text-ink xl:hover:bg-surface xl:aria-[current=page]:bg-forest xl:aria-[current=page]:text-white xl:aria-[current=page]:shadow-soft"
                  >
                    <span className="grid h-8 w-14 place-items-center rounded-pill transition-colors group-hover:bg-muted-soft group-aria-[current=page]:bg-forest-soft xl:h-auto xl:w-auto xl:bg-transparent xl:group-hover:bg-transparent xl:group-aria-[current=page]:bg-transparent">
                      <Icon aria-hidden="true" size={22} strokeWidth={2.2} className="xl:size-[18px]" />
                    </span>
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main
        id="main"
        ref={mainRef}
        tabIndex={-1}
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:py-12"
      >
        <Outlet />
      </main>

      <footer className="border-t border-hairline bg-surface/60">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6 sm:px-6">
          <p className="flex items-center gap-2 text-small text-muted">
            <ShieldCheck aria-hidden="true" size={18} className="shrink-0 text-forest" />
            Scheme rules, amounts and deadlines link to their official sources. Statuses are simulated and your data
            stays in this browser.
          </p>
          <ResetDemo />
        </div>
      </footer>

      <ScrollRestoration />
    </div>
  )
}
