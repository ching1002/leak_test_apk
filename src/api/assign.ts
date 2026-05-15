import { mockAssignApi } from '../mock/mock-api'
import type { ApiResponse } from '../types/auth'
import type { CaseQueryRequest, CaseQueryResponse, DistrictOption, StationsData } from '../types/assign'

export function fetchDistricts(): Promise<ApiResponse<{ districts: DistrictOption[] }>> {
  return mockAssignApi.fetchDistricts()
}

export function fetchStations(areaNo?: string): Promise<ApiResponse<StationsData>> {
  return mockAssignApi.fetchStations(areaNo)
}

export function queryAssignCases(data: CaseQueryRequest): Promise<ApiResponse<CaseQueryResponse>> {
  return mockAssignApi.queryAssignCases(data)
}
