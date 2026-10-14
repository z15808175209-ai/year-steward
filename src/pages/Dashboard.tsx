import { motion } from 'framer-motion'
import { useLiveQuery } from 'dexie-react-hooks'
import { Check, Clock, SkipForward, Flame, Pencil, Pin } from 'lucide-react'
import type { Countdown, DayState, Routine, Task } from '../types'
import { db } from '../db'
import { setRoutineDayState, deleteRoutine, toggleTask } from '../repo'
import { daysUntil, formatFriendly, todayISO } from '../lib/date'
import DeleteButton from '../components/DeleteButton'

interface Props {
  routines: Routine[] | undefined
  tasks: Task[] | undefined
  countdowns: Countdown[] | undefined
  onEditRoutine: (r: Routine) => void
}

function urgencyColor(days: number) {
  if (days < 0) return 'text-ash-light'
  if (days <= 7) return 'text-rose-urgent'
  if (days <= 30) return 'text-[#E8A878]'
  return 'text-[#A8C8D8]'
}

function rate(routines: Routine[]) {
  const done = routines.reduce((s, r) => s + r.totalCompletions, 0)
  const skip = routines.reduce((s, r) => s + r.totalSkips, 0)
  const total = done + skip
  return total === 0 ? 0 : Math.round((done / total) * 100)
}

