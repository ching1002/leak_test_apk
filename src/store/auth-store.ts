import { create } from 'zustand'

import * as authApi from '../api/auth'
import type { AreaOption, CaptchaData, UserInfo } from '../types/auth'

interface LoginResult {
  success: boolean
  message?: string
}

interface AuthState {
  user: UserInfo | null
  token: string | null
  expiresAt: number | null
  areas: AreaOption[]
  captcha: CaptchaData | null
  isLoading: boolean
  isInitialized: boolean

  loadAreas: () => Promise<void>
  loadCaptcha: () => Promise<void>
  login: (
    areaId: string,
    username: string,
    password: string,
    captchaId: string,
    captchaAnswer: string,
  ) => Promise<LoginResult>
  checkAuth: () => Promise<boolean>
  logout: () => Promise<void>
}

function restoreToken() {
  const token = sessionStorage.getItem('pw_access_token')
  const expiresAtStr = sessionStorage.getItem('pw_expires_at')
  const expiresAt = expiresAtStr ? Number(expiresAtStr) : null

  if (token && expiresAt && expiresAt * 1000 > Date.now()) {
    return { token, expiresAt }
  }

  sessionStorage.removeItem('pw_access_token')
  sessionStorage.removeItem('pw_expires_at')
  return { token: null, expiresAt: null }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  ...restoreToken(),
  areas: [],
  captcha: null,
  isLoading: false,
  isInitialized: false,

  loadAreas: async () => {
    const result = await authApi.fetchAreas()
    if (result.success && result.data) {
      set({ areas: result.data })
    }
  },

  loadCaptcha: async () => {
    const result = await authApi.fetchCaptcha()
    if (result.success && result.data) {
      set({ captcha: result.data })
    }
  },

  login: async (areaId, username, password, captchaId, captchaAnswer) => {
    set({ isLoading: true })

    try {
      const result = await authApi.login({
        area_id: areaId,
        username,
        password,
        captcha_id: captchaId,
        captcha_answer: captchaAnswer,
      })

      if (result.success && result.data) {
        const { access_token, expires_at, user } = result.data

        sessionStorage.setItem('pw_access_token', access_token)
        sessionStorage.setItem('pw_expires_at', String(expires_at))

        set({
          token: access_token,
          expiresAt: expires_at,
          user,
          isLoading: false,
        })
        return { success: true }
      }

      set({ isLoading: false })
      await get().loadCaptcha()
      return { success: false, message: result.message ?? '登入失敗' }
    } catch {
      set({ isLoading: false })
      await get().loadCaptcha()
      return { success: false, message: '無法連線至伺服器，請確認網路狀態' }
    }
  },

  checkAuth: async () => {
    const { token } = get()
    if (!token) {
      set({ isInitialized: true })
      return false
    }

    try {
      const result = await authApi.fetchMe()
      if (result.success && result.data) {
        set({ user: result.data, isInitialized: true })
        return true
      }

      sessionStorage.removeItem('pw_access_token')
      sessionStorage.removeItem('pw_expires_at')
      set({ token: null, expiresAt: null, user: null, isInitialized: true })
      return false
    } catch {
      set({ isInitialized: true })
      return false
    }
  },

  logout: async () => {
    try {
      await authApi.logout()
    } catch {
      // 即使 API 失敗也要清除本地狀態
    }

    sessionStorage.removeItem('pw_access_token')
    sessionStorage.removeItem('pw_expires_at')
    set({ token: null, expiresAt: null, user: null })
  },

}))
