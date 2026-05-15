import type { ApiResponse, CaptchaData, LoginRequest, LoginResponse, UserInfo } from '../types/auth'
import type { CaseQueryRequest, CaseQueryResponse, StationsData } from '../types/assign'
import type { DeadlineResult, DispatchRequest, DispatchResult } from '../types/dispatch'
import type { ReportQueryRequest, ReportQueryResponse } from '../types/report'
import {
  areas,
  caseDetails,
  cases,
  districts,
  factories,
  leakReasons,
  locationOptions,
  mockUsers,
  pipeSpecs,
  reportCases,
  stationsByArea,
  workers,
} from './mock-data'

const captchaSvg = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="120" height="40" viewBox="0 0 120 40">
    <rect width="120" height="40" rx="8" fill="#eef8fc"/>
    <path d="M8 31 C24 8 40 36 58 14 S92 34 112 10" fill="none" stroke="#5ab8dc" stroke-width="2"/>
    <text x="60" y="26" text-anchor="middle" font-family="Arial" font-size="20" font-weight="700" fill="#246b8f">1234</text>
  </svg>
`)

function ok<T>(data: T, message?: string): ApiResponse<T> {
  return { success: true, message, data }
}

function fail<T>(message: string, errorCode = 'MOCK_ERROR'): ApiResponse<T> {
  return { success: false, message, error_code: errorCode }
}

async function wait<T>(value: T): Promise<T> {
  await new Promise((resolve) => window.setTimeout(resolve, 180))
  return value
}

function getStoredUser(): UserInfo {
  const raw = sessionStorage.getItem('pw_mock_user')
  if (!raw) return mockUsers.station
  try {
    return JSON.parse(raw) as UserInfo
  } catch {
    return mockUsers.station
  }
}

function resolveLoginUser(request: LoginRequest): UserInfo {
  const username = request.username.trim().toLowerCase()
  if (request.area_id === '0' || username.includes('hq')) return mockUsers.hq
  if (username.includes('district') || username.includes('dist')) return mockUsers.district
  return {
    ...mockUsers.station,
    tenant_id: request.area_id === 'E' ? '6' : request.area_id || '1',
    area_name: areas.find((area) => area.area_id === request.area_id)?.name ?? '一區處',
  }
}

function paginate<T>(items: T[], page: number, pageSize: number) {
  const safePage = Math.max(1, page)
  const safeSize = Math.min(Math.max(1, pageSize), 50)
  const totalPages = items.length === 0 ? 0 : Math.ceil(items.length / safeSize)
  return {
    page: safePage,
    page_size: safeSize,
    total_count: items.length,
    total_pages: totalPages,
    items: items.slice((safePage - 1) * safeSize, safePage * safeSize),
  }
}

export const mockAuthApi = {
  fetchAreas: () => wait(ok(areas)),
  fetchCaptcha: () =>
    wait(ok<CaptchaData>({
      captcha_id: `mock-${Date.now()}`,
      image_base64: `data:image/svg+xml;charset=utf-8,${captchaSvg}`,
    })),
  login: (request: LoginRequest) => {
    if (!request.username.trim() || !request.password.trim()) {
      return wait(fail<LoginResponse>('請輸入測試帳號與密碼', 'VALIDATION_ERROR'))
    }
    if (request.captcha_answer.trim() !== '1234') {
      return wait(fail<LoginResponse>('測試驗證碼固定為 1234', 'CAPTCHA_INVALID'))
    }
    const user = resolveLoginUser(request)
    sessionStorage.setItem('pw_mock_user', JSON.stringify(user))
    return wait(ok<LoginResponse>({
      access_token: `mock-token-${user.role}-${Date.now()}`,
      token_type: 'Bearer',
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
      user,
    }, '登入成功'))
  },
  fetchMe: () => wait(ok(getStoredUser())),
  refreshToken: () =>
    wait(ok<LoginResponse>({
      access_token: `mock-token-refresh-${Date.now()}`,
      token_type: 'Bearer',
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
      user: getStoredUser(),
    })),
  logout: () => {
    sessionStorage.removeItem('pw_mock_user')
    return wait(ok<null>(null, '已登出'))
  },
}

export const mockAssignApi = {
  fetchDistricts: () => wait(ok({ districts })),
  fetchStations: (areaNo?: string) => {
    const user = getStoredUser()
    if (user.role === 'station') {
      return wait(ok<StationsData>({
        area_name: user.area_name,
        station_name: user.station_name,
        show_dropdown: false,
        stations: [],
      }))
    }
    const selectedAreaNo = areaNo || user.tenant_id || '1'
    return wait(ok<StationsData>({
      area_name: areas.find((area) => area.area_id === selectedAreaNo)?.name ?? '一區處',
      station_name: '',
      show_dropdown: true,
      stations: stationsByArea[selectedAreaNo] ?? stationsByArea['1'],
    }))
  },
  queryAssignCases: (request: CaseQueryRequest) => {
    const user = getStoredUser()
    const filtered = cases.filter((item) => {
      const byStation = request.fac_id && request.fac_id !== 'ALL'
        ? item.case_no.startsWith(request.fac_id)
        : true
      const byFilter = request.case_filter === 'all'
        || (request.case_filter === 'unassigned' && item.status_text === '未派工')
        || (request.case_filter === 'unconfirmed' && item.status_text === '未確認漏水')
        || (request.case_filter === 'unstarted' && item.status_text === '未開工')
        || (request.case_filter === 'unlogged' && item.status_text === '未回報')
      return byStation && byFilter
    })
    return wait(ok<CaseQueryResponse>({
      ...paginate(filtered, request.page, request.page_size),
      can_dispatch: user.role !== 'headquarters',
    }))
  },
}

export const mockDispatchApi = {
  fetchCaseDetail: (caseNo: string) => wait(ok(caseDetails[caseNo] ?? caseDetails[cases[0].case_no])),
  fetchWorkers: () => wait(ok({ workers })),
  fetchFactories: () => wait(ok({ factories })),
  fetchLeakReasons: () => wait(ok({ reasons: leakReasons })),
  fetchPipeSpecs: () => wait(ok({ pipe_specs: pipeSpecs })),
  submitDispatch: (caseNo: string, data: DispatchRequest) => {
    const deadline = buildDeadline(data.work_start_datetime || data.ass_time || new Date().toISOString(), data.case_attribute, data.pipe_spec)
    return wait(ok<DispatchResult>({
      message: `測試案件 ${caseNo} 已暫存派工資料`,
      fix_deadline: deadline.fix_deadline,
    }))
  },
  calculateDeadline: (_caseNo: string, data: {
    case_attribute: number | null
    pipe_spec: number | null
    emergency: number | null
    work_start_datetime: string | null
    app_datetime: string
  }) => wait(ok(buildDeadline(data.work_start_datetime || data.app_datetime, data.case_attribute, data.pipe_spec))),
}

export const mockReportApi = {
  fetchLocationOptions: () => wait(ok({ counties: locationOptions })),
  queryReport: (request: ReportQueryRequest) => {
    const filtered = reportCases.filter((item) => {
      const byStation = request.fac_id && request.fac_id !== 'ALL'
        ? item.case_no.startsWith(request.fac_id)
        : true
      const byCounty = request.county_name ? item.location.includes(request.county_name) : true
      const byTown = request.town_name ? item.location.includes(request.town_name) : true
      return byStation && byCounty && byTown
    })
    return wait(ok<ReportQueryResponse>({
      title: '台灣自來水公司 修漏案件測試報表',
      subtitle: `測試資料區間 ${request.start_date || '-'} 至 ${request.end_date || '-'}`,
      ...paginate(filtered, request.page, request.print_mode ? 500 : request.page_size),
    }))
  },
}

function buildDeadline(baseIso: string, caseAttribute: number | null, pipeSpec: number | null): DeadlineResult {
  const base = Number.isNaN(new Date(baseIso).getTime()) ? new Date() : new Date(baseIso)
  const hours = caseAttribute === 1 && pipeSpec && pipeSpec <= 450 ? 8 : 24
  const deadline = new Date(base.getTime() + hours * 60 * 60 * 1000)
  const y = deadline.getFullYear()
  const m = deadline.getMonth() + 1
  const d = deadline.getDate()
  const hh = String(deadline.getHours()).padStart(2, '0')
  const mm = String(deadline.getMinutes()).padStart(2, '0')
  return {
    fix_deadline: `${y}/${m}/${d} ${hh}:${mm}`,
    calculation_basis: `測試規則：${caseAttribute === 1 ? `管線 ${pipeSpec ?? '-'}mm` : '一般案件'}，基準時間加 ${hours} 小時`,
  }
}
