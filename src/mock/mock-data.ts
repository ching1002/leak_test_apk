import type { AreaOption, UserInfo } from '../types/auth'
import type { CaseDetail, FactoryOption, LeakReason, WorkerOption } from '../types/dispatch'
import type { CaseItem, DistrictOption, StationOption } from '../types/assign'
import type { CountyOption, ReportCaseItem } from '../types/report'

export const mockSource = {
  capturedFrom: 'publish/leak_Internal /internal/auth/areas',
  capturedAt: '2026-05-15T11:17:00+08:00',
  note: 'Only non-sensitive lookup values are stored here. Connection strings and server settings were intentionally excluded.',
}

export const areas: AreaOption[] = [
  { area_id: '0', name: '總處' },
  { area_id: '1', name: '一區處' },
  { area_id: '2', name: '二區處' },
  { area_id: '3', name: '三區處' },
  { area_id: '4', name: '四區處' },
  { area_id: '5', name: '五區處' },
  { area_id: '6', name: '六區處' },
  { area_id: '7', name: '七區處' },
  { area_id: '8', name: '八區處' },
  { area_id: '9', name: '九區處' },
  { area_id: 'A', name: '十區處' },
  { area_id: 'B', name: '十一區處' },
  { area_id: 'C', name: '十二區處' },
  { area_id: 'D', name: '十三區處(屏東)' },
  { area_id: 'E', name: '台南廠' },
]

export const districts: DistrictOption[] = areas
  .filter((area) => area.area_id !== '0' && area.area_id !== 'E')
  .map((area, index) => ({
    area_no: area.area_id,
    area_id: index + 1,
    name: area.name,
  }))

export const stationsByArea: Record<string, StationOption[]> = {
  '1': [
    { fac_id: 'ALL', fac_name: '全部站所' },
    { fac_id: '11', fac_name: '基隆服務所' },
    { fac_id: '12', fac_name: '淡水服務所' },
    { fac_id: '1B', fac_name: '汐止服務所' },
  ],
  '2': [
    { fac_id: 'ALL', fac_name: '全部站所' },
    { fac_id: '21', fac_name: '桃園服務所' },
    { fac_id: '22', fac_name: '中壢服務所' },
  ],
  '6': [
    { fac_id: 'ALL', fac_name: '全部站所' },
    { fac_id: '61', fac_name: '台南服務所' },
    { fac_id: '62', fac_name: '新營服務所' },
  ],
  D: [
    { fac_id: 'ALL', fac_name: '全部站所' },
    { fac_id: 'D1', fac_name: '屏東服務所' },
    { fac_id: 'D2', fac_name: '潮州服務所' },
  ],
}

export const mockUsers: Record<string, UserInfo> = {
  hq: {
    user_id: 'mock-hq',
    name: '總處測試員',
    tenant_id: '0',
    station_id: 'ALL',
    area_name: '總處',
    station_name: '全部站所',
    role: 'headquarters',
  },
  district: {
    user_id: 'mock-district',
    name: '區處測試員',
    tenant_id: '1',
    station_id: 'ALL',
    area_name: '一區處',
    station_name: '全部站所',
    role: 'district',
  },
  station: {
    user_id: 'mock-station',
    name: '站所測試員',
    tenant_id: '1',
    station_id: '1B',
    area_name: '一區處',
    station_name: '汐止服務所',
    role: 'station',
  },
}

export const cases: CaseItem[] = [
  {
    case_no: '1B11500693',
    case_source: '客服中心-CSC202604001',
    app_datetime: '2026-04-29T13:52:00+08:00',
    water_no: 'A123456789',
    app_content: '住戶反映路面持續滲水，夜間水量增加。',
    location: '新北市汐止區中興路100號前',
    status_text: '未派工',
  },
  {
    case_no: '1B11500694',
    case_source: '1999通報-TP202604029',
    app_datetime: '2026-04-29T15:10:00+08:00',
    water_no: 'B987654321',
    app_content: '人孔蓋周邊冒水，疑似管線破裂。',
    location: '新北市汐止區大同路二段88巷口',
    status_text: '未確認漏水',
  },
  {
    case_no: '1111500695',
    case_source: '服務所通報-ST202604030',
    app_datetime: '2026-04-30T09:18:00+08:00',
    water_no: '',
    app_content: '巡查發現道路側溝清水流出。',
    location: '基隆市仁愛區仁一路200號',
    status_text: '未開工',
  },
  {
    case_no: '6111500696',
    case_source: '民眾報修-MB202605001',
    app_datetime: '2026-05-01T08:45:00+08:00',
    water_no: 'C246801357',
    app_content: '水表箱內積水，已先行設置警示。',
    location: '台南市東區崇明路66號',
    status_text: '未回報',
  },
  {
    case_no: 'D111500697',
    case_source: '消防局通報-FH202605002',
    app_datetime: '2026-05-02T22:20:00+08:00',
    water_no: '',
    app_content: '路口大量出水，影響車道通行。',
    location: '屏東縣潮州鎮延平路與中山路口',
    status_text: '已完成',
  },
]

