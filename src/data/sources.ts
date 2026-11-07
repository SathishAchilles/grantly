import type { Source } from '../domain/types'

const checkedOn = '2026-11-07'

export const sources = {
  nspAnnouncement: {
    title: 'NSP Students page announcement',
    url: 'https://scholarships.gov.in/Students',
    checkedOn,
  },
  nspCatalogue: {
    title: 'NSP scheme catalogue',
    url: 'https://scholarships.gov.in/All-Scholarships',
    checkedOn,
  },
  csssGuidelines: {
    title: 'PM-USP CSSS guidelines',
    url: 'https://scholarships.gov.in/public/schemeGuidelines/CSSS_GUIDLINES_07022024_updated.pdf',
    checkedOn,
  },
  csssFaq: {
    title: 'PM-USP CSSS FAQ 2025-26',
    url: 'https://scholarships.gov.in/public/schemeGuidelines/FAQ_DOHE_CSSS.pdf',
    checkedOn,
  },
  hdfcEcss: {
    title: 'HDFC Bank Parivartan ECSS programme page',
    url: 'https://www.parivartanecss.com/',
    checkedOn,
  },
  ffe: {
    title: 'Foundation For Excellence scholarships page',
    url: 'https://ffe.org/scholarships/',
    checkedOn,
  },
  nmmssPib: {
    title: 'PIB release on NMMSS 2026-27',
    url: 'https://www.pib.gov.in/PressReleseDetailm.aspx?PRID=2330936&lang=1&reg=3',
    checkedOn,
  },
  pfmsSeeding: {
    title: 'PFMS Aadhaar seeding guide',
    url: 'https://pfms.nic.in/sitePages/doc/PFMS_Aadhaar-Seeding-Step-by-Step-guide-byDBTMission.pdf',
    checkedOn,
  },
} satisfies Record<string, Source>
