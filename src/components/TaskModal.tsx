import { useState } from 'react'
import { Pin } from 'lucide-react'
import Modal from './Modal'
import { ChipGroup, Field, ModalFooter, inputClass } from './form'
import { createTask, updateTask, type TaskInput } from '../repo'
import type { Priority, Task } from '../types'
import { todayISO } from '../lib/date'

interface Props {
  task?: Task
  onClose: () => void
}

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: 'P0', label: '🔴 高 · 重要紧急' },
  { value: 'P1', label: '🟡 中 · 重要不紧急' },
  { value: 'P2', label: '⚪ 低 · 一般事项' },
]

export default function TaskModal({ task, onClose }: Props) {
  const editing = Boolean(task)
  const [title, setTitle] = useState(task?.title ?? '')
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'P1')
  const [dueDate, setDueDate] = useState(task?.dueDate ?? '')
  const [pinned, setPinned] = useState(task?.pinned ?? false)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    const trimmed = title.trim()
    if (!trimmed || saving) return
    setSaving(true)
    const input: TaskInput = {
      title: trimmed,
      priority,
      dueDate: dueDate || undefined,
      pinned,
    }
    if (editing && task) await updateTask(task.id, input)
    else await createTask(input)
    onClose()
  }

  return (
    <Modal
      subtitle={editing ? '编辑任务' : '新建任务'}
      title={editing ? '修改这条任务' : '记下一件要做的事'}
      onClose={onClose}
      footer={
        <ModalFooter
          onCancel={onClose}
          onSave={handleSave}
          saveLabel={editing ? '保存修改' : '添加任务'}
          disabled={!title.trim() || saving}
        />
      }
    >
      <Field label="任务标题">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
          }}
          placeholder="例：给妈妈订生日蛋糕"
          className={inputClass}
        />
      </Field>

      <Field label="优先级">
        <ChipGroup options={PRIORITIES} value={priority} onChange={setPriority} />
      </Field>

      <Field label="截止日期" hint="可留空">
        <div className="flex gap-2">
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={`${inputClass} flex-1`}
          />
          <button
            type="button"
            onClick={() => setDueDate(todayISO())}
            className="px-3 text-[11px] rounded-soft bg-cream border border-beige/60 text-ash-light hover:text-ash transition-colors"
          >
            今天
          </button>
        </div>
      </Field>

      <button
        type="button"
        onClick={() => setPinned((p) => !p)}
        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-soft text-xs transition-all ${
          pinned ? 'bg-sakura text-ash' : 'bg-cream text-ash-light border border-beige/40'
        }`}
      >
        <Pin size={13} strokeWidth={1.5} />
        {pinned ? '已钉选到今日焦点' : '钉选到今日焦点（让它持续被看见）'}
      </button>
    </Modal>
  )
}
