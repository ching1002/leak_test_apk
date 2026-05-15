import { mockAuthApi } from '../mock/mock-api'
import type { AreaOption, ApiResponse, CaptchaData, LoginRequest, LoginResponse, UserInfo } from '../types/auth'

export function fetchAreas(): Promise<ApiResponse<AreaOption[]>> {
  return mockAuthApi.fetchAreas()
}

export function fetchCaptcha(): Promise<ApiResponse<CaptchaData>> {
  return mockAuthApi.fetchCaptcha()
}

export function login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  return mockAuthApi.login(data)
}

export function fetchMe(): Promise<ApiResponse<UserInfo>> {
  return mockAuthApi.fetchMe()
}

export function refreshToken(): Promise<ApiResponse<LoginResponse>> {
  return mockAuthApi.refreshToken()
}

export function logout(): Promise<ApiResponse<null>> {
  return mockAuthApi.logout()
}
