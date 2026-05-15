import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  Droplets,
  FileText,
  Loader2,
  MapPin,
  Phone,
  Send,
  Tag,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { DatetimeInput } from '../components/datetime-input'
import * as dispatchApi from '../api/dispatch'
import type {
  CaseDetail,
  DispatchRequest,
  FactoryOption,
  LeakReason,
  WorkerOption,
} from '../types/dispatch'

function toLocalDatetime(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}


function formatReadableDate(iso: string | null | undefined): string {
  if (!iso) return '-'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatFixDeadline(val: string | null | undefined): string {
  if (!val) return '-'
  const d = new Date(val)
  if (!isNaN(d.getTime())) {
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }
  const match = val.match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})\D+(\d{1,2})\D+(\d{1,2})/)
  if (match) {
    const [, y, mo, day, h, min] = match
    return `${y}/${mo.padStart(2, '0')}/${day.padStart(2, '0')} ${h.padStart(2, '0')}:${min.padStart(2, '0')}`
  }
  return val
}

const LABEL = 'block text-sm font-bold text-gray-700 mb-2'
const INPUT =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#4BA2CE] focus:ring-1 focus:ring-[#4BA2CE]/30'
const SELECT_WRAP = 'relative'
const SELECT =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#4BA2CE] focus:ring-1 focus:ring-[#4BA2CE]/30 appearance-none pr-8'
const RADIO_LABEL = 'relative flex items-center cursor-pointer select-none group w-fit'
const RADIO = 'peer sr-only'
const RADIO_TEXT = 'px-3.5 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 bg-white transition-all group-hover:border-[#4BA2CE] peer-checked:border-[#4BA2CE] peer-checked:bg-[#eef6fa] peer-checked:text-[#1a6590] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed shadow-sm'
const CHECKBOX_LABEL = 'relative flex items-center gap-2 cursor-pointer select-none group w-fit'
const CHECKBOX = 'peer sr-only'
const CHECKBOX_BOX = 'w-5 h-5 rounded border-2 border-gray-300 flex items-center justify-center bg-white transition-colors group-hover:border-[#4BA2CE] peer-checked:bg-[#4BA2CE] peer-checked:border-[#4BA2CE] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed'
const CHECKBOX_TEXT = 'text-sm font-bold text-gray-700 transition-colors group-hover:text-[#4BA2CE] peer-disabled:opacity-50'

const CHARGE_OPTIONS = [
  { value: 'none', label: '無' },
  { value: 'free', label: '免收費' },
  { value: 'damage', label: '挖損追償' },
  { value: 'unknown', label: '未知' },
  { value: 'charge', label: '金額' },
] as const

function BeautifulIcon() {
  return (
    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm shadow-orange-500/30">
      <FileText size={13} className="text-white" strokeWidth={2.5} />
    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100 bg-white">
      <BeautifulIcon />
      <span className="text-[15px] font-bold text-gray-800 tracking-wide">{title}</span>
    </div>
  )
}

const USER_EMERGENCY_OPTIONS = [
  { value: 0, label: '無' },
  { value: 1, label: '用戶急需處理' },
  { value: 2, label: '漏水量很大影響交通安全' },
] as const

const EMERGENCY_OPTIONS = [
  { value: null as number | null, label: '無' },
  { value: 1, label: '緊急' },
  { value: 2, label: '非緊急' },
] as const

const LEAK_INTENSITY_OPTIONS = [
  { value: '', label: '無' },
  { value: 'A.大漏', label: 'A.大漏' },
  { value: 'B.配管', label: 'B.配管' },
  { value: 'C.外線', label: 'C.外線' },
  { value: 'D.表箱', label: 'D.表箱' },
  { value: 'E.非漏水', label: 'E.非漏水' },
] as const

const DAY_NIGHT_OPTIONS = [
  { value: 1, label: '日間' },
  { value: 2, label: '夜間' },
  { value: 3, label: '按比例' },
] as const

const REPAIR_OPTIONS = [
  { value: 'self', label: '自修' },
  { value: 'outsource', label: '委外' },
  { value: 'warranty', label: '保固修理' },
  { value: 'other', label: '其他' },
] as const

