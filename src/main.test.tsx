import { screen } from '@testing-library/react'
import { act } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

describe('main', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    vi.resetModules()
  })

  it('renders the app into #root', async () => {
    document.body.innerHTML = '<div id="root"></div>'

    await act(async () => {
      await import('./main')
    })

    expect(await screen.findByRole('heading', { level: 1, name: 'My funding plan' })).toBeInTheDocument()
  })

  it('fails clearly when #root is missing', async () => {
    await expect(import('./main')).rejects.toThrow('Root element not found')
  })
})
