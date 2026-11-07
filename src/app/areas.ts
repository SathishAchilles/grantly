import { Banknote, Building2, ClipboardList, FileCheck2, Search, Wallet, type LucideIcon } from 'lucide-react'

/** A top-level section of the app, shown in the main navigation. */
export interface Area {
  path: string
  label: string
  icon: LucideIcon
}

/** The navigation sections in display order. */
export const areas: Area[] = [
  { path: '/', label: 'My funding plan', icon: Wallet },
  { path: '/opportunities', label: 'Opportunities', icon: Search },
  { path: '/readiness', label: 'Readiness', icon: FileCheck2 },
  { path: '/applications', label: 'Applications', icon: ClipboardList },
  { path: '/funding', label: 'Funding and renewal', icon: Banknote },
  { path: '/college', label: 'College desk', icon: Building2 },
]
