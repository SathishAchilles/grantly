import { NotBuilt } from '../components/NotBuilt'
import { PageHeader } from '../components/PageHeader'

export function Component() {
  return (
    <>
      <PageHeader title="Compare" purpose="Decide which scholarships deserve your time." />
      <NotBuilt
        items={[
          'Compare usable amount, permitted expenses, duration and deadline',
          'Weigh the effort each application needs',
          'Check renewal conditions and whether awards can be combined',
        ]}
      />
    </>
  )
}
