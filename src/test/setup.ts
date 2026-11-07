import '@testing-library/jest-dom/vitest'
import { beforeEach, vi } from 'vitest'

beforeEach(() => {
  localStorage.clear()
  // jsdom does not implement scrolling; React Router's ScrollRestoration calls it.
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
})
