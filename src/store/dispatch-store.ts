import { create } from 'zustand'

import type { CaseQueryResponse, DistrictOption, StationOption } from '../types/assign'

function fmtLocalDate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function getDefaultDates() {
  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return { startDate: fmtLocalDate(lastMonth), endDate: fmtLocalDate(now) }
}

interface DispatchState {
  initialized: boolean
  showFilter: boolean

  districts: DistrictOption[]
  stations: StationOption[]
  areaName: string
  stationName: string
  showStationDropdown: boolean

  selectedAreaNo: string
  selectedFacId: string
  startDate: string
  endDate: string
  caseFilter: string

  queryResult: CaseQueryResponse | null
  currentPage: number

  setInitialized: (v: boolean) => void
  setShowFilter: (v: boolean) => void
  setDistricts: (v: DistrictOption[]) => void
  setStations: (v: StationOption[]) => void
  setAreaName: (v: string) => void
  setStationName: (v: string) => void
  setShowStationDropdown: (v: boolean) => void
  setSelectedAreaNo: (v: string) => void
  setSelectedFacId: (v: string) => void
  setStartDate: (v: string) => void
  setEndDate: (v: string) => void
  setCaseFilter: (v: string) => void
  setQueryResult: (v: CaseQueryResponse | null) => void
  setCurrentPage: (v: number) => void
  reset: () => void
}

const defaults = getDefaultDates()

export const useDispatchStore = create<DispatchState>((set) => ({
  initialized: false,
  showFilter: true,

  districts: [],
  stations: [],
  areaName: '',
  stationName: '',
  showStationDropdown: false,

  selectedAreaNo: '',
  selectedFacId: '',
  startDate: defaults.startDate,
  endDate: defaults.endDate,
  caseFilter: 'all',

  queryResult: null,
  currentPage: 1,

  setInitialized: (v) => set({ initialized: v }),
  setShowFilter: (v) => set({ showFilter: v }),
  setDistricts: (v) => set({ districts: v }),
  setStations: (v) => set({ stations: v }),
  setAreaName: (v) => set({ areaName: v }),
  setStationName: (v) => set({ stationName: v }),
  setShowStationDropdown: (v) => set({ showStationDropdown: v }),
  setSelectedAreaNo: (v) => set({ selectedAreaNo: v }),
  setSelectedFacId: (v) => set({ selectedFacId: v }),
  setStartDate: (v) => set({ startDate: v }),
  setEndDate: (v) => set({ endDate: v }),
  setCaseFilter: (v) => set({ caseFilter: v }),
  setQueryResult: (v) => set({ queryResult: v }),
  setCurrentPage: (v) => set({ currentPage: v }),
  reset: () => {
    const d = getDefaultDates()
    set({
      initialized: false,
      showFilter: true,
      districts: [],
      stations: [],
      areaName: '',
      stationName: '',
      showStationDropdown: false,
      selectedAreaNo: '',
      selectedFacId: '',
      startDate: d.startDate,
      endDate: d.endDate,
      caseFilter: 'all',
      queryResult: null,
      currentPage: 1,
    })
  },
}))
