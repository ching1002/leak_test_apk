export interface CountyOption {
  county_id: string
  county_name: string
  towns: TownOption[]
}

export interface TownOption {
  town_id: string
  town_name: string
}

export interface LocationOptionsResponse {
  counties: CountyOption[]
}

export interface ReportQueryRequest {
  start_date: string
  end_date: string
  start_no?: number
  end_no?: number
  year?: number
  county_name?: string
  town_name?: string
  area_no?: string
  fac_id: string
  page: number
  page_size: number
  print_mode: boolean
}

export interface ReportCaseItem {
  case_no: string
  app_datetime: string
  water_no: string
  app_content: string
  reporter_name: string
  reporter_tel: string
  case_source: string
  ass_man: string
  location: string
}

export interface ReportQueryResponse {
  title: string
  subtitle: string
  total_count: number
  page: number
  page_size: number
  total_pages: number
  items: ReportCaseItem[]
}
