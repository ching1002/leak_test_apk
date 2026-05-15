import { mockDispatchApi } from '../mock/mock-api'
import type { ApiResponse } from '../types/auth'
import type { CaseDetail, DeadlineResult, DispatchRequest, DispatchResult, FactoryOption, LeakReason, WorkerOption } from '../types/dispatch'

export function fetchCaseDetail(caseNo: string): Promise<ApiResponse<CaseDetail>> {
  return mockDispatchApi.fetchCaseDetail(caseNo)
}

export function fetchWorkers(_caseNo: string): Promise<ApiResponse<{ workers: WorkerOption[] }>> {
  return mockDispatchApi.fetchWorkers()
}

export function fetchFactories(_caseNo: string): Promise<ApiResponse<{ factories: FactoryOption[] }>> {
  return mockDispatchApi.fetchFactories()
}

export function fetchLeakReasons(): Promise<ApiResponse<{ reasons: LeakReason[] }>> {
  return mockDispatchApi.fetchLeakReasons()
}

export function fetchPipeSpecs(): Promise<ApiResponse<{ pipe_specs: number[] }>> {
  return mockDispatchApi.fetchPipeSpecs()
}

export function submitDispatch(caseNo: string, data: DispatchRequest): Promise<ApiResponse<DispatchResult>> {
  return mockDispatchApi.submitDispatch(caseNo, data)
}

export function calculateDeadline(
  caseNo: string,
  data: {
    case_attribute: number | null
    pipe_spec: number | null
    emergency: number | null
    work_start_datetime: string | null
    app_datetime: string
  },
): Promise<ApiResponse<DeadlineResult>> {
  return mockDispatchApi.calculateDeadline(caseNo, data)
}
