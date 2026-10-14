import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Pin, Plus, Pencil } from 'lucide-react'
import type { Task, Priority } from '../types'
import { deleteTask, toggleTask } from '../repo'
import { daysUntil, formatFriendly, formatTimestamp } from '../lib/date'
import TaskModal from '../components/TaskModal'
import DeleteButton from '../components/DeleteButton'

interface Props {
  tasks: Task[] | undefined
}

const PRIORITY_ORDER: Record<Priority, number> = { P0: 0, P1: 1, P2: 2 }

const PRIORITY_DOT: Record<Priority, string> = {
  P0: 'bg-rose-urgent',
  P1: 'bg-[#E8A878]',
  P2: 'bg-beige',
}

function sortTasks(list: Task[]) {
  return [...list].sort((a, b) => {
    const p = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
    if (p !== 0) return p
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate)
    if (a.dueDate) return -1
    if (b.dueDate) return 1
    return 0
  })
}

function DueChip({ dueDate }: { dueDate: string }) {
  const d = daysUntil(dueDate)
  const urgent = d < 0
  const soon = d >= 0 && d <= 1
  return (
    <span
      className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${
        urgent
          ? 'bg-rose-urgent/15 text-rose-urgent'
          : soon
            ? 'bg-[#E8A878]/20 text-[#C8854D]'
            : 'bg-cream text-ash-light'
      }`}
    >
      {urgent ? `已逾期 ${formatFriendly(dueDate)}` : formatFriendly(dueDate)}
    </span>
  )
}

export default function Tasks({ tasks = [] }: Props) {
  const [modal, setModal] = useState<{ open: boolean; editing?: Task }>({ open: false })

  const active = sortTasks(tasks.filter((t) => !t.done))
  const completed = [...tasks.filter((t) => t.done)].sort((a, b) =>
    (b.completedAt ?? '').localeCompare(a.completedAt ?? ''),
  )

  return (
    <div className="max-w-3xl mx-auto px-10 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="text-[11px] tracking-[2px] text-ash-light mb-2">弹性任务 · 80%</div>
          <h1 className="text-3xl text-ash font-light">任务清单</h1>
          <p className="text-sm text-ash-light mt-2">
            {active.length} 个待办 · {completed.length} 个已完成
          </p>
        </div>
        <button
          onClick={() => setModal({ open: true })}
          className="bg-sakura rounded-soft px-4 py-2 text-sm text-ash font-medium flex items-center gap-2 hover:bg-sakura/80 transition-colors"
        >
          <Plus size={14} strokeWidth={2} />
          新建任务
        </button>
      </div>

      {/* 待办 */}
      <div className="space-y-2 mb-8">
        {active.length === 0 && (
          <div className="bg-white/60 border border-dashed border-beige/60 rounded-soft p-10 text-center text-sm text-ash-light">
            没有待办，享受这份清净 🌿
          </div>
        )}
        {active.map((t) => (
          <motion.div
            key={t.id}
            layout
            whileHover={{ x: 2 }}
            className="bg-white rounded-soft p-4 flex items-center gap-3 group"
          >
            <button
              onClick={() => toggleTask(t.id)}
              title="标记完成"
              className="w-5 h-5 rounded-full border-2 border-beige hover:border-sage-done hover:bg-sage-done/10 flex items-center justify-center transition-all flex-shrink-0"
            />
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT[t.priority]}`} />
            <span className="text-sm text-ash flex-1">{t.title}</span>

            {t.dueDate && <DueChip dueDate={t.dueDate} />}
            {t.pinned && <Pin size={12} strokeWidth={1.5} className="text-ash-light flex-shrink-0" />}

            <span className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setModal({ open: true, editing: t })}
                title="编辑"
                className="text-ash-light hover:text-ash transition-colors"
              >
                <Pencil size={13} strokeWidth={1.5} />
              </button>
              <DeleteButton onConfirm={() => deleteTask(t.id)} />
            </span>
          </motion.div>
        ))}
      </div>

      {/* 已完成 */}
      {completed.length > 0 && (
        <>
          <div className="text-[11px] tracking-[1.5px] text-ash-light mb-3">已完成 · {completed.length}</div>
          <div className="space-y-2">
            {completed.map((t) => (
              <motion.div
                key={t.id}
                layout
                className="bg-cream/50 rounded-soft p-4 flex items-center gap-3 group"
              >
                <button
                  onClick={() => toggleTask(t.id)}
                  title="取消完成"
                  className="w-5 h-5 rounded-full bg-sage-done flex items-center justify-center flex-shrink-0"
                >
                  <Check size={12} strokeWidth={3} className="text-white" />
                </button>
                <span className="text-sm text-ash-light line-through flex-1">{t.title}</span>
                {t.completedAt && (
                  <span className="text-[10px] text-ash-light">{formatTimestamp(t.completedAt)} 完成</span>
                )}
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <DeleteButton onConfirm={() => deleteTask(t.id)} />
                </span>
              </motion.div>
            ))}
          </div>
        </>
      )}

      <AnimatePresence>
        {modal.open && (
          <TaskModal task={modal.editing} onClose={() => setModal({ open: false })} />
        )}
      </AnimatePresence>
    </div>
  )
}
