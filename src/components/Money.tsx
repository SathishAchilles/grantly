const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

/** Formats a whole-rupee amount in Indian digit grouping, for example when a value is needed as text. */
export const formatInr = (amount: number) => inr.format(amount)

/** An amount in rupees with tabular figures so amounts line up when listed together. */
export function Money({ amount }: { amount: number }) {
  return <span className="tabular-nums">{formatInr(amount)}</span>
}
