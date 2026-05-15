import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Droplets,
  FileText,
  Loader2,
  MapPin,
  Phone,
  Printer,
  Search,
  SlidersHorizontal,
  Tag,
  UserCheck,
  Users,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { toast } from 'sonner'

import * as assignApi from '../api/assign'
import * as reportApi from '../api/report'
import { useAuthStore } from '../store/auth-store'
import { useReportStore } from '../store/report-store'
import type { ReportCaseItem } from '../types/report'

function fmtLocalDate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function getYearOptions() {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, i) => currentYear - 3 + i)
}

function toRocYear(westernYear: number) {
  return westernYear - 1911
}

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

const ITEMS_PER_PRINT_PAGE = 25

export function ReportPage() {
  const { user } = useAuthStore()
  const role = user?.role ?? 'station'
  const store = useReportStore()
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

  // 載入縣市/鄉鎮對照
  useEffect(() => {
    const facId = store.selectedFacId || user?.station_id
    if (!facId) return
    const areaNo = role === 'headquarters' ? store.selectedAreaNo : undefined
    reportApi.fetchLocationOptions(areaNo, facId).then((res) => {
      if (res.success && res.data) {
        store.setCounties(res.data.counties)
        store.setSelectedCounty('')
        store.setSelectedTown('')
      }
    })
  }, [store.selectedFacId, store.selectedAreaNo, role, user?.station_id])

  // 年份切換
  const handleYearChange = useCallback((newYear: number) => {
    store.setYear(newYear)
    const currentYear = new Date().getFullYear()
    if (newYear === currentYear) {
      const now = new Date()
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      store.setStartDate(fmtLocalDate(firstOfMonth))
      store.setEndDate(fmtLocalDate(now))
    } else {
      store.setStartDate(`${newYear}-01-01`)
      store.setEndDate(`${newYear}-12-31`)
    }
  }, [store])

  // 縣市切換 → 重置鄉鎮
  const handleCountyChange = useCallback((county: string) => {
    store.setSelectedCounty(county)
    store.setSelectedTown('')
  }, [store])

  // 目前選中縣市的鄉鎮列表
  const availableTowns = useMemo(() => {
    if (!store.selectedCounty) return []
    const found = store.counties.find((c) => c.county_name === store.selectedCounty)
    return found?.towns ?? []
  }, [store.counties, store.selectedCounty])

  // 前端驗證
  const validate = useCallback(() => {
    if (!store.startDate || !store.endDate) {
      toast.error('請填寫受理時間起迄')
      return false
    }
    if (store.startDate > store.endDate) {
      toast.error('起始日期不可大於結束日期')
      return false
    }
    const diffMs = new Date(store.endDate).getTime() - new Date(store.startDate).getTime()
    if (diffMs > 365 * 24 * 60 * 60 * 1000) {
      toast.error('查詢區間不可超過 1 年')
      return false
    }
    if (store.startNo || store.endNo) {
      if (!store.startNo || !store.endNo) {
        toast.error('案件編號起迄需同時填寫')
        return false
      }
      const sn = Number(store.startNo)
      const en = Number(store.endNo)
      if (isNaN(sn) || isNaN(en) || sn < 1 || en < 1 || sn > 99999 || en > 99999) {
        toast.error('案件編號須在 1~99999 之間')
        return false
      }
      if (sn > en) {
        toast.error('案件編號起始不可大於結束')
        return false
      }
    }
    if (!store.selectedFacId && role !== 'station') {
      toast.error('請選擇廠所')
      return false
    }
    return true
  }, [store.startDate, store.endDate, store.startNo, store.endNo, store.selectedFacId, role])

  // 執行查詢（卡片模式）
  const handleQuery = useCallback(async (page = 1) => {
    if (!validate()) return

    setIsQuerying(true)
    store.setCurrentPage(page)
    store.setIsPrintMode(false)
    store.setPrintData(null)

    const res = await reportApi.queryReport({
      start_date: store.startDate,
      end_date: store.endDate,
      start_no: store.startNo ? Number(store.startNo) : undefined,
      end_no: store.endNo ? Number(store.endNo) : undefined,
      year: (store.startNo && store.endNo) ? store.year : undefined,
      county_name: store.selectedCounty || undefined,
      town_name: store.selectedTown || undefined,
      area_no: role === 'headquarters' ? store.selectedAreaNo : undefined,
      fac_id: store.selectedFacId || user?.station_id || '',
      page,
      page_size: 10,
      print_mode: false,
    })

    setIsQuerying(false)

    if (res.success && res.data) {
      store.setQueryResult(res.data)
      store.setShowFilter(false)
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } else {
      toast.error(res.message ?? '查詢失敗')
    }
  }, [validate, store, role, user?.station_id])

  // 列印模式
  const handlePrintMode = useCallback(async () => {
    if (!validate()) return

    setIsQuerying(true)

    const res = await reportApi.queryReport({
      start_date: store.startDate,
      end_date: store.endDate,
      start_no: store.startNo ? Number(store.startNo) : undefined,
      end_no: store.endNo ? Number(store.endNo) : undefined,
      year: (store.startNo && store.endNo) ? store.year : undefined,
      county_name: store.selectedCounty || undefined,
      town_name: store.selectedTown || undefined,
      area_no: role === 'headquarters' ? store.selectedAreaNo : undefined,
      fac_id: store.selectedFacId || user?.station_id || '',
      page: 1,
      page_size: 500,
      print_mode: true,
    })

    setIsQuerying(false)

    if (res.success && res.data) {
      store.setPrintData(res.data)
      store.setIsPrintMode(true)
      if (res.data.total_count > 500) {
        toast.warning('查詢結果超過 500 筆，僅顯示前 500 筆，請縮小查詢範圍')
      }
    } else {
      toast.error(res.message ?? '查詢失敗')
    }
  }, [validate, store, role, user?.station_id])

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  const labelClass = 'block text-xs font-semibold text-gray-500 mb-1'
  const selectClass = 'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#4BA2CE] focus:ring-1 focus:ring-[#4BA2CE]/30 appearance-none'

  // 列印模式 — 表格排版
  if (store.isPrintMode && store.printData) {
    const pages = chunkArray(store.printData.items, ITEMS_PER_PRINT_PAGE)
    return (
      <div className="flex flex-col h-full">
        {/* 操作列（列印時隱藏） */}
        <div className="no-print flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 shrink-0">
          <button
            type="button"
            onClick={() => store.setIsPrintMode(false)}
            className="flex items-center gap-1 text-xs text-[#4BA2CE] font-medium"
          >
            <ChevronLeft size={14} /> 返回卡片模式
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg bg-[#4BA2CE] px-4 py-2 text-xs font-bold text-white shadow transition hover:bg-[#3d8fb8] active:scale-[0.98]"
          >
            <Printer size={14} /> 列印
          </button>
        </div>

        {/* 列印頁面 */}
        <div className="flex-1 overflow-y-auto bg-white px-4 py-4 print-area">
          {pages.map((pageItems, pageIdx) => (
            <div key={pageIdx} className="print-page mb-8 last:mb-0">
              <div className="text-center mb-3">
                <h2 className="text-base font-bold text-gray-900">{store.printData!.title}</h2>
                <p className="text-xs text-gray-600 mt-0.5">{store.printData!.subtitle}</p>
              </div>
              <table className="report-table w-full table-fixed border-collapse text-[10px] leading-tight">
                <colgroup>
                  <col className="w-[3%]" />
                  <col className="w-[7%]" />
                  <col className="w-[10%]" />
                  <col className="w-[7%]" />
                  <col className="w-[22%]" />
                  <col className="w-[6%]" />
                  <col className="w-[9%]" />
                  <col className="w-[6%]" />
                  <col className="w-[6%]" />
                  <col className="w-[24%]" />
                </colgroup>
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-1 py-1 text-center">#</th>
                    <th className="border border-gray-300 px-1 py-1">案號</th>
                    <th className="border border-gray-300 px-1 py-1">受理時間</th>
                    <th className="border border-gray-300 px-1 py-1">水號</th>
                    <th className="border border-gray-300 px-1 py-1">報修內容</th>
                    <th className="border border-gray-300 px-1 py-1">報修人</th>
                    <th className="border border-gray-300 px-1 py-1">電話</th>
                    <th className="border border-gray-300 px-1 py-1">來源</th>
                    <th className="border border-gray-300 px-1 py-1">派工人員</th>
                    <th className="border border-gray-300 px-1 py-1">報修位置</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((item, idx) => (
                    <tr key={item.case_no} className="hover:bg-gray-50 align-top">
                      <td className="border border-gray-300 px-1 py-0.5 text-center text-gray-500">
                        {pageIdx * ITEMS_PER_PRINT_PAGE + idx + 1}
                      </td>
                      <td className="border border-gray-300 px-1 py-0.5 font-medium break-all">{item.case_no}</td>
                      <td className="border border-gray-300 px-1 py-0.5 whitespace-nowrap">{formatDateTime(item.app_datetime)}</td>
                      <td className="border border-gray-300 px-1 py-0.5 break-all">{item.water_no || '-'}</td>
                      <td className="border border-gray-300 px-1 py-0.5 break-words">{item.app_content || '-'}</td>
                      <td className="border border-gray-300 px-1 py-0.5 break-all">{item.reporter_name || '-'}</td>
                      <td className="border border-gray-300 px-1 py-0.5 break-all">{item.reporter_tel || '-'}</td>
                      <td className="border border-gray-300 px-1 py-0.5 break-all">{item.case_source || '-'}</td>
                      <td className="border border-gray-300 px-1 py-0.5 break-all">{item.ass_man || '-'}</td>
                      <td className="border border-gray-300 px-1 py-0.5 break-words">{item.location || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-2 text-right text-[10px] text-gray-400">
                第 {pageIdx + 1}/{pages.length} 頁 ・ 共 {store.printData!.total_count} 筆
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 正常模式 — 查詢+卡片
  return (
    <div className="flex flex-col h-full">
      {/* Page title */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 shrink-0 no-print">
        <h1 className="text-sm font-bold text-[#2c3e50]">
          列印報表 — 修漏案件一覽表
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
          <div className="bg-white px-4 pt-3 pb-4 border-b border-gray-100 no-print">
            <div className="flex flex-col gap-3 max-w-lg mx-auto md:max-w-2xl lg:max-w-3xl">
              {/* 區處 / 廠所 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

              {/* 受理時間 */}
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

              {/* 縣市 / 鄉鎮 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>縣市</label>
                  <div className="relative">
                    <select
                      value={store.selectedCounty}
                      onChange={(e) => handleCountyChange(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">全部</option>
                      {store.counties.map((c) => (
                        <option key={c.county_id} value={c.county_name}>{c.county_name}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>鄉鎮市區</label>
                  <div className="relative">
                    <select
                      value={store.selectedTown}
                      onChange={(e) => store.setSelectedTown(e.target.value)}
                      className={selectClass}
                      disabled={!store.selectedCounty}
                    >
                      <option value="">全部</option>
                      {availableTowns.map((t) => (
                        <option key={t.town_id} value={t.town_name}>{t.town_name}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* 案件編號範圍（可收合） */}
              <div>
                <button
                  type="button"
                  onClick={() => store.setShowCaseNoRange(!store.showCaseNoRange)}
                  className="flex items-center gap-1 text-xs text-gray-500 font-medium"
                >
                  <ChevronDown size={12} className={`transition-transform ${store.showCaseNoRange ? 'rotate-180' : ''}`} />
                  案件編號範圍（選填）
                </button>
                {store.showCaseNoRange && (
                  <div className="mt-2 flex flex-col gap-3">
                    <div>
                      <label className={labelClass}>選擇年份</label>
                      <div className="relative">
                        <select
                          value={store.year}
                          onChange={(e) => handleYearChange(Number(e.target.value))}
                          className={selectClass}
                        >
                          {getYearOptions().map((y) => (
                            <option key={y} value={y}>{toRocYear(y)}年({y})</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>編號起</label>
                        <input
                          type="number"
                          min={1}
                          max={99999}
                          value={store.startNo}
                          onChange={(e) => store.setStartNo(e.target.value)}
                          placeholder="1"
                          className={selectClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>編號迄</label>
                        <input
                          type="number"
                          min={1}
                          max={99999}
                          value={store.endNo}
                          onChange={(e) => store.setEndNo(e.target.value)}
                          placeholder="99999"
                          className={selectClass}
                        />
                      </div>
                    </div>
                  </div>
                )}
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
              {/* Report title */}
              <div className="mb-3 rounded-lg bg-blue-50/60 border border-blue-100 px-3 py-2.5 text-center">
                <h2 className="text-xs font-bold text-[#2c3e50]">{store.queryResult.title}</h2>
                <p className="text-[10px] text-gray-500 mt-0.5">{store.queryResult.subtitle}</p>
              </div>

              {/* Result header */}
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  共 <span className="font-bold text-gray-800">{store.queryResult.total_count}</span> 筆
                </p>
                <div className="flex items-center gap-2">
                  {store.queryResult.total_count > 0 && (
                    <button
                      type="button"
                      onClick={handlePrintMode}
                      disabled={isQuerying}
                      className="flex items-center gap-1 rounded-lg border border-[#4BA2CE] px-2.5 py-1.5 text-xs font-medium text-[#4BA2CE] transition hover:bg-[#4BA2CE]/5 active:scale-[0.98] disabled:opacity-50"
                    >
                      <Printer size={12} /> 列印模式
                    </button>
                  )}
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
              </div>

              {/* Cards */}
              {store.queryResult.items.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-400">
                  無符合條件的案件
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {store.queryResult.items.map((item) => (
                    <ReportCaseCard key={item.case_no} item={item} />
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

function ReportCaseCard({ item }: { item: ReportCaseItem }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md overflow-hidden">
      {/* ── 第一層：案號 ── */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-gray-100">
        <FileText size={16} className="text-[#4BA2CE] shrink-0" />
        <span className="text-base font-bold text-[#2c3e50] tracking-wide leading-tight">
          {item.case_no}
        </span>
      </div>

      {/* ── 案件來源 chip（標頭下方，顯眼） ── */}
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

      {/* ── 第四層：報修人 + 電話 + 派工人員 ── */}
      <div className="px-4 pb-2 flex flex-wrap gap-x-4 gap-y-1">
        {item.reporter_name && (
          <div className="flex items-center gap-1.5">
            <Users size={12} className="text-gray-400 shrink-0" />
            <span className="text-xs text-gray-600">{item.reporter_name}</span>
          </div>
        )}
        {item.reporter_tel && (
          <div className="flex items-center gap-1.5">
            <Phone size={12} className="text-gray-400 shrink-0" />
            <span className="text-xs text-gray-600">{item.reporter_tel}</span>
          </div>
        )}
        {item.ass_man && (
          <div className="flex items-center gap-1.5">
            <UserCheck size={12} className="text-[#4BA2CE] shrink-0" />
            <span className="text-xs text-[#4BA2CE] font-medium">{item.ass_man}</span>
          </div>
        )}
      </div>

      {/* ── 報修內容（全文） ── */}
      {item.app_content && (
        <div className="px-4 pb-4">
          <div className="rounded-lg bg-gray-50 px-3 py-2.5 text-sm text-gray-700 leading-relaxed border border-gray-100">
            {item.app_content}
          </div>
        </div>
      )}
    </div>
  )
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result.length === 0 ? [[]] : result
}
