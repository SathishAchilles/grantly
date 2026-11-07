import { NotBuilt } from '../components/NotBuilt'
import { PageHeader } from '../components/PageHeader'

export function Component() {
  return (
    <>
      <PageHeader title="Renewals" purpose="Keep your funding next year, without starting from scratch." />
      <NotBuilt
        items={[
          'See continuing conditions throughout the year',
          'Carry forward what still applies and refresh what does not',
          'Report a change of course, college or circumstances',
        ]}
      />
    </>
  )
}
