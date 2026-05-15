import { create } from 'zustand'

import type { CountyOption, ReportQueryResponse } from '../types/report'
import type { DistrictOption, StationOption } from '../types/assign'

function fmtLocalDate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function getDefaultDates() {
  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  return { startDate: fmtLocalDate(firstOfMonth), endDate: fmtLocalDate(now) }
}

interface ReportState {
  initialized: boolean
  showFilter: boolean
  showCaseNoRange: boolean

  districts: DistrictOption[]
  stations: StationOption[]
  areaName: string
  stationName: string
  showStationDropdown: boolean
  counties: CountyOption[]

  selectedAreaNo: string
  selectedFacId: string
  year: number
  startDate: string
  endDate: string
  selectedCounty: string
  selectedTown: string
  startNo: string
  endNo: string

  queryResult: ReportQueryResponse | null
  currentPage: number
  isPrintMode: boolean
  printData: ReportQueryResponse | null

  setInitialized: (v: boolean) => void
  setShowFilter: (v: boolean) => void
  setShowCaseNoRange: (v: boolean) => void
  setDistricts: (v: DistrictOption[]) => void
  setStations: (v: StationOption[]) => void
  setAreaName: (v: string) => void
  setStationName: (v: string) => void
  setShowStationDropdown: (v: boolean) => void
  setCounties: (v: CountyOption[]) => void
  setSelectedAreaNo: (v: string) => void
  setSelectedFacId: (v: string) => void
  setYear: (v: number) => void
  setStartDate: (v: string) => void
  setEndDate: (v: string) => void
  setSelectedCounty: (v: string) => void
  setSelectedTown: (v: string) => void
  setStartNo: (v: string) => void
  setEndNo: (v: string) => void
  setQueryResult: (v: ReportQueryResponse | null) => void
  setCurrentPage: (v: number) => void
  setIsPrintMode: (v: boolean) => void
  setPrintData: (v: ReportQueryResponse | null) => void
  reset: () => void
}

const defaults = getDefaultDates()

export const useReportStore = create<ReportState>((set) => ({
  initialized: false,
  showFilter: true,
  showCaseNoRange: false,

  districts: [],
  stations: [],
  areaName: '',
  stationName: '',
  showStationDropdown: false,
  counties: [],

  selectedAreaNo: '',
  selectedFacId: '',
  year: new Date().getFullYear(),
  startDate: defaults.startDate,
  endDate: defaults.endDate,
  selectedCounty: '',
  selectedTown: '',
  startNo: '',
  endNo: '',

  queryResult: null,
  currentPage: 1,
  isPrintMode: false,
  printData: null,

  setInitialized: (v) => set({ initialized: v }),
  setShowFilter: (v) => set({ showFilter: v }),
  setShowCaseNoRange: (v) => set({ showCaseNoRange: v }),
  setDistricts: (v) => set({ districts: v }),
  setStations: (v) => set({ stations: v }),
  setAreaName: (v) => set({ areaName: v }),
  setStationName: (v) => set({ stationName: v }),
  setShowStationDropdown: (v) => set({ showStationDropdown: v }),
  setCounties: (v) => set({ counties: v }),
  setSelectedAreaNo: (v) => set({ selectedAreaNo: v }),
  setSelectedFacId: (v) => set({ selectedFacId: v }),
  setYear: (v) => set({ year: v }),
  setStartDate: (v) => set({ startDate: v }),
  setEndDate: (v) => set({ endDate: v }),
  setSelectedCounty: (v) => set({ selectedCounty: v }),
  setSelectedTown: (v) => set({ selectedTown: v }),
  setStartNo: (v) => set({ startNo: v }),
  setEndNo: (v) => set({ endNo: v }),
  setQueryResult: (v) => set({ queryResult: v }),
  setCurrentPage: (v) => set({ currentPage: v }),
  setIsPrintMode: (v) => set({ isPrintMode: v }),
  setPrintData: (v) => set({ printData: v }),
  reset: () => {
    const d = getDefaultDates()
    set({
      initialized: false,
      showFilter: true,
      showCaseNoRange: false,
      districts: [],
      stations: [],
      areaName: '',
      stationName: '',
      showStationDropdown: false,
      counties: [],
      selectedAreaNo: '',
      selectedFacId: '',
      year: new Date().getFullYear(),
      startDate: d.startDate,
      endDate: d.endDate,
      selectedCounty: '',
      selectedTown: '',
      startNo: '',
      endNo: '',
      queryResult: null,
      currentPage: 1,
      isPrintMode: false,
      printData: null,
    })
  },
}))
