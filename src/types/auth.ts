export interface AreaOption {
  area_id: string
  name: string
}

export interface CaptchaData {
  captcha_id: string
  image_base64: string
}

export interface UserInfo {
  user_id: string
  name: string
  tenant_id: string
  station_id: string
  area_name: string
  station_name: string
  role: 'headquarters' | 'district' | 'station'
}

export interface LoginResponse {
  access_token: string
  token_type: string
  expires_at: number
  user: UserInfo
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  error_code?: string
  data?: T
}

export interface LoginRequest {
  area_id: string
  username: string
  password: string
  captcha_id: string
  captcha_answer: string
}
