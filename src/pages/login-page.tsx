import {
  ChevronDown,
  Droplets,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useAuthStore } from '../store/auth-store'

function WaterBackground() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 800 800"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5CC8E8" />
          <stop offset="50%" stopColor="#3DA8D4" />
          <stop offset="100%" stopColor="#1A6B99" />
        </linearGradient>
        <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2B8CB8" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#185C80" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="wave2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#237DA8" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#1A6590" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="wave3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3BBCE0" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#2090B8" stopOpacity="0.5" />
        </linearGradient>
      </defs>

      <rect width="800" height="800" fill="url(#bg)" />

      <path
        d="M-100,250 C50,180 200,350 350,280 C500,210 550,380 700,320 C850,260 900,400 1000,350 L1000,600 C850,550 700,650 550,580 C400,510 300,620 150,560 C0,500 -50,400 -100,450 Z"
        fill="url(#wave1)"
      />
      <path
        d="M-50,350 C100,280 180,420 330,370 C480,320 520,460 670,400 C820,340 880,480 950,430 L950,700 C800,660 680,750 530,690 C380,630 280,720 130,670 C-20,620 -50,530 -50,530 Z"
        fill="url(#wave2)"
      />
      <path
        d="M-80,450 C80,390 160,500 310,460 C460,420 540,540 690,490 C840,440 900,560 1000,520 L1000,850 C850,830 700,850 550,850 C400,850 250,850 100,850 C-50,850 -80,850 -80,850 Z"
        fill="url(#wave3)"
      />

      <path d="M-20,200 C120,140 240,300 380,240 C520,180 580,310 720,260 C860,210 920,320 1000,280" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
      <path d="M-40,320 C100,260 220,400 360,340 C500,280 560,410 700,360 C840,310 900,420 1000,380" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />

      <g fill="rgba(255,255,255,0.25)">
        <path d="M620,120 Q625,105 630,120 Q640,140 620,145 Q600,140 610,125 Z" />
        <path d="M180,500 Q185,485 190,500 Q200,520 180,525 Q160,520 170,505 Z" />
        <path d="M720,580 Q726,562 732,580 Q744,604 720,610 Q696,604 708,585 Z" />
      </g>
      <g fill="rgba(255,255,255,0.2)">
        <path d="M340,100 Q343,92 346,100 Q352,112 340,115 Q328,112 334,103 Z" />
        <path d="M550,300 Q553,292 556,300 Q562,312 550,315 Q538,312 544,303 Z" />
        <path d="M140,350 Q143,342 146,350 Q152,362 140,365 Q128,362 134,353 Z" />
        <path d="M680,380 Q683,372 686,380 Q692,392 680,395 Q668,392 674,383 Z" />
      </g>
      <g fill="rgba(255,255,255,0.15)">
        <circle cx="250" cy="150" r="3" />
        <circle cx="480" cy="200" r="2.5" />
        <circle cx="700" cy="250" r="2" />
        <circle cx="120" cy="420" r="3.5" />
        <circle cx="400" cy="480" r="2" />
        <circle cx="600" cy="520" r="3" />
        <circle cx="300" cy="600" r="2.5" />
        <circle cx="760" cy="450" r="2" />
      </g>

      <g fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1">
        <circle cx="160" cy="580" r="12" />
        <circle cx="160" cy="580" r="6" />
        <circle cx="650" cy="620" r="15" />
        <circle cx="650" cy="620" r="8" />
        <circle cx="380" cy="680" r="10" />
        <circle cx="100" cy="200" r="8" />
        <circle cx="500" cy="100" r="10" />
        <circle cx="500" cy="100" r="5" />
        <circle cx="750" cy="350" r="11" />
        <circle cx="750" cy="350" r="5" />
        <circle cx="280" cy="380" r="9" />
        <circle cx="580" cy="680" r="13" />
        <circle cx="580" cy="680" r="6" />
      </g>
    </svg>
  )
}

