import { NotBuilt } from '../components/NotBuilt'
import { PageHeader } from '../components/PageHeader'

export function Component() {
  return (
    <>
      <PageHeader title="Awards" purpose="Follow an award until the money actually reaches you or your college." />
      <NotBuilt
        items={[
          'Understand an offer before you accept or decline it',
          'Track each instalment from approval to receipt',
          'Know who to contact when a payment fails',
        ]}
      />
    </>
  )
}
