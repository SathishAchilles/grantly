import { arjun, meera } from '@/data/people'
import type { Student } from '@/domain/types'

export const TODAY = '2026-11-07'

/** A copy of a demo student with selected fields replaced. */
export const studentWith = (base: Student, overrides: Partial<Student>): Student => ({
  ...structuredClone(base),
  ...overrides,
})

/** Returns a value that a test relies on, failing loudly if it is missing. */
export function required<T>(value: T | null | undefined, what: string): T {
  if (value === null || value === undefined) throw new Error(`Expected ${what}`)
  return value
}

export const freshStudent = (overrides: Partial<Student> = {}) => studentWith(arjun, overrides)
export const renewalStudent = (overrides: Partial<Student> = {}) => studentWith(meera, overrides)
