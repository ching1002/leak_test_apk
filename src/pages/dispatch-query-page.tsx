import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Droplets,
  FileText,
  Loader2,
  MapPin,
  Search,
  SlidersHorizontal,
  Tag,
} from 'lucide-react'
import { useCallback, useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import * as assignApi from '../api/assign'
import { useAuthStore } from '../store/auth-store'
import { useDispatchStore } from '../store/dispatch-store'
import type { CaseItem } from '../types/assign'



function formatDateTime(iso: string) {
  if (!iso) return '-'
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${min}`
}

const CASE_FILTERS = [
  { value: 'all', label: '不限' },
  { value: 'unassigned', label: '尚未派工' },
  { value: 'unconfirmed', label: '尚未確認漏水點' },
  { value: 'unstarted', label: '尚未開工' },
  { value: 'unlogged', label: '尚未登錄' },
] as const

export function DispatchQueryPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const role = user?.role ?? 'station'
  const store = useDispatchStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  const [isQuerying, setIsQuerying] = useState(false)

  // --- 初始化（僅首次進入時載入下拉選項）---
  useEffect(() => {
    if (store.initialized) return
    store.setInitialized(true)

    if (role === 'headquarters') {
      assignApi.fetchDistricts().then((res) => {
        if (res.success && res.data) {
          store.setDistricts(res.data.districts)
          if (res.data.districts.length > 0 && !store.selectedAreaNo) {
            store.setSelectedAreaNo(res.data.districts[0].area_no)
          }
        }
      })
    } else {
      assignApi.fetchStations().then((res) => {
        if (res.success && res.data) {
          store.setAreaName(res.data.area_name)
          store.setStationName(res.data.station_name)
          store.setShowStationDropdown(res.data.show_dropdown)
          store.setStations(res.data.stations)
          if (res.data.stations.length > 0 && !store.selectedFacId) {
            store.setSelectedFacId(res.data.stations[0].fac_id)
          } else if (user?.station_id && !store.selectedFacId) {
            store.setSelectedFacId(user.station_id)
          }
        }
      })
    }
  }, [role, user?.station_id, store])

  // 總處：選擇區處 → 載入廠所
  useEffect(() => {
    if (role === 'headquarters' && store.selectedAreaNo) {
      assignApi.fetchStations(store.selectedAreaNo).then((res) => {
        if (res.success && res.data) {
          store.setAreaName(res.data.area_name)
          store.setShowStationDropdown(res.data.show_dropdown)
          store.setStations(res.data.stations)
          if (res.data.stations.length > 0) {
            store.setSelectedFacId(res.data.stations[0].fac_id)
          }
        }
      })
    }
  }, [role, store.selectedAreaNo])



  // 執行查詢
  const handleQuery = useCallback(async (page = 1) => {
    if (!store.selectedFacId && role !== 'station') {
      toast.error('請選擇廠所')
      return
    }

    setIsQuerying(true)
    store.setCurrentPage(page)

    const res = await assignApi.queryAssignCases({
      start_date: store.startDate,
      end_date: store.endDate,
      case_filter: store.caseFilter,
      area_no: role === 'headquarters' ? store.selectedAreaNo : undefined,
      fac_id: store.selectedFacId || user?.station_id || '',
      page,
      page_size: 10,
    })

    setIsQuerying(false)

    if (res.success && res.data) {
      store.setQueryResult(res.data)
      store.setShowFilter(false)
      // 捲動至頂部
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } else {
      toast.error(res.message ?? '查詢失敗')
    }
  }, [store, role, user?.station_id])

  const handleDispatch = useCallback((caseNo: string) => {
    navigate(`/dispatch/${encodeURIComponent(caseNo)}`)
  }, [navigate])

  const isHeadquarters = role === 'headquarters'

  const labelClass = 'block text-xs font-semibold text-gray-500 mb-1'
  const selectClass = 'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#4BA2CE] focus:ring-1 focus:ring-[#4BA2CE]/30 appearance-none'

  return (
    <div className="flex flex-col h-full">
      {/* Page title */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 shrink-0">
        <h1 className="text-sm font-bold text-[#2c3e50]">
          派工管理 — 修漏案件查詢
          {isHeadquarters && (
            <span className="ml-2 text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
              查閱模式
            </span>
          )}
        </h1>
        <button
          type="button"
          onClick={() => store.setShowFilter(!store.showFilter)}
          className="flex items-center gap-1 text-xs text-[#4BA2CE] font-medium"
        >
          <SlidersHorizontal size={14} />
          {store.showFilter ? '收合' : '篩選'}
        </button>
      </div>

      {/* Scrollable area */}
      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        {/* Filter section */}
        {store.showFilter && (
          <div className="bg-white px-4 pt-3 pb-4 border-b border-gray-100">
            <div className="flex flex-col gap-3 max-w-lg mx-auto md:max-w-2xl lg:max-w-3xl">
              {/* 區處 / 廠所 — 依角色顯示 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 區處 */}
                {role === 'headquarters' ? (
                  <div>
                    <label className={labelClass}>選擇區處</label>
                    <div className="relative">
                      <select
                        value={store.selectedAreaNo}
                        onChange={(e) => store.setSelectedAreaNo(e.target.value)}
                        className={selectClass}
                      >
                        {store.districts.map((d) => (
                          <option key={d.area_no} value={d.area_no}>{d.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                ) : role === 'district' ? (
                  <div>
                    <label className={labelClass}>所屬區處</label>
                    <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
                      {store.areaName || user?.area_name || '-'}
                    </div>
                  </div>
                ) : (
                  <div className="sm:col-span-2">
                    <label className={labelClass}>所屬單位</label>
                    <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
                      {store.areaName || user?.area_name || ''} {store.stationName || user?.station_name || ''}
                    </div>
                  </div>
                )}

                {/* 廠所 */}
                {store.showStationDropdown && (
                  <div>
                    <label className={labelClass}>選擇廠所</label>
                    <div className="relative">
                      <select
                        value={store.selectedFacId}
                        onChange={(e) => store.setSelectedFacId(e.target.value)}
                        className={selectClass}
                      >
                        {store.stations.map((s) => (
                          <option key={s.fac_id} value={s.fac_id}>{s.fac_name}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                )}
              </div>

              {/* 日期 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>受理時間起</label>
                  <input
                    type="date"
                    value={store.startDate}
                    onChange={(e) => store.setStartDate(e.target.value)}
                    className={selectClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>受理時間迄</label>
                  <input
                    type="date"
                    value={store.endDate}
                    onChange={(e) => store.setEndDate(e.target.value)}
                    className={selectClass}
                  />
                </div>
              </div>

              {/* 未處理案件 */}
              <div>
                <label className={labelClass}>未處理案件</label>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                  {CASE_FILTERS.map((f) => (
                    <label key={f.value} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="caseFilter"
                        value={f.value}
                        checked={store.caseFilter === f.value}
                        onChange={() => store.setCaseFilter(f.value)}
                        className="h-3.5 w-3.5 accent-[#4BA2CE]"
                      />
                      <span className="text-xs text-gray-600">{f.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 查詢按鈕 */}
              <button
                type="button"
                onClick={() => handleQuery(1)}
                disabled={isQuerying}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#51bbed] to-[#3498c9] text-sm font-bold tracking-wider text-white shadow-md shadow-[#3498c9]/20 transition hover:from-[#49aad6] hover:to-[#2e86b0] active:scale-[0.98] disabled:opacity-60 sm:max-w-xs sm:mx-auto"
              >
                {isQuerying ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Search size={16} />
                )}
                {isQuerying ? '查詢中...' : '執行查詢'}
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="px-4 py-3 max-w-lg mx-auto md:max-w-2xl lg:max-w-3xl">
          {store.queryResult === null && !isQuerying && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-300">
              <Search size={48} strokeWidth={1} />
              <p className="mt-3 text-sm">設定條件後執行查詢</p>
            </div>
          )}

          {store.queryResult !== null && (
            <>
              {/* Result header */}
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  查詢結果：共 <span className="font-bold text-gray-800">{store.queryResult.total_count}</span> 筆
                  {!store.queryResult.can_dispatch && (
                    <span className="ml-1 text-amber-600">（查閱模式）</span>
                  )}
                </p>
                {!store.showFilter && (
                  <button
                    type="button"
                    onClick={() => store.setShowFilter(true)}
                    className="text-xs text-[#4BA2CE] font-medium"
                  >
                    修改條件
                  </button>
                )}
              </div>

              {/* Cards */}
              {store.queryResult.items.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-400">
                  無符合條件的案件
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {store.queryResult.items.map((item) => (
                    <CaseCard
                      key={item.case_no}
                      item={item}
                      canDispatch={store.queryResult!.can_dispatch}
                      onDispatch={handleDispatch}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {store.queryResult.total_pages > 1 && (
                <div className="mt-4 mb-2 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    disabled={store.currentPage <= 1}
                    onClick={() => handleQuery(store.currentPage - 1)}
                    className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
                  >
                    <ChevronLeft size={14} /> 上一頁
                  </button>
                  <span className="text-xs text-gray-500">
                    第 {store.currentPage}/{store.queryResult.total_pages} 頁
                  </span>
                  <button
                    type="button"
                    disabled={store.currentPage >= store.queryResult.total_pages}
                    onClick={() => handleQuery(store.currentPage + 1)}
                    className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
                  >
                    下一頁 <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── 案件狀態 badge 設定 ──
const STATUS_BADGE_MAP: Record<string, string> = {
  '尚未派工': 'bg-red-50   text-red-600   border-red-200',
  '尚未確認漏水': 'bg-amber-50  text-amber-700 border-amber-200',
  '尚未開工': 'bg-orange-50 text-orange-700 border-orange-200',
  '尚未登錄': 'bg-blue-50   text-blue-700  border-blue-200',
  '處理中': 'bg-gray-50   text-gray-600  border-gray-200',
}

function CaseCard({
  item,
  canDispatch,
  onDispatch,
}: {
  item: CaseItem
  canDispatch: boolean
  onDispatch: (caseNo: string) => void
}) {
  const badgeCls = STATUS_BADGE_MAP[item.status_text] ?? 'bg-gray-50 text-gray-500 border-gray-200'

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md overflow-hidden">
      {/* ── 第一層：案號 + 狀態 badge ── */}
      <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2 min-w-0">
          <FileText size={16} className="text-[#4BA2CE] shrink-0" />
          <span className="text-base font-bold text-[#2c3e50] tracking-wide leading-tight">
            {item.case_no}
          </span>
        </div>
        <span className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badgeCls}`}>
          {item.status_text || '全部案件'}
        </span>
      </div>

      {/* ── 案件來源 chip（分隔線下，單獨一行，顯眼） ── */}
      {item.case_source && (
        <div className="px-4 pt-2.5 pb-1">
          <span className="inline-flex items-center gap-1.5 bg-[#eef8fc] text-[#2e86b0] text-xs font-semibold px-2.5 py-1 rounded-md border border-[#c8e8f5]">
            <Tag size={11} className="shrink-0" />
            {item.case_source}
          </span>
        </div>
      )}

      {/* ── 第二層：時間 + 水號 ── */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 px-4 pt-2 pb-2">
        <div className="flex items-center gap-1.5 text-sm text-gray-700">
          <Calendar size={13} className="text-[#4BA2CE] shrink-0" />
          <span className="font-medium">{formatDateTime(item.app_datetime)}</span>
        </div>
        {item.water_no && (
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <Droplets size={13} className="text-[#4BA2CE] shrink-0" />
            <span>{item.water_no}</span>
          </div>
        )}
      </div>

      {/* ── 第三層：報修位置 ── */}
      {item.location && (
        <div className="flex items-start gap-2 px-4 pb-2">
          <MapPin size={13} className="text-[#4BA2CE] shrink-0 mt-0.5" />
          <span className="text-sm text-gray-700 leading-snug">{item.location}</span>
        </div>
      )}

      {/* ── 第四層：報修內容（全文顯示） ── */}
      {item.app_content && (
        <div className="px-4 pb-3">
          <div className="rounded-lg bg-gray-50 px-3 py-2.5 text-sm text-gray-700 leading-relaxed border border-gray-100">
            {item.app_content}
          </div>
        </div>
      )}

      {/* ── 底部：派工按鈕 ── */}
      {canDispatch && (
        <div className="px-4 pb-4">
          <button
            type="button"
            onClick={() => onDispatch(item.case_no)}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#51bbed] to-[#3498c9] text-sm font-bold tracking-widest text-white shadow shadow-[#3498c9]/20 transition hover:from-[#49aad6] hover:to-[#2e86b0] active:scale-[0.98]"
          >
            派　工
          </button>
        </div>
      )}
    </div>
  )
}
