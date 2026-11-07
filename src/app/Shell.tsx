import { useEffect, useRef } from 'react'
import { Link, NavLink, Outlet, ScrollRestoration, useLocation } from 'react-router'
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
    <div className="flex min-h-dvh flex-col pb-20 lg:pb-0">
      <a
        href="#main"
        className="fixed top-2 left-2 z-50 -translate-y-20 rounded-control bg-forest px-4 py-3 text-small font-semibold text-white focus:translate-y-0"
      >
        Skip to main content
      </a>

      <header className="border-b border-hairline bg-paper">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-6">
          <Link to="/" className="font-display text-2xl leading-10 font-semibold tracking-tight">
            Grantly
          </Link>

          <nav
            ref={navRef}
            aria-label="Primary"
            className="fixed inset-x-0 bottom-0 z-40 overflow-x-auto border-t border-hairline bg-surface lg:static lg:overflow-visible lg:border-0 lg:bg-transparent"
          >
            <ul className="mx-auto flex w-max min-w-full justify-between lg:gap-1">
              {areas.map(({ path, label, icon: Icon }) => (
                <li key={path}>
                  <NavLink
                    to={path}
                    end={path === '/'}
                    className={({ isActive }) =>
                      `flex min-h-14 min-w-20 flex-col items-center justify-center gap-1 px-2 text-label font-medium transition-colors lg:min-h-10 lg:min-w-0 lg:flex-row lg:gap-2 lg:rounded-control lg:px-3 lg:text-small ${
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
        className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:py-16"
      >
        <Outlet />
      </main>

      <footer className="border-t border-hairline">
        <p className="mx-auto w-full max-w-7xl px-4 py-6 text-small text-muted sm:px-6">
          Grantly starter build. No scholarship data is shown yet.
        </p>
      </footer>

      <ScrollRestoration />
    </div>
  )
}
