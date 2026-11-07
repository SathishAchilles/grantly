import { describe, expect, it } from 'vitest'
import { applications } from '@/data/cases'
import { meera } from '@/data/people'
import { schemes } from '@/data/schemes'
import { TODAY } from '@/test/fixtures'
import { filterSchemes, parseFitFilter } from './discovery'
import { evaluateScheme } from './eligibility'

const scored = schemes.map((scheme) => ({ scheme, evaluation: evaluateScheme(scheme, meera, TODAY, applications) }))
const ids = (query: string, fit: Parameters<typeof filterSchemes>[2]) =>
  filterSchemes(scored, query, fit).map(({ scheme }) => scheme.id)

describe('filterSchemes', () => {
  it('matches every search word against name, provider and audience, ignoring case', () => {
    expect(ids('', 'all')).toEqual(schemes.map((scheme) => scheme.id))
    expect(ids('  HDFC  ', 'all')).toEqual(['hdfc-ecss'])
    expect(ids('hdfc nothing-like-this', 'all')).toEqual([])
  })

  it('never lists a ruled-out or closed scheme as possible, and keeps only full matches for "meets"', () => {
    const possible = filterSchemes(scored, '', 'possible')
    expect(possible.every(({ evaluation }) => evaluation.open && evaluation.overall !== 'does-not-meet')).toBe(true)
    expect(ids('', 'possible')).not.toContain('nmmss')
    expect(
      filterSchemes(scored, '', 'meets').every(({ evaluation }) => evaluation.overall === 'meets-listed-conditions'),
    ).toBe(true)
  })
})

describe('parseFitFilter', () => {
  it('accepts known values and falls back to all', () => {
    expect(parseFitFilter('possible')).toBe('possible')
    expect(parseFitFilter('meets')).toBe('meets')
    expect(parseFitFilter('<script>')).toBe('all')
    expect(parseFitFilter(null)).toBe('all')
  })
})
