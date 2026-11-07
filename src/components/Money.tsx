const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

export const formatInr = (amount: number) => inr.format(amount)

export function Money({ amount }: { amount: number }) {
  return <span className="tabular-nums">{formatInr(amount)}</span>
}
