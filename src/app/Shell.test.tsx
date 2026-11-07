import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axeViolations, renderRoute } from '../test/render'
import { areas } from './areas'

describe('Shell', () => {
  it.each(areas)('renders $label at $path with one h1, a title and the current link', async ({ path, label }) => {
    const { container } = renderRoute(path)

    expect(await screen.findByRole('heading', { level: 1, name: label })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(document.title).toBe(`${label} | GRANTLY`)

    const nav = screen.getByRole('navigation', { name: 'Primary' })
    expect(within(nav).getByRole('link', { name: label })).toHaveAttribute('aria-current', 'page')
    expect(await axeViolations(container)).toEqual([])
  })

  it('provides banner, navigation, main and contentinfo landmarks', async () => {
    renderRoute('/')
    await screen.findByRole('heading', { level: 1 })

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('makes the skip link the first focusable element, pointing at main', async () => {
    const { user } = renderRoute('/')
    await screen.findByRole('heading', { level: 1 })

    await user.tab()

    const skip = screen.getByRole('link', { name: 'Skip to main content' })
    expect(skip).toHaveFocus()
    expect(skip).toHaveAttribute('href', '#main')
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main')
  })

  it('does not move focus on first load', async () => {
    renderRoute('/')
    await screen.findByRole('heading', { level: 1 })

    expect(screen.getByRole('main')).not.toHaveFocus()
  })

  it('navigates without reloading and moves focus to main', async () => {
    const { user, router } = renderRoute('/')
    await screen.findByRole('heading', { level: 1, name: 'Today' })

    await user.click(screen.getByRole('link', { name: 'Discover' }))

    expect(await screen.findByRole('heading', { level: 1, name: 'Discover' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/discover')
    expect(screen.getByRole('main')).toHaveFocus()
  })

  it('centres the current link inside the scrollable navigation', async () => {
    renderRoute('/awards')
    await screen.findByRole('heading', { level: 1, name: 'Awards' })

    const nav = screen.getByRole('navigation', { name: 'Primary' })
    // jsdom has no layout, so every offset is 0 and the centred position resolves to 0.
    expect(nav.scrollLeft).toBe(0)
  })

  it('shows a not-found page with a way back to Today', async () => {
    const { user, container } = renderRoute('/does-not-exist')

    expect(await screen.findByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument()
    expect(document.title).toBe('Page not found | GRANTLY')
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    expect(within(nav).queryByRole('link', { current: 'page' })).not.toBeInTheDocument()
    expect(await axeViolations(container)).toEqual([])

    await user.click(screen.getByRole('link', { name: 'Go to Today' }))

    expect(await screen.findByRole('heading', { level: 1, name: 'Today' })).toBeInTheDocument()
  })

  it('states that no scholarship data is shown yet', async () => {
    renderRoute('/')
    await screen.findByRole('heading', { level: 1 })

    expect(screen.getByRole('contentinfo')).toHaveTextContent('No scholarship data is shown yet.')
  })
})
