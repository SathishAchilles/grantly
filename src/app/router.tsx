import { createBrowserRouter } from 'react-router'
import { Shell } from './Shell'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Shell,
    hydrateFallbackElement: <p role="status">Loading Grantly</p>,
    children: [
      { index: true, lazy: () => import('../routes/today') },
      { path: 'discover', lazy: () => import('../routes/discover') },
      { path: 'compare', lazy: () => import('../routes/compare') },
      { path: 'documents', lazy: () => import('../routes/documents') },
      { path: 'applications', lazy: () => import('../routes/applications') },
      { path: 'awards', lazy: () => import('../routes/awards') },
      { path: 'renewals', lazy: () => import('../routes/renewals') },
      { path: '*', lazy: () => import('../routes/not-found') },
    ],
  },
])
