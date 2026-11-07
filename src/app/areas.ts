import {
  Award,
  CalendarSync,
  ClipboardList,
  FolderOpen,
  House,
  Scale,
  Search,
  type LucideIcon,
} from 'lucide-react'

export interface Area {
  path: string
  label: string
  icon: LucideIcon
}

export const areas: Area[] = [
  { path: '/', label: 'Today', icon: House },
  { path: '/discover', label: 'Discover', icon: Search },
  { path: '/compare', label: 'Compare', icon: Scale },
  { path: '/documents', label: 'Documents', icon: FolderOpen },
  { path: '/applications', label: 'Applications', icon: ClipboardList },
  { path: '/awards', label: 'Awards', icon: Award },
  { path: '/renewals', label: 'Renewals', icon: CalendarSync },
]
