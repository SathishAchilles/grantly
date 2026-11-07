import { isRouteErrorResponse, useRouteError } from 'react-router'
import { ButtonLink } from '@/components/Button'
import { PageHeader } from '@/components/PageHeader'

/** Describes a routing or rendering error without exposing internal details. */
export function describeError(error: unknown): string {
  if (isRouteErrorResponse(error)) return `The page could not be loaded (${error.status}).`
  if (error instanceof Error && /dynamically imported module|loading chunk/i.test(error.message)) {
    return 'A newer version of Grantly is available. Reload the page to continue.'
  }
  return 'Something went wrong while showing this page.'
}

/** Shown in place of a page when loading or rendering it fails, so the app never goes blank. */
export function ErrorPage() {
  const error = useRouteError()
  return (
    <main id="main" className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <PageHeader title="Something went wrong" purpose={describeError(error)} />
      <ButtonLink to="/" reloadDocument>
        Go to My funding plan
      </ButtonLink>
    </main>
  )
}
