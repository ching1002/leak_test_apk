import { mockReportApi } from '../mock/mock-api'
import type { ApiResponse } from '../types/auth'
import type { LocationOptionsResponse, ReportQueryRequest, ReportQueryResponse } from '../types/report'

export function fetchLocationOptions(_areaNo?: string, _facId?: string): Promise<ApiResponse<LocationOptionsResponse>> {
  return mockReportApi.fetchLocationOptions()
}

export function queryReport(data: ReportQueryRequest): Promise<ApiResponse<ReportQueryResponse>> {
  return mockReportApi.queryReport(data)
}
