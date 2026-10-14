import { useState } from 'react'
import Modal from './Modal'
import { ChipGroup, Field, ModalFooter, inputClass } from './form'
import { createCountdown, updateCountdown, type CountdownInput } from '../repo'
import type { Countdown, CountdownCategory } from '../types'
import { todayISO } from '../lib/date'

interface Props {
  countdown?: Countdown
  onClose: () => void
}

const CATEGORIES: { value: CountdownCategory; label: string }[] = [
  { value: 'personal', label: '个人' },
  { value: 'work', label: '工作' },
  { value: 'family', label: '家人' },
]

export default function CountdownModal({ countdown, onClose }: Props) {
  const editing = Boolean(countdown)
  const [title, setTitle] = useState(countdown?.title ?? '')
  const [date, setDate] = useState(countdown?.date ?? todayISO())
  const [category, setCategory] = useState<CountdownCategory>(countdown?.category ?? 'personal')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    const trimmed = title.trim()
    if (!trimmed || !date || saving) return
    setSaving(true)
    const input: CountdownInput = { title: trimmed, date, category }
    if (editing && countdown) await updateCountdown(countdown.id, input)
    else await createCountdown(input)
    onClose()
  }

  return (
    <Modal
      subtitle={editing ? '编辑倒计时' : '新建倒计时'}
      title={editing ? '修改这个重要日子' : '记下一个重要日子'}
      onClose={onClose}
      footer={
        <ModalFooter
          onCancel={onClose}
          onSave={handleSave}
          saveLabel={editing ? '保存修改' : '添加倒计时'}
          disabled={!title.trim() || !date || saving}
        />
      }
    >
      <Field label="事件名称">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
          }}
          placeholder="例：妈妈生日 / 项目 deadline"
          className={inputClass}
        />
      </Field>

      <Field label="日期">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="分类">
        <ChipGroup options={CATEGORIES} value={category} onChange={setCategory} />
      </Field>
    </Modal>
  )
}