const CASE_ATTR_OPTIONS = [
  { value: 1, label: '管線' },
  { value: 2, label: '附屬設備' },
  { value: 3, label: '表箱另件' },
  { value: 4, label: '其它' },
] as const

const PIPE_TYPE_OPTIONS = [
  { value: 1, label: '送配給水管(清水)' },
  { value: 2, label: '導水管(原水)' },
] as const

export function DispatchFormPage() {
  const { caseNo } = useParams<{ caseNo: string }>()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null)

  const [workers, setWorkers] = useState<WorkerOption[]>([])
  const [factories, setFactories] = useState<FactoryOption[]>([])
  const [leakReasons, setLeakReasons] = useState<LeakReason[]>([])
  const [pipeSpecs, setPipeSpecs] = useState<number[]>([])

  // ─── form state ───
  const [chargeType, setChargeType] = useState('none')
  const [chargeAmount, setChargeAmount] = useState(0)
  const [memoEnabled, setMemoEnabled] = useState(false)
  const [memoText, setMemoText] = useState('')
  const [assMan, setAssMan] = useState('')
  const [userEmergency, setUserEmergency] = useState(0)
  const [emergency, setEmergency] = useState<number | null>(null)  // 預設「無」
  const [leakIntensity, setLeakIntensity] = useState('')
  const [dayNight, setDayNight] = useState(1)
  const [dayNightRatio, setDayNightRatio] = useState('')
  const [isHoliday, setIsHoliday] = useState(false)
  const [assTime, setAssTime] = useState('')
  const [fixDeadline, setFixDeadline] = useState('')
  const [deadlineBasis, setDeadlineBasis] = useState('')
  const [repairType, setRepairType] = useState('self')
  const [factoryId, setFactoryId] = useState<string | null>(null)
  const [partialOutsource, setPartialOutsource] = useState(false)
  const [partialFactoryId, setPartialFactoryId] = useState<string | null>(null)
  const [warrantyOutsource, setWarrantyOutsource] = useState(false)
  const [warrantyFactoryId, setWarrantyFactoryId] = useState<string | null>(null)
  const [repairOtherDesc, setRepairOtherDesc] = useState('')
  const [leakConfirmType, setLeakConfirmType] = useState<string | null>('leak')  // 預設漏水案件
  const [leakConfirmDatetime, setLeakConfirmDatetime] = useState('')
  const [leakConfirmSituation, setLeakConfirmSituation] = useState('')
  const [nonLeakReasonId, setNonLeakReasonId] = useState<number | null>(null)
  const [nonLeakOtherDesc, setNonLeakOtherDesc] = useState('')
  const [workStartDatetime, setWorkStartDatetime] = useState('')
  const [caseAttribute, setCaseAttribute] = useState<number | null>(null)
  const [pipeSpec, setPipeSpec] = useState<number | null>(null)
  const [pipeType, setPipeType] = useState<number | null>(null)

  const deadlineTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ─── load data ───
  useEffect(() => {
    if (!caseNo) return

    setLoading(true)
    Promise.all([
      dispatchApi.fetchCaseDetail(caseNo),
      dispatchApi.fetchWorkers(caseNo),
      dispatchApi.fetchFactories(caseNo),
      dispatchApi.fetchLeakReasons(),
      dispatchApi.fetchPipeSpecs(),
    ]).then(([detailRes, workersRes, factoriesRes, reasonsRes, specsRes]) => {
      setLoading(false)

      if (!detailRes.success || !detailRes.data) {
        toast.error(detailRes.message ?? '載入案件失敗')
        return
      }

      const d = detailRes.data
      setCaseDetail(d)

      setChargeType(d.charge_type)
      setChargeAmount(d.charge_amount)
      setMemoEnabled(d.memo_enabled)
      setMemoText(d.memo_text ?? '')
      setAssMan(d.ass_man || d.current_user_name)
      setUserEmergency(d.user_emergency)
      setEmergency(d.emergency ?? null)
      setLeakIntensity(d.leak_intensity)
      setDayNight(d.day_night)
      setDayNightRatio(d.day_night_ratio ?? '')
      setIsHoliday(d.is_holiday)
      setAssTime(toLocalDatetime(d.ass_time))
      setFixDeadline(d.fix_deadline)
      setRepairType(d.repair_type)
      setFactoryId(d.factory_id)
      setPartialOutsource(d.partial_outsource)
      setPartialFactoryId(d.partial_factory_id)
      setWarrantyOutsource(d.warranty_outsource)
      setWarrantyFactoryId(d.warranty_factory_id)
      setRepairOtherDesc(d.repair_other_desc ?? '')
      setLeakConfirmType(d.leak_confirm_type ?? 'leak')
      setLeakConfirmDatetime(toLocalDatetime(d.leak_confirm_datetime))
      setLeakConfirmSituation(d.leak_confirm_situation ?? '')
      setNonLeakReasonId(d.non_leak_reason_id)
      setNonLeakOtherDesc(d.non_leak_other_desc ?? '')
      setWorkStartDatetime(toLocalDatetime(d.work_start_datetime))
      setCaseAttribute(d.case_attribute)
      setPipeSpec(d.pipe_spec)
      setPipeType(d.pipe_type)

      if (workersRes.success && workersRes.data) {
        setWorkers(workersRes.data.workers)
      }
      if (factoriesRes.success && factoriesRes.data) {
        setFactories(factoriesRes.data.factories)
      }
      if (reasonsRes.success && reasonsRes.data) {
        setLeakReasons(reasonsRes.data.reasons)
      }
      if (specsRes.success && specsRes.data) {
        setPipeSpecs(specsRes.data.pipe_specs)
      }
    })
  }, [caseNo])

  // ─── calculate deadline ───
  const triggerDeadlineCalc = useCallback(
    (
      attr: number | null,
      spec: number | null,
      emer: number | null,
      workStart: string,
    ) => {
      if (!caseNo || !caseDetail) return
      if (deadlineTimer.current) clearTimeout(deadlineTimer.current)

      deadlineTimer.current = setTimeout(async () => {
        const res = await dispatchApi.calculateDeadline(caseNo, {
          case_attribute: attr,
          pipe_spec: spec,
          emergency: emer,
          work_start_datetime: workStart || null,
          app_datetime: caseDetail.app_datetime,
        })
        if (res.success && res.data) {
          setFixDeadline(res.data.fix_deadline)
          setDeadlineBasis(res.data.calculation_basis)
        }
      }, 400)
    },
    [caseNo, caseDetail],
  )

  const handleCaseAttributeChange = (v: number | null) => {
    setCaseAttribute(v)
    if (v !== 1) {
      setPipeSpec(null)
      setPipeType(null)
    }
    triggerDeadlineCalc(v, v === 1 ? pipeSpec : null, emergency, workStartDatetime)
  }

  const handlePipeSpecChange = (v: number | null) => {
    setPipeSpec(v)
    triggerDeadlineCalc(caseAttribute, v, emergency, workStartDatetime)
  }

  const handleEmergencyChange = (v: number | null) => {
    setEmergency(v)
    triggerDeadlineCalc(caseAttribute, pipeSpec, v, workStartDatetime)
  }

  const handleWorkStartChange = (v: string) => {
    setWorkStartDatetime(v)
    triggerDeadlineCalc(caseAttribute, pipeSpec, emergency, v)
  }

  // ─── submit ───
  const handleSubmit = useCallback(async () => {
    if (!caseNo || !caseDetail?.can_edit) return

    if (!assMan.trim()) {
      toast.error('請選擇派工人員')
      return
    }
    if (!assTime) {
      toast.error('請填寫派工時間')
      return
    }
    if (repairType === 'outsource' && !factoryId) {
      toast.error('委外修理須選擇廠商')
      return
    }
    if (repairType === 'other' && !repairOtherDesc.trim()) {
      toast.error('修理對象為其他時須填寫說明')
      return
    }
    if (partialOutsource && !partialFactoryId) {
      toast.error('部份委外須選擇廠商')
      return
    }
    if (warrantyOutsource && !warrantyFactoryId) {
      toast.error('委外代修須選擇廠商')
      return
    }
    if (dayNight === 3 && !dayNightRatio.trim()) {
      toast.error('按比例須填寫日夜間比例')
      return
    }
    if (leakConfirmType === 'non_leak' && !nonLeakReasonId) {
      toast.error('非漏水案件須選擇原因')
      return
    }
    if (nonLeakReasonId === 5 && !nonLeakOtherDesc.trim()) {
      toast.error('非漏水原因為其它時須填寫說明')
      return
    }
    if (caseAttribute === 1 && !pipeSpec) {
      toast.error('案件屬性為管線時須選擇管徑')
      return
    }
    if (caseAttribute === 1 && !pipeType) {
      toast.error('案件屬性為管線時須選擇管線性質')
      return
    }

    setSubmitting(true)

    const payload: DispatchRequest = {
      charge_type: chargeType,
      charge_amount: chargeType === 'charge' ? chargeAmount : 0,
      memo_enabled: memoEnabled,
      memo_text: memoEnabled ? memoText : '',
      ass_man: assMan,
      user_emergency: userEmergency,
      emergency,
      leak_intensity: leakIntensity,
      day_night: dayNight,
      day_night_ratio: dayNight === 3 ? dayNightRatio : null,
      is_holiday: isHoliday,
      ass_time: assTime ? new Date(assTime).toISOString() : '',
      repair_type: repairType,
      factory_id: repairType === 'outsource' ? factoryId : null,
      partial_outsource: repairType === 'self' ? partialOutsource : false,
      partial_factory_id:
        repairType === 'self' && partialOutsource ? partialFactoryId : null,
      warranty_outsource: repairType === 'warranty' ? warrantyOutsource : false,
      warranty_factory_id:
        repairType === 'warranty' && warrantyOutsource
          ? warrantyFactoryId
          : null,
      repair_other_desc: repairType === 'other' ? repairOtherDesc : null,
      leak_confirm_type: leakConfirmType,
      leak_confirm_datetime: leakConfirmDatetime
        ? new Date(leakConfirmDatetime).toISOString()
        : null,
      leak_confirm_situation: leakConfirmSituation,
      non_leak_reason_id:
        leakConfirmType === 'non_leak' ? nonLeakReasonId : null,
      non_leak_other_desc:
        leakConfirmType === 'non_leak' && nonLeakReasonId === 5
          ? nonLeakOtherDesc
          : null,
      work_start_datetime: workStartDatetime
        ? new Date(workStartDatetime).toISOString()
        : null,
      case_attribute: caseAttribute,
      pipe_spec: caseAttribute === 1 ? pipeSpec : null,
      pipe_type: caseAttribute === 1 ? pipeType : null,
    }

    const res = await dispatchApi.submitDispatch(caseNo, payload)
    setSubmitting(false)

    if (res.success && res.data) {
      toast.success(res.data.message || '派工資料儲存成功')
      setFixDeadline(res.data.fix_deadline)
      navigate('/dispatch')
    } else {
      toast.error(res.message ?? '派工失敗')
    }
  }, [
    caseNo, caseDetail, assMan, assTime, repairType, factoryId,
    repairOtherDesc, partialOutsource, partialFactoryId,
    warrantyOutsource, warrantyFactoryId, dayNight, dayNightRatio,
    leakConfirmType, nonLeakReasonId, nonLeakOtherDesc,
    caseAttribute, pipeSpec, pipeType,
    chargeType, chargeAmount, memoEnabled, memoText,
    userEmergency, emergency, leakIntensity, isHoliday,
    leakConfirmDatetime, leakConfirmSituation, workStartDatetime,
    navigate,
  ])

  // ─── loading / error states ───
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#4BA2CE]" />
      </div>
    )
  }

  if (!caseDetail) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm text-gray-500">無法載入案件資料</p>
        <button
          type="button"
          onClick={() => navigate('/dispatch')}
          className="text-sm font-medium text-[#4BA2CE]"
        >
          返回列表
        </button>
      </div>
    )
  }

  const canEdit = caseDetail.can_edit
  const disabled = !canEdit

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#4BA2CE] to-[#1a6590] text-white shrink-0 shadow-md">
        <button
          type="button"
          onClick={() => navigate('/dispatch')}
          className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition active:scale-95"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-sm font-bold tracking-wide">修漏案件處理單</h1>
        {!canEdit && (
          <span className="ml-auto text-[10px] font-bold bg-amber-400/80 text-white px-2 py-0.5 rounded-full">
            僅供檢視
          </span>
        )}
      </div>

      {/* Form Body */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-lg mx-auto md:max-w-2xl lg:max-w-3xl px-4 py-4 space-y-4">
          {/* §A — 案件基本資訊 */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <SectionHeader title="案件基本資訊" />
            <div className="px-4 py-4 flex flex-col gap-3">
              {/* 案號 & 狀態 & 來源 */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-[#4BA2CE]" />
                  <span className="text-[15px] font-bold text-[#2c3e50] tracking-wide">{caseDetail.case_no}</span>
                </div>
                {caseDetail.case_source && (
                  <span className="inline-flex items-center gap-1.5 bg-[#eef8fc] text-[#2e86b0] text-[11px] font-semibold px-2 py-0.5 rounded border border-[#c8e8f5]">
                    <Tag size={10} className="shrink-0" />
                    {caseDetail.case_source}
                  </span>
                )}
              </div>

              {/* 兩欄資訊：受理時間、報修人 */}
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-gray-50">
                <div>
                  <p className="text-[11px] text-gray-400 mb-1">受理時間</p>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                    <Calendar size={14} className="text-gray-400" />
                    {formatReadableDate(caseDetail.app_datetime)}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 mb-1">報修人</p>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                    <Phone size={14} className="text-gray-400" />
                    {`${caseDetail.reporter_name ?? ''}${caseDetail.reporter_tel ? `  電話: ${caseDetail.reporter_tel}` : ''}` || '無'}
                  </div>
                </div>
              </div>

              {/* 水號與報修位置 */}
              <div className="flex flex-col gap-3 pb-3 border-b border-gray-50">
                {caseDetail.water_no && (
                  <div className="flex items-start gap-2 text-sm text-gray-700">
                    <Droplets size={15} className="text-[#4BA2CE] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] text-gray-400 block mb-0.5">水號</span>
                      <span className="font-medium tracking-wide">{caseDetail.water_no}</span>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <MapPin size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] text-gray-400 block mb-0.5">報修位置</span>
                    <span className="font-medium leading-snug">{caseDetail.location || '-'}</span>
                  </div>
                </div>
              </div>

              {/* 報修內容 */}
              <div>
                <p className="text-[11px] text-gray-400 mb-1.5 flex items-center gap-1">
                  <FileText size={12} />
                  報修內容
                </p>
                <div className="rounded-lg bg-gray-50 px-3 py-2.5 text-sm text-gray-700 leading-relaxed border border-gray-100">
                  {caseDetail.app_content || '-'}
                </div>
              </div>
            </div>
          </section>

          {/* §B — 派工填寫區域 */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <SectionHeader title="派工填寫" />
            <div className="px-4 py-4 space-y-4">

            {/* 收費 */}
            <div className="mb-4">
              <label className={LABEL}>收費</label>
              <div className="flex flex-wrap gap-2">
                {CHARGE_OPTIONS.map((o) => (
                  <label key={o.value} className={RADIO_LABEL}>
                    <input
                      type="radio"
                      name="charge"
                      checked={chargeType === o.value}
                      onChange={() => setChargeType(o.value)}
                      disabled={disabled}
                      className={RADIO}
                    />
                    <span className={RADIO_TEXT}>{o.label}</span>
                  </label>
                ))}
              </div>
              {chargeType === 'charge' && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    value={chargeAmount}
                    onChange={(e) => setChargeAmount(Number(e.target.value))}
                    min={0}
                    max={10000000}
                    disabled={disabled}
                    className={`${INPUT} w-32`}
                  />
                  <span className="text-xs text-gray-500">元</span>
                </div>
              )}
            </div>

            {/* 派工人員 */}
            <div className="mb-4">
              <label className={LABEL}>派工人員</label>
              <div className={SELECT_WRAP}>
                <select
                  value={assMan}
                  onChange={(e) => setAssMan(e.target.value)}
                  disabled={disabled}
                  className={SELECT}
                >
                  {workers.length === 0 && (
                    <option value={assMan}>{assMan || '(無人員資料)'}</option>
                  )}
                  {workers.map((w) => (
                    <option key={w.name} value={w.name}>
                      {w.name}
                      {w.is_current_user ? '（自己）' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            {/* 用戶緊急性 */}
            <div className="mb-4">
              <label className={LABEL}>用戶緊急性</label>
              <div className="flex flex-wrap gap-2">
                {USER_EMERGENCY_OPTIONS.map((o) => (
                  <label key={o.value} className={RADIO_LABEL}>
                    <input
                      type="radio"
                      name="userEmergency"
                      checked={userEmergency === o.value}
                      onChange={() => setUserEmergency(o.value)}
                      disabled={disabled}
                      className={RADIO}
                    />
                    <span className={RADIO_TEXT}>{o.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 案件緊急性 */}
            <div className="mb-4">
              <label className={LABEL}>案件緊急性</label>
              <div className="flex flex-wrap gap-2">
                {EMERGENCY_OPTIONS.map((o) => (
                  <label key={String(o.value)} className={RADIO_LABEL}>
                    <input
                      type="radio"
                      name="emergency"
                      checked={emergency === o.value}
                      onChange={() => handleEmergencyChange(o.value)}
                      disabled={disabled}
                      className={RADIO}
                    />
                    <span className={RADIO_TEXT}>{o.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 檢出漏水強度 */}
            <div className="mb-4">
              <label className={LABEL}>檢出漏水強度</label>
              <div className="flex flex-wrap gap-2">
                {LEAK_INTENSITY_OPTIONS.map((o) => (
                  <label key={o.value || '__none'} className={RADIO_LABEL}>
                    <input
                      type="radio"
                      name="leakIntensity"
                      checked={leakIntensity === o.value}
                      onChange={() => setLeakIntensity(o.value)}
                      disabled={disabled}
                      className={RADIO}
                    />
                    <span className={RADIO_TEXT}>{o.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 假日/日夜間 */}
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={CHECKBOX_LABEL}>
                  <input
                    type="checkbox"
                    checked={isHoliday}
                    onChange={(e) => setIsHoliday(e.target.checked)}
                    disabled={disabled}
                    className={CHECKBOX}
                  />
                  <div className={CHECKBOX_BOX}>
                    <svg className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className={CHECKBOX_TEXT}>
                    假日案件
                  </span>
                </label>
              </div>
              <div>
                <label className={LABEL}>日夜間</label>
                <div className="flex flex-wrap gap-2">
                  {DAY_NIGHT_OPTIONS.map((o) => (
                    <label key={o.value} className={RADIO_LABEL}>
                      <input
                        type="radio"
                        name="dayNight"
                        checked={dayNight === o.value}
                        onChange={() => setDayNight(o.value)}
                        disabled={disabled}
                        className={RADIO}
                      />
                      <span className={RADIO_TEXT}>{o.label}</span>
                    </label>
                  ))}
                </div>
                {dayNight === 3 && (
                  <input
                    type="text"
                    value={dayNightRatio}
                    onChange={(e) => setDayNightRatio(e.target.value)}
                    placeholder="例: 4/8"
                    disabled={disabled}
                    className={`${INPUT} mt-2 w-24`}
                  />
                )}
              </div>
            </div>

            {/* 派工時間 / 修復期限 */}
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={LABEL}>派工時間</label>
                <DatetimeInput
                  value={assTime}
                  onChange={setAssTime}
                  disabled={disabled}
                  className={INPUT}
                />
              </div>
              <div>
                <label className={LABEL}>修復期限</label>
                <div className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-[#2c3e50]">
                  {formatFixDeadline(fixDeadline)}
                </div>
                {deadlineBasis && (
                  <p className="mt-1 text-[10px] text-gray-400">{deadlineBasis}</p>
                )}
              </div>
            </div>

            {/* 修理對象 */}
            <div className="mb-4">
              <label className={LABEL}>修理對象</label>
              <div className="flex flex-wrap gap-2">
                {REPAIR_OPTIONS.map((o) => (
                  <label key={o.value} className={RADIO_LABEL}>
                    <input
                      type="radio"
                      name="repairType"
                      checked={repairType === o.value}
                      onChange={() => {
                        setRepairType(o.value)
                        if (o.value !== 'self') setPartialOutsource(false)
                        if (o.value !== 'warranty') setWarrantyOutsource(false)
                      }}
                      disabled={disabled}
                      className={RADIO}
                    />
                    <span className={RADIO_TEXT}>{o.label}</span>
                  </label>
                ))}
              </div>

              {/* 修理對象的附加選項區塊 */}
              {repairType === 'self' && (
                <div className="mt-3 p-3 rounded-lg border border-gray-100 bg-white shadow-sm flex flex-col gap-2">
                  <label className={CHECKBOX_LABEL}>
                    <input
                      type="checkbox"
                      checked={partialOutsource}
                      onChange={(e) => setPartialOutsource(e.target.checked)}
                      disabled={disabled}
                      className={CHECKBOX}
                    />
                    <div className={CHECKBOX_BOX}>
                      <svg className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className={CHECKBOX_TEXT}>部份委外</span>
                  </label>
                  {partialOutsource && (
                    <FactorySelect
                      value={partialFactoryId}
                      onChange={setPartialFactoryId}
                      factories={factories}
                      disabled={disabled}
                    />
                  )}
                </div>
              )}

              {repairType === 'outsource' && (
                <div className="mt-3 p-3 rounded-lg border border-gray-100 bg-white shadow-sm">
                  <FactorySelect
                    value={factoryId}
                    onChange={setFactoryId}
                    factories={factories}
                    disabled={disabled}
                  />
                </div>
              )}

              {repairType === 'warranty' && (
                <div className="mt-3 p-3 rounded-lg border border-gray-100 bg-white shadow-sm flex flex-col gap-2">
                  <label className={CHECKBOX_LABEL}>
                    <input
                      type="checkbox"
                      checked={warrantyOutsource}
                      onChange={(e) => setWarrantyOutsource(e.target.checked)}
                      disabled={disabled}
                      className={CHECKBOX}
                    />
                    <div className={CHECKBOX_BOX}>
                      <svg className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className={CHECKBOX_TEXT}>委外代修</span>
                  </label>
                  {warrantyOutsource && (
                    <FactorySelect
                      value={warrantyFactoryId}
                      onChange={setWarrantyFactoryId}
                      factories={factories}
                      disabled={disabled}
                    />
                  )}
                </div>
              )}

              {repairType === 'other' && (
                <div className="mt-3 p-3 rounded-lg border border-gray-100 bg-white shadow-sm">
                  <input
                    type="text"
                    value={repairOtherDesc}
                    onChange={(e) => setRepairOtherDesc(e.target.value)}
                    placeholder="請填寫說明"
                    disabled={disabled}
                    className={INPUT}
                  />
                </div>
              )}
            </div>
            </div>{/* end px-4 py-4 */}
          </section>


          {/* §C — 確認漏水點 */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <SectionHeader title="確認漏水點" />
            <div className="px-4 py-4 space-y-3">
              {/* 漏水/非漏水 大型切換按鈕 */}
              <div className="grid grid-cols-2 gap-3">
                {([{val: 'leak', label: '漏水案件', active: 'border-blue-500 bg-blue-50 text-blue-700'},{val: 'non_leak', label: '非漏水案件', active: 'border-orange-400 bg-orange-50 text-orange-700'}] as const).map((opt) => (
                  <button key={opt.val} type="button" disabled={disabled}
                    onClick={() => setLeakConfirmType(opt.val)}
                    className={`flex items-center justify-center gap-2 h-12 rounded-xl border-2 font-bold text-sm transition ${
                      leakConfirmType === opt.val ? opt.active : 'border-gray-200 text-gray-500 bg-white'
                    }`}>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      leakConfirmType === opt.val ? 'border-current' : 'border-gray-300'
                    }`}>
                      {leakConfirmType === opt.val && <div className="w-2 h-2 rounded-full bg-current" />}
                    </div>
                    {opt.label}
                  </button>
                ))}
              </div>


              {leakConfirmType === 'non_leak' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL}>非漏水原因</label>
                    <div className={SELECT_WRAP}>
                      <select
                        value={nonLeakReasonId ?? ''}
                        onChange={(e) =>
                          setNonLeakReasonId(
                            e.target.value ? Number(e.target.value) : null,
                          )
                        }
                        disabled={disabled}
                        className={SELECT}
                      >
                        <option value="">--請選擇--</option>
                        {leakReasons.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.description}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                    </div>
                  </div>
                  {nonLeakReasonId === 5 && (
                    <div>
                      <label className={LABEL}>其他說明</label>
                      <input
                        type="text"
                        value={nonLeakOtherDesc}
                        onChange={(e) => setNonLeakOtherDesc(e.target.value)}
                        disabled={disabled}
                        placeholder="請填寫原因"
                        className={INPUT}
                      />
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className={LABEL}>日期時間</label>
                <DatetimeInput
                  value={leakConfirmDatetime}
                  onChange={setLeakConfirmDatetime}
                  disabled={disabled}
                  className={INPUT}
                />
              </div>

              <div>
                <label className={LABEL}>處理情形</label>
                <textarea
                  value={leakConfirmSituation}
                  onChange={(e) => setLeakConfirmSituation(e.target.value)}
                  maxLength={100}
                  rows={2}
                  disabled={disabled}
                  placeholder="請填寫處理情形"
                  className={`${INPUT} resize-none`}
                />
              </div>
            </div>
          </section>

          {/* §D — 開工日期及案件屬性 */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <SectionHeader title="開工日期及案件屬性" />
            <div className="px-4 py-4 space-y-3">
              <div>
                <label className={LABEL}>開工時間</label>
                <DatetimeInput
                  value={workStartDatetime}
                  onChange={handleWorkStartChange}
                  disabled={disabled}
                  className={INPUT}
                />
              </div>

              <div>
                <label className={LABEL}>案件屬性</label>
                <div className="flex flex-wrap gap-2">
                  {CASE_ATTR_OPTIONS.map((o) => (
                    <label key={o.value} className={RADIO_LABEL}>
                      <input
                        type="radio"
                        name="caseAttr"
                        checked={caseAttribute === o.value}
                        onChange={() => handleCaseAttributeChange(o.value)}
                        disabled={disabled}
                        className={RADIO}
                      />
                      <span className={RADIO_TEXT}>{o.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {caseAttribute === 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL}>管徑 (mm)</label>
                    <div className={SELECT_WRAP}>
                      <select
                        value={pipeSpec ?? ''}
                        onChange={(e) =>
                          handlePipeSpecChange(
                            e.target.value ? Number(e.target.value) : null,
                          )
                        }
                        disabled={disabled}
                        className={SELECT}
                      >
                        <option value="">--請選擇--</option>
                        {pipeSpecs.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={LABEL}>管線性質</label>
                    <div className="flex flex-wrap gap-2">
                      {PIPE_TYPE_OPTIONS.map((o) => (
                        <label key={o.value} className={RADIO_LABEL}>
                          <input
                            type="radio"
                            name="pipeType"
                            checked={pipeType === o.value}
                            onChange={() => setPipeType(o.value)}
                            disabled={disabled}
                            className={RADIO}
                          />
                          <span className={RADIO_TEXT}>{o.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>


          {/* §E — 操作按鈕 */}
          <section className="pb-6">
            <div className="flex gap-3">
              {canEdit && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#51bbed] to-[#3498c9] text-sm font-bold tracking-wider text-white shadow-md shadow-[#3498c9]/20 transition hover:from-[#49aad6] hover:to-[#2e86b0] active:scale-[0.98] disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  {submitting ? '送出中...' : '確 定'}
                </button>
              )}
              <button
                type="button"
                onClick={() => navigate('/dispatch')}
                className="flex h-11 flex-1 items-center justify-center rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-600 tracking-wider transition hover:bg-gray-50 active:scale-[0.98]"
              >
                返回列表
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}



function FactorySelect({
  value,
  onChange,
  factories,
  disabled,
}: {
  value: string | null
  onChange: (v: string | null) => void
  factories: FactoryOption[]
  disabled: boolean
}) {
  return (
    <div className="mt-1.5">
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={disabled}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#4BA2CE] focus:ring-1 focus:ring-[#4BA2CE]/30"
      >
        <option value="">--請選擇廠商--</option>
        {factories.map((f) => (
          <option key={f.fact_id} value={f.fact_id}>
            {f.fact_name}
          </option>
        ))}
      </select>
    </div>
  )
}
