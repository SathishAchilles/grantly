import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderRoute } from '@/test/render'

describe('Opportunities search and filter', () => {
  it('narrows schemes by search text and shows how many match', async () => {
    renderRoute('/opportunities')
    const search = await screen.findByRole('searchbox', { name: 'Search schemes' })

    await userEvent.type(search, 'hdfc')

    expect(screen.getByText('1 of 4 schemes shown')).toHaveAttribute('role', 'status')
    expect(screen.getByRole('heading', { level: 2, name: 'HDFC Parivartan ECSS' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 2, name: 'NMMSS' })).not.toBeInTheDocument()
  })

  it('reads the filter from the URL, explains an empty result, and links documents to the scheme', async () => {
    renderRoute('/opportunities?q=zzz&show=meets')

    expect(await screen.findByText('No schemes match. Try a different search or choose All schemes.')).toBeVisible()
    expect(screen.getByRole('combobox', { name: 'Show' })).toHaveValue('meets')

    await userEvent.clear(screen.getByRole('searchbox', { name: 'Search schemes' }))
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Show' }), 'all')

    expect(screen.getByText('4 of 4 schemes shown')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Check documents for PM-USP CSSS' })).toHaveAttribute(
      'href',
      '/readiness?scheme=pm-usp-csss',
    )
  })
})
