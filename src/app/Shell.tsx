import { useEffect, useRef } from 'react'
import { Link, NavLink, Outlet, ScrollRestoration, useLocation } from 'react-router'
import { PersonSwitch } from '../components/PersonSwitch'
import { ResetDemo } from '../components/ResetDemo'
import { areas } from './areas'

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
    <div className="flex min-h-dvh flex-col pb-20 xl:pb-0">
      <a
        href="#main"
        className="fixed top-2 left-2 z-50 -translate-y-20 rounded-control bg-forest px-4 py-3 text-small font-semibold text-white focus:translate-y-0"
      >
        Skip to main content
      </a>

      <header className="border-b border-hairline bg-paper">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <Link to="/" className="font-display text-2xl leading-10 font-semibold tracking-tight">
            Grantly
          </Link>

          <PersonSwitch />

          <nav
            ref={navRef}
            aria-label="Primary"
            className="fixed inset-x-0 bottom-0 z-40 overflow-x-auto border-t border-hairline bg-surface xl:static xl:w-full xl:overflow-visible xl:border-0 xl:bg-transparent"
          >
            <ul className="mx-auto flex w-max min-w-full justify-between xl:gap-1">
              {areas.map(({ path, label, icon: Icon }) => (
                <li key={path}>
                  <NavLink
                    to={path}
                    end={path === '/'}
                    className={({ isActive }) =>
                      `flex min-h-14 min-w-24 flex-col items-center justify-center gap-1 px-2 text-center text-label font-medium transition-colors xl:min-h-10 xl:min-w-0 xl:flex-row xl:gap-2 xl:rounded-control xl:px-3 xl:text-small ${
                        isActive ? 'bg-forest text-white' : 'text-ink hover:bg-hairline'
                      }`
                    }
                  >
                    <Icon aria-hidden="true" size={18} />
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
        className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:py-14"
      >
        <Outlet />
      </main>

      <footer className="border-t border-hairline">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-6 sm:px-6">
          <p className="text-small text-muted">Scheme rules, amounts and deadlines link to their official sources.</p>
          <ResetDemo />
        </div>
      </footer>

      <ScrollRestoration />
    </div>
  )
}
