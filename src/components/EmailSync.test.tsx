import { screen, within } from '@testing-library/react'
import { act } from 'react'
import { describe, expect, it } from 'vitest'
import { useGrantlyStore } from '@/store/useGrantlyStore'
import { axeViolations, renderRoute } from '@/test/render'

const store = () => useGrantlyStore.getState()

async function openPlanAs(person: string) {
  act(() => store().setPerson(person))
  const view = renderRoute('/')
  const panel = await screen.findByRole('region', { name: 'Application emails' })
  return { ...view, panel }
}

describe('Application emails', () => {
  it('says it brings emails in from Gmail', async () => {
    const { panel } = await openPlanAs('arjun')

    expect(within(panel).getByText(/^From Gmail\./)).toBeInTheDocument()
    expect(within(panel).queryByRole('list', { name: 'Fetched emails' })).not.toBeInTheDocument()
  })

  it("lists Arjun's emails with what Grantly will do with each, without changing anything yet", async () => {
    const { user, panel, container } = await openPlanAs('arjun')

    await user.click(within(panel).getByRole('button', { name: 'Fetch application emails' }))

    const list = within(panel).getByRole('list', { name: 'Fetched emails' })
    const items = within(list).getAllByRole('listitem')
    expect(items.map((item) => item.textContent)).toEqual([
      expect.stringMatching(/application received.*ecss-support@example\.org · 6 Nov 2026.*Will update/),
      expect.stringMatching(/shortlisted for interview.*Will update.*Interview task added/),
      expect.stringMatching(/fee waiver of ₹20,000 approved.*Will update/),
      expect.stringMatching(/Pay ₹499 processing fee.*Suspected scam.*likely scam/),
    ])
    expect(screen.getByRole('definition', { name: 'Still to find' })).toHaveTextContent('₹80,000')
    expect(await axeViolations(container)).toEqual([])
  })

  it('changes nothing when cancelled', async () => {
    const { user, panel } = await openPlanAs('arjun')
    const before = store().applications

    await user.click(within(panel).getByRole('button', { name: 'Fetch application emails' }))
    await user.click(within(panel).getByRole('button', { name: 'Cancel' }))

    expect(within(panel).queryByRole('list', { name: 'Fetched emails' })).not.toBeInTheDocument()
    expect(store().applications).toBe(before)
    expect(store().processedEmailIds).toEqual([])
  })

  it("applies the updates: Arjun's gap falls to ₹60,000 and his interview becomes a task", async () => {
    const { user, panel } = await openPlanAs('arjun')

    await user.click(within(panel).getByRole('button', { name: 'Fetch application emails' }))
    await user.click(within(panel).getByRole('button', { name: 'Apply updates' }))

    expect(within(panel).getByRole('status')).toHaveTextContent('Applied 3 updates.')
    expect(screen.getByRole('definition', { name: 'Still to find' })).toHaveTextContent('₹60,000')
    expect(screen.getByRole('heading', { name: 'Confirmed support' })).toBeInTheDocument()
    const actions = screen.getByRole('region', { name: 'Next actions' })
    expect(within(actions).getByRole('article', { name: 'Attend the HDFC Parivartan ECSS interview' })).toHaveTextContent('20 Nov 2026')
  })

  it('does not offer applied emails again', async () => {
    const { user, panel } = await openPlanAs('arjun')
    await user.click(within(panel).getByRole('button', { name: 'Fetch application emails' }))
    await user.click(within(panel).getByRole('button', { name: 'Apply updates' }))

    await user.click(within(panel).getByRole('button', { name: 'Fetch application emails' }))

    expect(within(panel).getByText('No new application emails.')).toBeInTheDocument()
    expect(within(panel).getByRole('status')).toBeEmptyDOMElement()
  })

  it("applies Meera's single update and reports it in the singular", async () => {
    const { user, panel } = await openPlanAs('meera')

    await user.click(within(panel).getByRole('button', { name: 'Fetch application emails' }))
    const list = within(panel).getByRole('list', { name: 'Fetched emails' })
    expect(within(list).getByText('Already up to date')).toBeInTheDocument()
    expect(within(list).getByText('Ignored')).toBeInTheDocument()

    await user.click(within(panel).getByRole('button', { name: 'Apply updates' }))

    expect(within(panel).getByRole('status')).toHaveTextContent('Applied 1 update.')
    expect(store().students[0]?.documents.at(-1)).toMatchObject({ type: 'enrolment-letter', academicYear: '2026-27', basis: 'evidence' })
  })

  it('shows no apply action when nothing would change', async () => {
    act(() => useGrantlyStore.setState({ processedEmailIds: ['meera-letter-ready'] }))
    const { user, panel } = await openPlanAs('meera')

    await user.click(within(panel).getByRole('button', { name: 'Fetch application emails' }))

    expect(within(panel).getAllByRole('listitem')).toHaveLength(2)
    expect(within(panel).queryByRole('button', { name: 'Apply updates' })).not.toBeInTheDocument()
  })
})
