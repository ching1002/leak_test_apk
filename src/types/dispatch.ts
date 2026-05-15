export interface CaseDetail {
  case_no: string
  case_source: string
  location: string
  water_no: string
  app_content: string
  reporter_name: string
  reporter_tel: string
  app_datetime: string

  charge_type: string
  charge_amount: number

  memo_enabled: boolean
  memo_text: string

  ass_man: string
  current_user_name: string

  user_emergency: number
  emergency: number | null
  leak_intensity: string

  day_night: number
  day_night_ratio: string | null
  is_holiday: boolean

  ass_time: string | null
  fix_deadline: string

  repair_type: string
  factory_id: string | null
  partial_factory_id: string | null
  partial_outsource: boolean
  warranty_outsource: boolean
  warranty_factory_id: string | null
  repair_other_desc: string | null

  leak_confirm_enabled: boolean
  leak_confirm_type: string | null
  leak_confirm_datetime: string | null
  leak_confirm_situation: string
  non_leak_reason_id: number | null
  non_leak_other_desc: string | null

  work_start_enabled: boolean
  work_start_datetime: string | null
  case_attribute: number | null
  pipe_spec: number | null
  pipe_type: number | null

  can_edit: boolean
}

export interface WorkerOption {
  name: string
  is_current_user: boolean
}

export interface FactoryOption {
  fact_id: string
  fact_name: string
  is_shared: boolean
}

export interface LeakReason {
  id: number
  description: string
}

export interface DeadlineResult {
  fix_deadline: string
  calculation_basis: string
}

export interface DispatchRequest {
  charge_type: string
  charge_amount: number
  memo_enabled: boolean
  memo_text: string
  ass_man: string
  user_emergency: number
  emergency: number | null
  leak_intensity: string
  day_night: number
  day_night_ratio: string | null
  is_holiday: boolean
  ass_time: string
  repair_type: string
  factory_id: string | null
  partial_outsource: boolean
  partial_factory_id: string | null
  warranty_outsource: boolean
  warranty_factory_id: string | null
  repair_other_desc: string | null
  leak_confirm_type: string | null
  leak_confirm_datetime: string | null
  leak_confirm_situation: string
  non_leak_reason_id: number | null
  non_leak_other_desc: string | null
  work_start_datetime: string | null
  case_attribute: number | null
  pipe_spec: number | null
  pipe_type: number | null
}

export interface DispatchResult {
  message: string
  fix_deadline: string
}
