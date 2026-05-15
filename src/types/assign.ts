export interface DistrictOption {
  area_no: string
  area_id: number
  name: string
}

export interface StationOption {
  fac_id: string
  fac_name: string
}

export interface StationsData {
  area_name: string
  station_name: string
  show_dropdown: boolean
  stations: StationOption[]
}

export interface CaseItem {
  case_no: string
  case_source: string
  app_datetime: string
  water_no: string
  app_content: string
  location: string
  status_text: string
}

export interface CaseQueryResponse {
  total_count: number
  page: number
  page_size: number
  total_pages: number
  can_dispatch: boolean
  items: CaseItem[]
}

export interface CaseQueryRequest {
  start_date: string
  end_date: string
  case_filter: string
  area_no?: string
  fac_id: string
  page: number
  page_size: number
}
