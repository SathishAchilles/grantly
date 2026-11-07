import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Application, AwardOffer, Instalment, Renewal } from '../domain/types'

interface GrantlyState {
  applications: Application[]
  awardOffers: AwardOffer[]
  instalments: Instalment[]
  renewals: Renewal[]
}

export const useGrantlyStore = create<GrantlyState>()(
  persist(
    (): GrantlyState => ({
      applications: [],
      awardOffers: [],
      instalments: [],
      renewals: [],
    }),
    { name: 'grantly-v1', version: 1 },
  ),
)
