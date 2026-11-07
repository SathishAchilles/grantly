import { NotBuilt } from '../components/NotBuilt'
import { PageHeader } from '../components/PageHeader'

export function Component() {
  return (
    <>
      <PageHeader title="Documents" purpose="Keep your profile and documents ready, so you only prepare them once." />
      <NotBuilt
        items={[
          'Reuse documents across applications',
          'Track issuer, academic year and validity',
          'See which applications are affected when a document changes',
        ]}
      />
    </>
  )
}
