import { NotBuilt } from '../components/NotBuilt'
import { PageHeader } from '../components/PageHeader'

export function Component() {
  return (
    <>
      <PageHeader title="Applications" purpose="Know what is missing, and who has to act next." />
      <NotBuilt
        items={[
          'Plan each application with task owners and dates',
          'Keep proof of what you submitted',
          'Fix a returned application before its correction window closes',
        ]}
      />
    </>
  )
}
