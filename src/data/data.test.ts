import { describe, expect, it } from 'vitest'
import { freshStudent, renewalStudent } from '@/test/fixtures'
import { applications, tasks } from './cases'
import { arjun, meera, people, priya } from './people'
import { schemeById, schemes } from './schemes'

const variants = [
  freshStudent(),
  renewalStudent(),
  freshStudent({ familyIncome: 900_000, gapYearAfterClass12: true, otherSchemesAvailed: ['State scholarship'] }),
  freshStudent({ class12: { ...arjun.class12, percentile: 70, year: 2023 }, studyYear: 2, schoolClass: 9 }),
]

describe('scheme registry', () => {
  it.each(schemes)('$shortName: every rule that passes or fails cites a source', (scheme) => {
    const decided = scheme.rules.filter((rule) =>
      variants.some((student) => ['met', 'not-met'].includes(rule.evaluate(student).result)),
    )
    const unsourced = decided.filter((rule) => !rule.source?.url.startsWith('https://')).map((rule) => rule.id)

    expect(decided.length).toBeGreaterThan(0)
    expect(unsourced).toEqual([])
  })

  it.each(schemes)('$shortName: every deadline and evidence requirement cites a source', (scheme) => {
    for (const set of scheme.deadlines) expect(set.source.url).toMatch(/^https:\/\//)
    for (const requirement of scheme.evidence) expect(requirement.source.url).toMatch(/^https:\/\//)
  })

  it.each(schemes)('$shortName: an amount always has a source, and an unpublished one has none', (scheme) => {
    const amounts = variants.map((student) => scheme.amountFor(student))
    const published = amounts.filter((amount) => amount.value !== null)
    const unpublished = amounts.filter((amount) => amount.value === null)

    expect(published.every((amount) => amount.source?.url.startsWith('https://'))).toBe(true)
    expect(
      unpublished.every((amount) => amount.source === null && amount.basis === 'Not published by the provider'),
    ).toBe(true)
  })

  it('publishes amounts only for PM-USP CSSS and HDFC ECSS', () => {
    expect(
      schemes.filter((scheme) => scheme.amountFor(freshStudent()).value !== null).map((scheme) => scheme.id),
    ).toEqual(['pm-usp-csss', 'hdfc-ecss'])
  })

  it('looks schemes up by id', () => {
    expect(schemeById('ffe').shortName).toBe('FFE')
    expect(() => schemeById('unknown')).toThrow('Unknown scheme: unknown')
  })
})

describe('demo people', () => {
  it('keeps domicile, residence, institution and schooling as separate facts', () => {
    expect(meera.domicile.state).toBe('Kerala')
    expect(meera.residence.state).toBe('Tamil Nadu')
    expect(meera.institution.place.state).toBe('Tamil Nadu')
    expect(meera.schooling.state).toBe('Kerala')
    expect(arjun.domicile.state).toBe('Bihar')
    expect(arjun.institution.place.state).toBe('Maharashtra')
  })

  it('places Arjun at a different institution from Meera and Priya', () => {
    expect(arjun.institution.id).not.toBe(meera.institution.id)
    expect(priya.institution.id).toBe(meera.institution.id)
    expect(people.map((person) => person.role)).toEqual(['student', 'student', 'coordinator'])
  })
})

describe('demo cases', () => {
  it('links every application to a known scheme', () => {
    expect(applications.map((application) => schemeById(application.schemeId).id)).toEqual([
      'pm-usp-csss',
      'pm-usp-csss',
      'hdfc-ecss',
      'ffe',
    ])
  })

  it('links every task to an application or another fictional student at the same college', () => {
    const applicationIds = new Set(applications.map((application) => application.id))
    const unlinked = tasks.filter((task) => !applicationIds.has(task.applicationId))

    expect(unlinked.map((task) => task.institutionId)).toEqual(['lakeview', 'lakeview'])
  })
})
