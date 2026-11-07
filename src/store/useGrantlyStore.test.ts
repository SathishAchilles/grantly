import { describe, expect, it } from 'vitest'
import { useGrantlyStore } from './useGrantlyStore'

describe('useGrantlyStore', () => {
  it('starts with four empty, separate record lists', () => {
    expect(useGrantlyStore.getState()).toEqual({
      applications: [],
      awardOffers: [],
      instalments: [],
      renewals: [],
    })
  })

  it('persists under a versioned key', () => {
    const options = useGrantlyStore.persist.getOptions()

    expect(options.name).toBe('grantly-v1')
    expect(options.version).toBe(1)
  })
})
