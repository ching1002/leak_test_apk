import { ALargeSmall, ClipboardList, LogOut, Printer, User, X } from 'lucide-react'
import { useCallback, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import { useAuthStore } from '../../store/auth-store'
import { useDispatchStore } from '../../store/dispatch-store'
import { useReportStore } from '../../store/report-store'
import { useFontScaleStore, type FontScale } from '../../store/font-scale-store'
import { useState } from 'react'

const tabs = [
  { to: '/dispatch', label: '派工查詢', icon: ClipboardList },
  { to: '/report', label: '列印報表', icon: Printer },
] as const

const SCALE_STEPS: { value: FontScale; label: string; sub: string }[] = [
  { value: 'sm', label: '小',  sub: '14px' },
  { value: 'md', label: '標準', sub: '16px' },
  { value: 'lg', label: '大',  sub: '19px' },
]

export function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const dispatchReset = useDispatchStore((s) => s.reset)
  const reportReset = useReportStore((s) => s.reset)
  const { scale, showBar, setScale, toggleBar } = useFontScaleStore()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // 初始化時確保 html 屬性已套用
  useEffect(() => {
    document.documentElement.setAttribute('data-fscale', scale)
  }, [scale])

  const handleLogout = useCallback(async () => {
    setShowLogoutConfirm(false)
    await logout()
    dispatchReset()
    reportReset()
    navigate('/login', { replace: true })
  }, [logout, dispatchReset, reportReset, navigate])

  // 滑桿數值對應
  const scaleIndex = scale === 'sm' ? 0 : scale === 'md' ? 1 : 2
  const thumbPct = `${scaleIndex * 50}%`

  return (
    <div className="flex h-full flex-col bg-gray-50">
      {/* Header */}
      <header className="flex items-center bg-gradient-to-r from-[#4BA2CE] to-[#1a6590] px-4 py-2.5 text-white shadow-md shrink-0 z-20">
        <div className="flex items-center gap-2 min-w-0">
          <User size={16} className="shrink-0" />
          <span className="text-sm font-medium truncate">
            {user?.name ?? ''}
          </span>
          {user?.area_name && (
            <span className="text-[10px] bg-white/15 px-1.5 py-0.5 rounded shrink-0">
              {user.area_name}
            </span>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* ── 字級面板：底部彈出 ── */}
      {showBar && (
        <>
          {/* 半透明背景遮罩，點擊關閉 */}
          <div
            className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[1px]"
            onClick={toggleBar}
          />

          {/* 彈出面板 */}
          <div
            className="font-scale-panel fixed left-0 right-0 z-40 bg-white rounded-t-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.13)] border-t border-gray-100"
            style={{
              bottom: 'calc(52px + env(safe-area-inset-bottom, 0px))',
            }}
          >
            {/* 拖拉把手 */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>

            <div className="px-6 pb-6 pt-3">
              {/* 面板標題 */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-sm font-bold text-[#2c3e50]">字體大小</span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#eef8fc] text-[#4BA2CE]">
                  {SCALE_STEPS[scaleIndex].label}
                </span>
              </div>

              {/* 滑桿 */}
              <div className="px-1">
                <input
                  type="range"
                  min={0}
                  max={2}
                  step={1}
                  value={scaleIndex}
                  onChange={(e) => {
                    const vals: FontScale[] = ['sm', 'md', 'lg']
                    setScale(vals[Number(e.target.value)])
                  }}
                  className="font-scale-slider w-full"
                  style={{ '--thumb-pct': thumbPct } as React.CSSProperties}
                />

                {/* 刻度標籤 */}
                <div className="flex justify-between mt-3">
                  {SCALE_STEPS.map((opt, idx) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setScale(opt.value)}
                      className={`flex flex-col items-center gap-0.5 min-w-[48px] rounded-lg py-1 transition-colors ${
                        scale === opt.value
                          ? 'text-[#4BA2CE]'
                          : 'text-gray-400 active:text-gray-600'
                      }`}
                    >
                      <span
                        className="font-medium"
                        style={{ fontSize: idx === 0 ? '12px' : idx === 1 ? '15px' : '19px' }}
                      >
                        文
                      </span>
                      <span className="text-[10px] tracking-wide">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bottom tab bar */}
      <nav className="grid grid-cols-4 shrink-0 border-t border-gray-200 bg-white safe-area-bottom z-20">
        {tabs.map((tab) => {
          const isActive = location.pathname.startsWith(tab.to)
          return (
            <div
              key={tab.to}
              role="button"
              tabIndex={0}
              onClick={() => navigate(tab.to)}
              onKeyDown={(e) => e.key === 'Enter' && navigate(tab.to)}
              className={`flex flex-col items-center justify-center gap-0.5 h-[52px] text-[10px] font-medium cursor-pointer select-none transition-colors ${
                isActive ? 'text-[#4BA2CE]' : 'text-gray-400 active:text-gray-600'
              }`}
            >
              <tab.icon size={20} strokeWidth={1.5} />
              <span>{tab.label}</span>
            </div>
          )
        })}

        {/* 字級按鈕 */}
        <div
          role="button"
          tabIndex={0}
          onClick={toggleBar}
          onKeyDown={(e) => e.key === 'Enter' && toggleBar()}
          className={`flex flex-col items-center justify-center gap-0.5 h-[52px] text-[10px] font-medium cursor-pointer select-none transition-colors ${
            showBar ? 'text-[#4BA2CE]' : 'text-gray-400 active:text-gray-600'
          }`}
          aria-label="字體大小設定"
        >
          <ALargeSmall size={20} strokeWidth={1.5} />
          <span>字級</span>
        </div>

        {/* 登出按鈕 */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setShowLogoutConfirm(true)}
          onKeyDown={(e) => e.key === 'Enter' && setShowLogoutConfirm(true)}
          className="flex flex-col items-center justify-center gap-0.5 h-[52px] text-[10px] font-medium cursor-pointer select-none text-gray-400 transition-colors active:text-red-500"
        >
          <LogOut size={20} strokeWidth={1.5} />
          <span>登出</span>
        </div>
      </nav>

      {/* Logout confirm dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-6 w-full max-w-xs rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#2c3e50]">確認登出</h3>
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="p-1 text-gray-400 transition hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 active:scale-[0.98]"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-bold text-white transition hover:bg-red-600 active:scale-[0.98]"
              >
                確定登出
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


