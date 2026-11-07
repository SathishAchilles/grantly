const isoInIndia = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Kolkata',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const display = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'UTC',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

/** Today's date in India, as YYYY-MM-DD. */
export const todayIso = (now: Date = new Date()) => isoInIndia.format(now)

/** Formats a YYYY-MM-DD date as, for example, "30 Nov 2026". */
export const formatDate = (iso: string) => display.format(new Date(`${iso}T00:00:00Z`))

export const isPassed = (iso: string, today: string) => iso < today

/** Sorts by deadline, earliest first, with undated items last. */
export const byDeadline = (a: { deadline?: string }, b: { deadline?: string }) =>
  (a.deadline ?? '9999-12-31').localeCompare(b.deadline ?? '9999-12-31')
