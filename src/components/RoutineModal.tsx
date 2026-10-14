import { useState } from 'react'
import { Lightbulb } from 'lucide-react'
import Modal from './Modal'
import { ChipGroup, Field, ModalFooter, inputClass } from './form'
import { createRoutine, updateRoutine, type RoutineInput } from '../repo'
import type { Category, Recurrence, Routine, TimeMode } from '../types'

interface Props {
  routine?: Routine
  onClose: () => void
}

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'morning', label: '晨间' },
  { value: 'workout', label: '运动' },
  { value: 'work', label: '工作' },
  { value: 'evening', label: '晚间' },
  { value: 'sleep', label: '睡前' },
  { value: 'anytime', label: '随时' },
]

const RECURRENCES: { value: Recurrence; label: string }[] = [
  { value: 'daily', label: '每日' },
  { value: 'weekdays', label: '工作日' },
  { value: 'weekly', label: '每周' },
  { value: 'custom', label: '自定义' },
]

export default function RoutineModal({ routine, onClose }: Props) {
  const editing = Boolean(routine)
  const [title, setTitle] = useState(routine?.title ?? '')
  const [timeMode, setTimeMode] = useState<TimeMode>(routine?.timeMode ?? 'flexible')
  const [category, setCategory] = useState<Category>(routine?.category ?? 'morning')
  const [recurrence, setRecurrence] = useState<Recurrence>(routine?.recurrence ?? 'daily')
  const [scheduledTime, setScheduledTime] = useState(routine?.scheduledTime ?? '07:30')
  const [dueByTime, setDueByTime] = useState(routine?.dueByTime ?? '22:00')
  const [duration, setDuration] = useState(routine?.duration ?? 30)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    const trimmed = title.trim()
    if (!trimmed || saving) return
    setSaving(true)
    const input: RoutineInput = {
      title: trimmed,
      category,
      timeMode,
      recurrence,
      scheduledTime: timeMode === 'anchored' ? scheduledTime : undefined,
      dueByTime: timeMode === 'flexible' ? dueByTime : undefined,
      duration,
    }
    if (editing && routine) await updateRoutine(routine.id, input)
    else await createRoutine(input)
    onClose()
  }

  return (
    <Modal
      subtitle={editing ? '编辑 routine' : '新建 routine'}
      title={editing ? '修改固定任务' : '添加固定任务'}
      onClose={onClose}
      footer={
        <ModalFooter
          onCancel={onClose}
          onSave={handleSave}
          saveLabel={editing ? '保存修改' : '保存 routine'}
          disabled={!title.trim() || saving}
        />
      }
    >
      {/* 模式切换 */}
      <div className="flex bg-cream rounded-soft p-1">
        {(
          [
            { value: 'anchored', label: '⏰ 锚定时间' },
            { value: 'flexible', label: '☁️ 当天完成' },
          ] as { value: TimeMode; label: string }[]
        ).map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setTimeMode(m.value)}
            className={`flex-1 py-2 px-3 rounded-soft text-xs transition-all ${
              timeMode === m.value ? 'bg-sakura text-ash font-medium' : 'text-ash-light'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="bg-cream border-l-2 border-sakura rounded p-3 flex gap-2">
        <Lightbulb size={14} strokeWidth={1.5} className="text-rose-urgent flex-shrink-0 mt-0.5" />
        <div className="text-[11px] text-ash leading-relaxed">
          <strong className="font-medium">上班族建议：</strong>
          选「☁️ 当天完成」更轻松，精力好就做、累了也不焦虑
        </div>
      </div>

      <Field label="标题">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
          }}
          placeholder="例：晨跑 30min"
          className={inputClass}
        />
      </Field>

      <Field label="分类">
        <ChipGroup options={CATEGORIES} value={category} onChange={setCategory} />
      </Field>

      <Field label="重复">
        <ChipGroup options={RECURRENCES} value={recurrence} onChange={setRecurrence} />
      </Field>

      {timeMode === 'anchored' ? (
        <Field label="提醒时间">
          <div className="flex gap-2">
            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className={`${inputClass} flex-1`}
            />
            <DurationInput value={duration} onChange={setDuration} />
          </div>
        </Field>
      ) : (
        <Field label="最晚完成时间" hint="可选">
          <div className="flex gap-2">
            <input
              type="time"
              value={dueByTime}
              onChange={(e) => setDueByTime(e.target.value)}
              className={`${inputClass} flex-1`}
            />
            <DurationInput value={duration} onChange={setDuration} />
          </div>
        </Field>
      )}
    </Modal>
  )
}

function DurationInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1 bg-cream border border-beige/60 rounded-soft px-3 py-2">
      <input
        type="number"
        min={1}
        value={value}
        onChange={(e) => onChange(Math.max(1, Number(e.target.value) || 1))}
        className="w-12 bg-transparent text-sm text-ash focus:outline-none"
      />
      <span className="text-xs text-ash-light">分</span>
    </div>
  )
}
