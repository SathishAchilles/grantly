import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import type { StatusBasis } from '../domain/types'
import { Button, ButtonLink } from './Button'
import { Card } from './Card'
import { NotBuilt } from './NotBuilt'
import { PageHeader } from './PageHeader'
import { StatusBadge } from './StatusBadge'

describe('Button', () => {
  it('is a primary button of type "button" by default and responds to clicks', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Save</Button>)

    const button = screen.getByRole('button', { name: 'Save' })
    expect(button).toHaveAttribute('type', 'button')
    expect(button).toHaveClass('bg-forest')

    await userEvent.setup().click(button)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('supports the secondary variant, a custom type and extra classes', () => {
    render(
      <Button variant="secondary" type="submit" className="w-full">
        Submit
      </Button>,
    )

    const button = screen.getByRole('button', { name: 'Submit' })
    expect(button).toHaveAttribute('type', 'submit')
    expect(button).toHaveClass('bg-surface', 'w-full')
  })
})

describe('ButtonLink', () => {
  it('renders a styled link in both variants', () => {
    render(
      <MemoryRouter>
        <ButtonLink to="/">Home</ButtonLink>
        <ButtonLink to="/discover" variant="secondary" className="mt-2">
          Discover
        </ButtonLink>
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Home' })).toHaveClass('bg-forest')
    expect(screen.getByRole('link', { name: 'Discover' })).toHaveAttribute('href', '/discover')
    expect(screen.getByRole('link', { name: 'Discover' })).toHaveClass('bg-surface', 'mt-2')
  })
})

describe('Card', () => {
  it('renders a section with its content and extra classes', () => {
    render(
      <Card aria-label="Summary" className="max-w-sm">
        Card content
      </Card>,
    )

    const card = screen.getByRole('region', { name: 'Summary' })
    expect(card).toHaveTextContent('Card content')
    expect(card).toHaveClass('rounded-card', 'max-w-sm')
  })

  it('works without extra classes', () => {
    render(<Card aria-label="Plain">Plain</Card>)

    expect(screen.getByRole('region', { name: 'Plain' })).toHaveClass('rounded-card')
  })
})

describe('StatusBadge', () => {
  it.each<[StatusBasis, string]>([
    ['provider-confirmed', 'Provider-confirmed'],
    ['evidence', 'Supported by evidence'],
    ['student-reported', 'Student-reported'],
  ])('labels %s as "%s" in text, not colour alone', (basis, label) => {
    render(<StatusBadge basis={basis} />)

    expect(screen.getByText(label)).toBeInTheDocument()
  })
})

describe('PageHeader', () => {
  it('renders the heading and purpose and sets the document title', () => {
    render(<PageHeader title="Awards" purpose="Follow the money." />)

    expect(screen.getByRole('heading', { level: 1, name: 'Awards' })).toBeInTheDocument()
    expect(screen.getByText('Follow the money.')).toBeInTheDocument()
    expect(document.title).toBe('Awards | GRANTLY')
  })
})

describe('NotBuilt', () => {
  it('states the area is not built and lists what it will do', () => {
    render(<NotBuilt items={['First thing', 'Second thing']} />)

    expect(screen.getByRole('heading', { level: 2, name: 'Not built yet' })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual(['First thing', 'Second thing'])
  })
})
