import { useRef } from 'react'

const pad = (n: number) => String(n).padStart(2, '0')

function formatDisplay(val: string): string {
  if (!val) return ''
  const d = new Date(val)
  if (!isNaN(d.getTime())) {
    return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }
  const m = val.match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})\D+(\d{1,2})\D+(\d{1,2})/)
  if (m) {
    return `${m[1]}/${m[2].padStart(2, '0')}/${m[3].padStart(2, '0')} ${m[4].padStart(2, '0')}:${m[5].padStart(2, '0')}`
  }
  return val
}

export function normalizeDatetimeLocal(val: string): string {
  if (!val) return ''
  const d = new Date(val)
  if (!isNaN(d.getTime())) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }
  const m = val.match(/^(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{1,2})/)
  if (m) {
    return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}T${m[4].padStart(2, '0')}:${m[5].padStart(2, '0')}`
  }
  return val
}

interface DatetimeInputProps {
  value: string
  onChange: (val: string) => void
  disabled?: boolean
  className?: string
}

export function DatetimeInput({ value, onChange, disabled, className }: DatetimeInputProps) {
  const hiddenRef = useRef<HTMLInputElement>(null)

  const handleTap = () => {
    if (!disabled && hiddenRef.current) {
      hiddenRef.current.showPicker?.()
      hiddenRef.current.focus()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(normalizeDatetimeLocal(e.target.value))
  }

  return (
    <div className="relative">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={handleTap}
        onKeyDown={(e) => e.key === 'Enter' && handleTap()}
        className={`${className ?? ''} ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {formatDisplay(value) || <span className="text-gray-400">請選擇日期時間</span>}
      </div>
      <input
        ref={hiddenRef}
        type="datetime-local"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  )
}
