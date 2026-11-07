import { describe, expect, it } from 'vitest'

// The app's own source, excluding tests and test helpers.
const sources = import.meta.glob<string>(['@/**/*.{ts,tsx}', '!../**/*.test.{ts,tsx}', '!../test/**'], {
  query: '?raw',
  import: 'default',
  eager: true,
})

describe('interface wording', () => {
  it('scans the app source', () => {
    expect(Object.keys(sources).length).toBeGreaterThan(20)
  })

  it('never calls anything a demo or AI', () => {
    const offending = Object.entries(sources)
      .filter(([, text]) => /\bdemo\b|\bAI\b/i.test(text))
      .map(([path]) => path)

    expect(offending).toEqual([])
  })
})