export const caseDetails: Record<string, CaseDetail> = Object.fromEntries(
  cases.map((item, index) => [
    item.case_no,
    {
      case_no: item.case_no,
      case_source: item.case_source,
      location: item.location,
      water_no: item.water_no,
      app_content: item.app_content,
      reporter_name: ['王先生', '林小姐', '巡查人員', '陳先生', '消防勤務中心'][index],
      reporter_tel: ['0912345678', '0226980000', '', '0987654321', '119'][index],
      app_datetime: item.app_datetime,
      charge_type: 'none',
      charge_amount: 0,
      memo_enabled: false,
      memo_text: '',
      ass_man: '站所測試員',
      current_user_name: '站所測試員',
      user_emergency: index === 4 ? 2 : 1,
      emergency: index === 4 ? 1 : null,
      leak_intensity: index === 4 ? 'A.大漏' : 'B.中漏',
      day_night: index === 4 ? 2 : 1,
      day_night_ratio: null,
      is_holiday: false,
      ass_time: item.status_text === '未派工' ? null : '2026-05-15T09:00:00+08:00',
      fix_deadline: '2026/5/16 09:00',
      repair_type: 'self',
      factory_id: null,
      partial_factory_id: null,
      partial_outsource: false,
      warranty_outsource: false,
      warranty_factory_id: null,
      repair_other_desc: null,
      leak_confirm_enabled: true,
      leak_confirm_type: null,
      leak_confirm_datetime: null,
      leak_confirm_situation: '',
      non_leak_reason_id: null,
      non_leak_other_desc: null,
      work_start_enabled: true,
      work_start_datetime: null,
      case_attribute: null,
      pipe_spec: null,
      pipe_type: null,
      can_edit: true,
    },
  ]),
)

export const workers: WorkerOption[] = [
  { name: '站所測試員', is_current_user: true },
  { name: '李維修', is_current_user: false },
  { name: '張技士', is_current_user: false },
]

export const factories: FactoryOption[] = [
  { fact_id: 'F001', fact_name: '清泉工程有限公司', is_shared: false },
  { fact_id: 'F002', fact_name: '安流水電工程行', is_shared: true },
  { fact_id: 'F003', fact_name: '宏達管線修繕股份有限公司', is_shared: false },
]

export const leakReasons: LeakReason[] = [
  { id: 2, description: '用戶設備漏水' },
  { id: 3, description: '消防栓排水' },
  { id: 4, description: '地下水或排水溝水' },
  { id: 5, description: '其他' },
]

export const pipeSpecs = [25, 50, 75, 100, 150, 200, 300, 450, 500, 600, 800, 1000, 1500]

export const locationOptions: CountyOption[] = [
  {
    county_id: '65000',
    county_name: '新北市',
    towns: [
      { town_id: '65000110', town_name: '汐止區' },
      { town_id: '65000120', town_name: '淡水區' },
    ],
  },
  {
    county_id: '10017',
    county_name: '基隆市',
    towns: [
      { town_id: '10017010', town_name: '仁愛區' },
      { town_id: '10017020', town_name: '中正區' },
    ],
  },
  {
    county_id: '67000',
    county_name: '台南市',
    towns: [
      { town_id: '67000320', town_name: '東區' },
      { town_id: '67000330', town_name: '新營區' },
    ],
  },
]

export const reportCases: ReportCaseItem[] = cases.map((item) => ({
  case_no: item.case_no,
  app_datetime: item.app_datetime,
  water_no: item.water_no,
  app_content: item.app_content,
  reporter_name: caseDetails[item.case_no].reporter_name,
  reporter_tel: caseDetails[item.case_no].reporter_tel,
  case_source: item.case_source,
  ass_man: caseDetails[item.case_no].ass_man,
  location: item.location,
}))
