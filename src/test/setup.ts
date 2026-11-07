import '@testing-library/jest-dom/vitest'
import { beforeEach, vi } from 'vitest'
import { useGrantlyStore } from '../store/useGrantlyStore'

beforeEach(() => {
  // Freeze only the clock, at 7 Nov 2026 in India, so deadlines are deterministic.
  vi.useFakeTimers({ toFake: ['Date'], now: new Date('2026-11-07T04:30:00Z') })
  localStorage.clear()
  useGrantlyStore.getState().reset()
  // jsdom does not implement scrolling; React Router's ScrollRestoration calls it.
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
})
