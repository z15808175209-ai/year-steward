import type { ReactNode } from 'react'

export const inputClass =
  'w-full bg-cream border border-beige/60 rounded-soft px-3 py-2 text-sm text-ash placeholder:text-ash-light focus:outline-none focus:border-sakura transition-colors'

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-1.5">
        <span className="text-[10px] tracking-[1.5px] text-ash-light">{label}</span>
        {hint && <span className="text-[10px] text-ash-light/70">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

export function ChipGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 rounded-pill text-[11px] transition-all ${
            value === o.value
              ? 'bg-sakura text-ash'
              : 'bg-cream text-ash-light border border-beige/40 hover:border-ash-light'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function ModalFooter({
  onCancel,
  onSave,
  saveLabel = '保存',
  disabled = false,
}: {
  onCancel: () => void
  onSave: () => void
  saveLabel?: string
  disabled?: boolean
}) {
  return (
    <>
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 py-2.5 text-sm text-ash-light hover:text-ash transition-colors"
      >
        取消
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={disabled}
        className="flex-1 py-2.5 bg-sakura text-ash text-sm font-medium rounded-soft hover:bg-sakura/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {saveLabel}
      </button>
    </>
  )
}
