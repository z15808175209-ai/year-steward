import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Clock, SkipForward, Flame, Plus } from 'lucide-react'
import type { Routine, Task, Countdown } from '../types'

interface Props {
  routines: Routine[] | undefined
  tasks: Task[] | undefined
  countdowns: Countdown[] | undefined
  onToggleTask: (id: string) => void
  onCompleteRoutine: (id: string, state: 'done' | 'skip') => Promise<void>
  onAddRoutine: () => void
}

function daysUntil(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function urgencyColor(days: number) {
  if (days < 0) return 'text-ash-light'
  if (days <= 7) return 'text-rose-urgent'
  if (days <= 30) return 'text-[#E8A878]'
  return 'text-[#A8C8D8]'
}

export default function Dashboard({
  routines = [],
  tasks = [],
  countdowns = [],
  onToggleTask,
  onCompleteRoutine,
  onAddRoutine,
}: Props) {
  const [completedRoutines, setCompletedRoutines] = useState<Record<string, 'done' | 'skip'>>({})

  const anchoredRoutines = routines.filter((r) => r.timeMode === 'anchored')
  const flexibleRoutines = routines.filter((r) => r.timeMode === 'flexible')

  const toggleRoutine = async (id: string, state: 'done' | 'skip') => {
    const current = completedRoutines[id]
    // 重复点击同一状态 = 取消
    if (current === state) {
      setCompletedRoutines((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      return
    }
    setCompletedRoutines((prev) => ({ ...prev, [id]: state }))
    // 累加统计到 IndexedDB（累加而不是覆盖）
    await onCompleteRoutine(id, state)
  }

  const pinnedTasks = tasks.filter((t) => t.pinned && !t.done)
  const otherTasks = tasks.filter((t) => !t.pinned && !t.done)

  const today = new Date()
  const dateLabel = `${today.getMonth() + 1}月${today.getDate()}日 · 周${['日','一','二','三','四','五','六'][today.getDay()]}`
  const timeLabel = `${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}`

  return (
    <div className="max-w-4xl mx-auto px-10 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="text-[11px] tracking-[2px] text-ash-light mb-2">TODAY · {dateLabel}</div>
        <h1 className="text-3xl text-ash font-light">{timeLabel}</h1>
        <p className="text-sm text-ash-light mt-2">
          今天有 {anchoredRoutines.length + flexibleRoutines.length} 个 routine ·{' '}
          {pinnedTasks.length + otherTasks.length} 个任务
        </p>
      </div>

      {/* Anchored Routines */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11px] tracking-[1.5px] text-ash font-medium">
            <Clock size={11} className="inline mr-1.5" strokeWidth={2} />
            锚定时间 · 按时率 92%
          </div>
          <div className="text-[10px] text-ash-light flex items-center gap-1">
            <Flame size={10} strokeWidth={2} className="text-[#E8A878]" />
            最长连续 23 天
          </div>
        </div>
        <div className="bg-sakura rounded-soft p-5 space-y-2">
          {anchoredRoutines.map((r) => {
            const state = completedRoutines[r.id]
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 py-1.5 group"
              >
                <button
                  onClick={() => toggleRoutine(r.id, 'done')}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    state === 'done' ? 'bg-sage-done border-sage-done' : 'border-white/60 hover:border-white'
                  }`}
                >
                  {state === 'done' && <Check size={12} strokeWidth={3} className="text-white" />}
                </button>
                <span className={`text-sm flex-1 ${state === 'done' ? 'text-ash-light line-through' : 'text-ash'}`}>
                  <span className="text-xs text-ash-light mr-2">{r.scheduledTime}</span>
                  {r.title}
                </span>
                {state !== 'skip' && state !== 'done' && (
                  <button
                    onClick={() => toggleRoutine(r.id, 'skip')}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-ash-light hover:text-ash flex items-center gap-1 px-2 py-1 rounded-full hover:bg-white/40"
                  >
                    <SkipForward size={10} strokeWidth={2} />
                    跳过
                  </button>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Flexible Routines */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11px] tracking-[1.5px] text-ash font-medium">
            ☁️ 当天完成 · 最晚 22:00
          </div>
          <div className="text-[10px] text-ash-light">完成率 82%</div>
        </div>
        <div className="bg-white border border-beige/60 rounded-soft p-5 space-y-2">
          {flexibleRoutines.map((r) => {
            const state = completedRoutines[r.id]
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 py-1.5 group"
              >
                <button
                  onClick={() => toggleRoutine(r.id, 'done')}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    state === 'done' ? 'bg-sage-done border-sage-done' : 'border-beige hover:border-ash-light'
                  }`}
                >
                  {state === 'done' && <Check size={12} strokeWidth={3} className="text-white" />}
                </button>
                <span className={`text-sm flex-1 ${state === 'done' ? 'text-ash-light line-through' : 'text-ash'}`}>
                  {r.title}
                </span>
                {state !== 'done' && (
                  <button
                    onClick={() => toggleRoutine(r.id, 'skip')}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-ash-light hover:text-ash flex items-center gap-1 px-2 py-1 rounded-full hover:bg-cream"
                  >
                    <SkipForward size={10} strokeWidth={2} />
                    跳过
                  </button>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Tasks */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11px] tracking-[1.5px] text-ash font-medium">📋 弹性任务</div>
          <div className="text-[10px] text-ash-light">{tasks.filter((t) => !t.done).length} 个待办</div>
        </div>
        <div className="bg-white rounded-soft p-5 space-y-1">
          {[...pinnedTasks, ...otherTasks].map((t) => (
            <motion.div
              key={t.id}
              whileHover={{ x: 2 }}
              className="flex items-center gap-3 py-2 cursor-pointer"
              onClick={() => onToggleTask(t.id)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleTask(t.id)
                }}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  t.done ? 'bg-sage-done border-sage-done' : 'border-beige hover:border-ash-light'
                }`}
              >
                {t.done && <Check size={12} strokeWidth={3} className="text-white" />}
              </button>
              <span
                className={`w-2 h-2 rounded-full ${
                  t.priority === 'P0' ? 'bg-rose-urgent' : t.priority === 'P1' ? 'bg-[#E8A878]' : 'bg-beige'
                }`}
              ></span>
              <span className={`text-sm flex-1 ${t.done ? 'text-ash-light line-through' : 'text-ash'}`}>
                {t.title}
              </span>
              {t.priority === 'P0' && <span className="text-[10px] text-rose-urgent">今天</span>}
              {t.dueDate && t.priority !== 'P0' && <span className="text-[10px] text-ash-light">{t.dueDate}</span>}
              {t.pinned && !t.done && <span className="text-[10px] text-ash-light">📌</span>}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Countdowns */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11px] tracking-[1.5px] text-ash font-medium">⏰ 最近倒计时</div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {countdowns.slice(0, 3).map((c) => {
            const days = daysUntil(c.date)
            const color = urgencyColor(days)
            const bgColor = days <= 7 ? 'bg-white border border-rose-urgent/30' : 'bg-white border border-beige/40'
            return (
              <motion.div
                key={c.id}
                whileHover={{ y: -2 }}
                className={`${bgColor} rounded-soft p-4 cursor-pointer transition-all`}
              >
                <div className={`text-2xl font-light ${color}`}>{days > 0 ? days : '已过'}</div>
                <div className="text-sm text-ash mt-1">{c.title}</div>
                <div className="text-[10px] text-ash-light mt-1">
                  {c.date} · {c.category === 'work' ? '工作' : c.category === 'family' ? '家人' : '个人'}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
