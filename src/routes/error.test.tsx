import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { describeError, ErrorPage } from './error'

describe('describeError', () => {
  it('explains route errors, stale deployments and anything else', () => {
    expect(describeError(new Error('Failed to fetch dynamically imported module'))).toMatch(/newer version/)
    expect(describeError(new Error('boom'))).toBe('Something went wrong while showing this page.')
    expect(describeError('unknown')).toBe('Something went wrong while showing this page.')
  })
})

describe('ErrorPage', () => {
  it('replaces a page that fails to render, with a way back', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const Broken = () => {
      throw new Error('boom')
    }
    const router = createMemoryRouter([{ path: '/', Component: Broken, errorElement: <ErrorPage /> }])
    render(<RouterProvider router={router} />)

    expect(await screen.findByRole('heading', { level: 1, name: 'Something went wrong' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Go to My funding plan' })).toHaveAttribute('href', '/')
  })

  it('reports the status of a route error response', async () => {
    const router = createMemoryRouter([
      {
        path: '/',
        loader: () => {
          throw new Response('Not here', { status: 503 })
        },
        Component: () => null,
        errorElement: <ErrorPage />,
      },
    ])
    render(<RouterProvider router={router} />)

    expect(await screen.findByText('The page could not be loaded (503).')).toBeInTheDocument()
  })
})