export default function Dashboard({ routines = [], tasks = [], countdowns = [], onEditRoutine }: Props) {
  const today = todayISO()
  const todayLogs = useLiveQuery(() => db.routineLogs.where('date').equals(today).toArray(), [today], [])

  const todayState: Record<string, DayState> = {}
  for (const l of todayLogs) todayState[l.routineId] = l.state

  const anchoredRoutines = routines.filter((r) => r.timeMode === 'anchored')
  const flexibleRoutines = routines.filter((r) => r.timeMode === 'flexible')

  const pinnedTasks = tasks.filter((t) => t.pinned && !t.done)
  const otherTasks = tasks.filter((t) => !t.pinned && !t.done)

  const now = new Date()
  const dateLabel = `${now.getMonth() + 1}月${now.getDate()}日 · 周${['日', '一', '二', '三', '四', '五', '六'][now.getDay()]}`
  const timeLabel = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  const anchoredRate = rate(anchoredRoutines)
  const flexibleRate = rate(flexibleRoutines)
  const maxStreak = routines.reduce((m, r) => Math.max(m, r.longestStreak), 0)

  const RoutineRow = ({ r, tone }: { r: Routine; tone: 'pink' | 'plain' }) => {
    const state = todayState[r.id]
    const onPink = tone === 'pink'
    return (
      <motion.div layout className="flex items-center gap-3 py-1.5 group">
        <button
          onClick={() => setRoutineDayState(r.id, today, 'done')}
          title="今天完成了"
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
            state === 'done'
              ? 'bg-sage-done border-sage-done'
              : onPink
                ? 'border-white/60 hover:border-white'
                : 'border-beige hover:border-ash-light'
          }`}
        >
          {state === 'done' && <Check size={12} strokeWidth={3} className="text-white" />}
        </button>

        <span className={`text-sm flex-1 ${state === 'done' ? 'text-ash-light line-through' : 'text-ash'}`}>
          {r.scheduledTime && <span className="text-xs text-ash-light mr-2">{r.scheduledTime}</span>}
          {r.title}
          {state === 'skip' && <span className="text-[10px] text-ash-light ml-2">今天跳过</span>}
        </span>

        <span className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {state !== 'done' && (
            <button
              onClick={() => setRoutineDayState(r.id, today, 'skip')}
              className={`text-[10px] text-ash-light hover:text-ash flex items-center gap-1 px-2 py-1 rounded-full ${
                onPink ? 'hover:bg-white/40' : 'hover:bg-cream'
              }`}
            >
              <SkipForward size={10} strokeWidth={2} />
              跳过
            </button>
          )}
          <button
            onClick={() => onEditRoutine(r)}
            title="编辑"
            className="text-ash-light hover:text-ash transition-colors"
          >
            <Pencil size={12} strokeWidth={1.5} />
          </button>
          <DeleteButton onConfirm={() => deleteRoutine(r.id)} size={12} />
        </span>
      </motion.div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-10 py-10">
      <div className="mb-8">
        <div className="text-[11px] tracking-[2px] text-ash-light mb-2">TODAY · {dateLabel}</div>
        <h1 className="text-3xl text-ash font-light">{timeLabel}</h1>
        <p className="text-sm text-ash-light mt-2">
          今天有 {routines.length} 个 routine · {pinnedTasks.length + otherTasks.length} 个任务
        </p>
      </div>

      {/* 锚定时间 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11px] tracking-[1.5px] text-ash font-medium">
            <Clock size={11} className="inline mr-1.5" strokeWidth={2} />
            锚定时间 · 按时率 {anchoredRate}%
          </div>
          <div className="text-[10px] text-ash-light flex items-center gap-1">
            <Flame size={10} strokeWidth={2} className="text-[#E8A878]" />
            最长连续 {maxStreak} 天
          </div>
        </div>
        <div className="bg-sakura rounded-soft p-5 space-y-2">
          {anchoredRoutines.length === 0 && (
            <div className="text-xs text-ash-light py-2">还没有锚定时间的 routine</div>
          )}
          {anchoredRoutines.map((r) => (
            <RoutineRow key={r.id} r={r} tone="pink" />
          ))}
        </div>
      </div>

      {/* 当天完成 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11px] tracking-[1.5px] text-ash font-medium">☁️ 当天完成</div>
          <div className="text-[10px] text-ash-light">完成率 {flexibleRate}%</div>
        </div>
        <div className="bg-white border border-beige/60 rounded-soft p-5 space-y-2">
          {flexibleRoutines.length === 0 && (
            <div className="text-xs text-ash-light py-2">还没有「当天完成」的 routine</div>
          )}
          {flexibleRoutines.map((r) => (
            <RoutineRow key={r.id} r={r} tone="plain" />
          ))}
        </div>
      </div>

      {/* 弹性任务 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11px] tracking-[1.5px] text-ash font-medium">📋 弹性任务</div>
          <div className="text-[10px] text-ash-light">{pinnedTasks.length + otherTasks.length} 个待办</div>
        </div>
        <div className="bg-white rounded-soft p-5 space-y-1">
          {pinnedTasks.length + otherTasks.length === 0 && (
            <div className="text-xs text-ash-light py-2">今天没有待办 ✨</div>
          )}
          {[...pinnedTasks, ...otherTasks].map((t) => (
            <motion.div
              key={t.id}
              layout
              whileHover={{ x: 2 }}
              className="flex items-center gap-3 py-2 cursor-pointer"
              onClick={() => toggleTask(t.id)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleTask(t.id)
                }}
                className="w-5 h-5 rounded-full border-2 border-beige hover:border-sage-done hover:bg-sage-done/10 flex items-center justify-center transition-all flex-shrink-0"
              />
              <span
                className={`w-2 h-2 rounded-full ${
                  t.priority === 'P0' ? 'bg-rose-urgent' : t.priority === 'P1' ? 'bg-[#E8A878]' : 'bg-beige'
                }`}
              />
              <span className="text-sm flex-1 text-ash">{t.title}</span>
              {t.dueDate && (
                <span
                  className={`text-[10px] ${
                    daysUntil(t.dueDate) < 0 ? 'text-rose-urgent' : 'text-ash-light'
                  }`}
                >
                  {formatFriendly(t.dueDate)}
                </span>
              )}
              {t.pinned && <Pin size={11} strokeWidth={1.5} className="text-ash-light" />}
            </motion.div>
          ))}
        </div>
      </div>

      {/* 倒计时 */}
      <div>
        <div className="text-[11px] tracking-[1.5px] text-ash font-medium mb-3">⏰ 最近倒计时</div>
        {countdowns.length === 0 ? (
          <div className="text-xs text-ash-light">还没有重要日期</div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {[...countdowns]
              .sort((a, b) => daysUntil(a.date) - daysUntil(b.date))
              .slice(0, 3)
              .map((c) => {
                const days = daysUntil(c.date)
                const color = urgencyColor(days)
                const bgColor =
                  days <= 7 && days >= 0
                    ? 'bg-white border border-rose-urgent/30'
                    : 'bg-white border border-beige/40'
                return (
                  <motion.div
                    key={c.id}
                    layout
                    whileHover={{ y: -2 }}
                    className={`${bgColor} rounded-soft p-4 transition-all`}
                  >
                    <div className={`text-2xl font-light ${color}`}>{days > 0 ? days : '已过'}</div>
                    <div className="text-sm text-ash mt-1">{c.title}</div>
                    <div className="text-[10px] text-ash-light mt-1">
                      {c.date} ·{' '}
                      {c.category === 'work' ? '工作' : c.category === 'family' ? '家人' : '个人'}
                    </div>
                  </motion.div>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}
