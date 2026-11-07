import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '@/app/router'

export function renderRoute(path = '/') {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  const user = userEvent.setup()
  return { user, router, ...render(<RouterProvider router={router} />) }
}

// jsdom cannot compute colours, so contrast is checked by the Playwright axe scan instead.
export async function axeViolations(container: Element) {
  const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
  return results.violations.map((violation) => violation.id)
}
