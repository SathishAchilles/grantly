import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useGrantlyStore } from '../store/useGrantlyStore'
import { axeViolations, renderRoute } from '../test/render'
import { areas } from './areas'

describe('Shell', () => {
  it.each(areas)('renders $label at $path with one h1, a title and the current link', async ({ path, label }) => {
    const { container } = renderRoute(path)

    expect(await screen.findByRole('heading', { level: 1, name: label })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    await waitFor(() => expect(document.title).toBe(`${label} | GRANTLY`))

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
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Scheme rules, amounts and deadlines link to their official sources.')
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
    await screen.findByRole('heading', { level: 1, name: 'My funding plan' })

    await user.click(screen.getByRole('link', { name: 'Opportunities' }))

    expect(await screen.findByRole('heading', { level: 1, name: 'Opportunities' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/opportunities')
    expect(screen.getByRole('main')).toHaveFocus()
  })

  it('centres the current link inside the scrollable navigation', async () => {
    renderRoute('/funding')
    await screen.findByRole('heading', { level: 1, name: 'Funding and renewal' })

    // jsdom has no layout, so every offset is 0 and the centred position resolves to 0.
    expect(screen.getByRole('navigation', { name: 'Primary' }).scrollLeft).toBe(0)
  })

  it('shows a not-found page with a way back', async () => {
    const { user, container } = renderRoute('/does-not-exist')

    expect(await screen.findByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument()
    await waitFor(() => expect(document.title).toBe('Page not found | GRANTLY'))
    const nav = screen.getByRole('navigation', { name: 'Primary' })
    expect(within(nav).queryByRole('link', { current: 'page' })).not.toBeInTheDocument()
    expect(await axeViolations(container)).toEqual([])

    await user.click(screen.getByRole('link', { name: 'Go to My funding plan' }))

    expect(await screen.findByRole('heading', { level: 1, name: 'My funding plan' })).toBeInTheDocument()
  })

  it('switches person from the header and remembers the choice', async () => {
    const { user } = renderRoute('/')
    await screen.findByRole('definition', { name: 'Still to find' })

    await user.selectOptions(screen.getByRole('combobox', { name: 'Viewing as' }), 'Arjun Kumar, student')

    expect(await screen.findByRole('definition', { name: 'Still to find' })).toHaveTextContent('₹80,000')
    expect(localStorage.getItem('grantly')).toContain('"activePersonId":"arjun"')
  })

  it('reaches the person switch by keyboard, right after the brand link', async () => {
    const { user } = renderRoute('/')
    await screen.findByRole('heading', { level: 1 })

    await user.tab()
    await user.tab()
    await user.tab()

    expect(screen.getByRole('combobox', { name: 'Viewing as' })).toHaveFocus()
  })

  it('resets the demo after confirmation, and can be cancelled', async () => {
    const { user } = renderRoute('/')
    await screen.findByRole('heading', { level: 1 })
    useGrantlyStore.getState().setPerson('arjun')

    await user.click(screen.getByRole('button', { name: 'Reset demo data' }))
    expect(screen.getByText('Reset all demo progress?')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(useGrantlyStore.getState().activePersonId).toBe('arjun')

    await user.click(screen.getByRole('button', { name: 'Reset demo data' }))
    await user.click(screen.getByRole('button', { name: 'Yes, reset' }))

    expect(screen.getByRole('status')).toHaveTextContent('Demo data reset.')
    expect(useGrantlyStore.getState().activePersonId).toBe('meera')
  })
})