export function LoginPage() {
  const navigate = useNavigate()
  const {
    areas,
    captcha,
    isLoading,
    loadAreas,
    loadCaptcha,
    login,
  } = useAuthStore()

  const [areaId, setAreaId] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [captchaAnswer, setCaptchaAnswer] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isRefreshingCaptcha, setIsRefreshingCaptcha] = useState(false)

  const usernameRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const captchaRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadAreas()
    loadCaptcha()

    const savedAreaId = localStorage.getItem('pw_last_area_id')
    const savedUsername = localStorage.getItem('pw_last_username')

    if (savedAreaId) {
      setAreaId(savedAreaId)
      setRememberMe(true)
    }
    if (savedUsername) {
      setUsername(savedUsername)
    }
  }, [loadAreas, loadCaptcha])

  useEffect(() => {
    if (areas.length > 0 && !areaId) {
      const savedAreaId = localStorage.getItem('pw_last_area_id')
      setAreaId(savedAreaId ?? areas[0].area_id)
    }
  }, [areas, areaId])

  const handleRefreshCaptcha = useCallback(async () => {
    setIsRefreshingCaptcha(true)
    setCaptchaAnswer('')
    await loadCaptcha()
    setIsRefreshingCaptcha(false)
  }, [loadCaptcha])

  const handleLogin = useCallback(async () => {
    if (!areaId) {
      toast.error('請選擇區處')
      return
    }
    if (!username.trim()) {
      toast.error('請輸入帳號')
      usernameRef.current?.focus()
      return
    }
    if (!password.trim()) {
      toast.error('請輸入密碼')
      passwordRef.current?.focus()
      return
    }
    if (!captchaAnswer.trim()) {
      toast.error('請輸入驗證碼')
      captchaRef.current?.focus()
      return
    }
    if (!captcha) {
      toast.error('驗證碼尚未載入，請稍候')
      return
    }

    const result = await login(
      areaId,
      username.trim(),
      password,
      captcha.captcha_id,
      captchaAnswer.trim(),
    )

    if (result.success) {
      if (rememberMe) {
        localStorage.setItem('pw_last_area_id', areaId)
        localStorage.setItem('pw_last_username', username.trim())
      } else {
        localStorage.removeItem('pw_last_area_id')
        localStorage.removeItem('pw_last_username')
      }
      toast.success('登入成功')
      navigate('/dashboard', { replace: true })
    } else {
      toast.error(result.message ?? '登入失敗')
      setCaptchaAnswer('')
      captchaRef.current?.focus()
    }
  }, [
    areaId,
    username,
    password,
    captchaAnswer,
    captcha,
    rememberMe,
    login,
    navigate,
  ])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleLogin()
      }
    },
    [handleLogin],
  )

  const labelClass =
    'block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5'
  const inputWrapperClass =
    'flex items-center border-b border-gray-200 pb-1.5 focus-within:border-primary-400 transition-colors gap-2'
  const inputClass =
    'w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-300'

  return (
    <div className="flex h-full flex-col md:flex-row overflow-hidden bg-white">
      {/* ─── 上方 / 左側標頭區域（水流波浪 + 水滴） ─── */}
      <div className="relative shrink-0 overflow-hidden h-[280px] md:h-full md:w-[45%] lg:w-[55%] md:shrink">
        <WaterBackground />

        {/* Logo 與標題 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-4 z-10">
          <div className="flex flex-col items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-[1.5px] border-white/80 bg-white/5 backdrop-blur-sm shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              <Droplets size={36} className="text-white drop-shadow-sm" />
            </div>
            <h1 className="mt-4 text-xl font-bold tracking-[0.15em] text-white drop-shadow-md">
              檢修漏系統
            </h1>
            <p className="mt-1 text-[10px] font-semibold tracking-widest text-[#a8dff5]">
              WATER SYS
            </p>
          </div>
        </div>

        {/* 手機版：底部水平波浪（mockup 原版） */}
        <svg
          viewBox="0 0 1440 320"
          className="absolute bottom-0 h-[70px] w-full origin-bottom text-white fill-current preserve-3d md:hidden"
          preserveAspectRatio="none"
        >
          <path d="M0,224L80,197.3C160,171,320,117,480,122.7C640,128,800,192,960,197.3C1120,203,1280,149,1360,122.7L1440,96L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z" />
        </svg>

        {/* 桌面版：右側垂直波浪（mockup 原版） */}
        <svg
          viewBox="0 0 320 1440"
          className="absolute right-0 top-0 hidden h-full w-[70px] text-white fill-current md:block"
          preserveAspectRatio="none"
        >
          <path d="M224,0 L197.3,80 C171,160 117,320 122.7,480 C128,640 192,800 197.3,960 C203,1120 149,1280 122.7,1360 L96,1440 L320,1440 L320,0 Z" />
        </svg>
      </div>

      {/* ─── 表單區域 ─── */}
      <div className="flex flex-1 flex-col overflow-y-auto px-6 sm:px-8 pb-6 sm:pb-8 pt-5 sm:pt-6 md:mx-auto md:w-full md:max-w-md md:justify-center lg:max-w-lg">
        <h2 className="mb-5 sm:mb-6 text-base sm:text-lg font-extrabold tracking-wide text-[#2c3e50]">
          登入您的帳號
        </h2>

        <div className="flex flex-col gap-5 sm:gap-6" onKeyDown={handleKeyDown}>
          {/* 選擇區處 */}
          <div>
            <label className={labelClass}>區處 AREA</label>
            <div className={inputWrapperClass}>
              <select
                value={areaId}
                onChange={(e) => setAreaId(e.target.value)}
                className={`${inputClass} appearance-none cursor-pointer`}
              >
                {areas.length === 0 && (
                  <option value="">載入中...</option>
                )}
                {areas.map((area) => (
                  <option key={area.area_id} value={area.area_id}>
                    {area.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="shrink-0 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* 帳號 */}
          <div>
            <label className={labelClass}>帳號 ACCOUNT</label>
            <div className={inputWrapperClass}>
              <input
                ref={usernameRef}
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="請輸入 AD 帳號"
                className={inputClass}
              />
            </div>
          </div>

          {/* 密碼 */}
          <div>
            <label className={labelClass}>密碼 PASSWORD</label>
            <div className={inputWrapperClass}>
              <input
                ref={passwordRef}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="請輸入密碼"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="shrink-0 p-1 text-gray-400 transition hover:text-primary-400 active:scale-90"
                aria-label={showPassword ? '隱藏密碼' : '顯示密碼'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* 驗證碼 */}
          <div>
            <label className={labelClass}>驗證碼 CAPTCHA</label>
            <div className={inputWrapperClass}>
              <input
                ref={captchaRef}
                type="text"
                autoComplete="off"
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                placeholder="輸入右側驗證碼"
                className={`${inputClass} max-w-[140px]`}
                maxLength={6}
              />
              {captcha?.image_base64 ? (
                <button
                  type="button"
                  onClick={handleRefreshCaptcha}
                  className="shrink-0 h-9 rounded-md overflow-hidden border border-gray-100 transition hover:opacity-80 active:scale-95"
                  title="點擊重新產生驗證碼"
                >
                  <img
                    src={captcha.image_base64}
                    alt="驗證碼"
                    className="h-full w-auto object-contain"
                    draggable={false}
                  />
                </button>
              ) : (
                <div className="flex h-9 w-[100px] shrink-0 items-center justify-center rounded-md bg-gray-100 text-xs text-gray-400">
                  載入中...
                </div>
              )}
              <button
                type="button"
                onClick={handleRefreshCaptcha}
                disabled={isRefreshingCaptcha}
                className="shrink-0 p-1.5 text-gray-400 transition hover:text-primary-400 active:scale-90 disabled:opacity-50"
                title="重新產生驗證碼"
                aria-label="重新產生驗證碼"
              >
                <RefreshCw
                  size={14}
                  className={isRefreshingCaptcha ? 'animate-spin' : ''}
                />
              </button>
            </div>
          </div>

          {/* 記住帳號 */}
          <label className="flex items-center gap-2 cursor-pointer select-none -mt-1">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary-500 accent-primary-500"
            />
            <span className="text-xs text-gray-500">記住帳號和區處</span>
          </label>
        </div>

        {/* 登入按鈕 */}
        <button
          type="button"
          onClick={handleLogin}
          disabled={isLoading}
          className="mt-7 sm:mt-10 flex h-11 sm:h-12 w-full items-center justify-center rounded-3xl bg-gradient-to-r from-[#51bbed] to-[#3498c9] text-sm font-bold tracking-widest text-white shadow-lg shadow-[#3498c9]/30 transition hover:from-[#49aad6] hover:to-[#2e86b0] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="mr-2 animate-spin" />
              登入中...
            </>
          ) : (
            '登入系統'
          )}
        </button>

        <p className="mt-6 sm:mt-8 text-center text-[10px] text-gray-400">
          台灣自來水公司 — 修漏管理系統行動版
        </p>
      </div>
    </div>
  )
}
