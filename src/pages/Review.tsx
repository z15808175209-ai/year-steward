import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLiveQuery } from 'dexie-react-hooks'
import { Flame, TrendingUp, Trophy } from 'lucide-react'
import { db } from '../db'
import type { Routine, Task } from '../types'
import {
  computeReviewStats,
  formatPeriodLabel,
  type Period,
} from '../lib/stats'

interface Props {
  routines: Routine[] | undefined
  tasks: Task[] | undefined
}

const HEAT_COLORS = [
  'bg-cream border border-beige/40',
  'bg-sakura/30',
  'bg-sakura/55',
  'bg-sakura',
  'bg-ash/85',
]

const HEAT_LEGEND = ['少', '更多']

export default function Review({ routines = [], tasks = [] }: Props) {
  const [period, setPeriod] = useState<Period>('month')

  // 拉取日志（与 heatmap/真实完成率一致）
  const logs = useLiveQuery(() => db.routineLogs.toArray(), [], [])
  const stats = computeReviewStats(routines, tasks, logs ?? [], period)

  const { rates, heatmap, longestStreak, topRoutine } = stats

  return (
    <div className="max-w-4xl mx-auto px-10 py-10">
      {/* 顶部：副标题 + 月/年切换 */}
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <div className="text-[11px] tracking-[2px] text-ash-light mb-2">
            {formatPeriodLabel(period)}
          </div>
          <h1 className="text-3xl text-ash font-light">复盘</h1>
          <p className="text-sm text-ash-light mt-2">看见时间 · 看见自己</p>
        </div>

        <div className="flex bg-cream rounded-soft p-1">
          {(
            [
              { value: 'month', label: '本月' },
              { value: 'year', label: '本年' },
            ] as { value: Period; label: string }[]
          ).map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setPeriod(t.value)}
              className={`px-4 py-1.5 rounded-soft text-xs transition-all ${
                period === t.value ? 'bg-sakura text-ash font-medium' : 'text-ash-light'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Routine 完成率（突出） */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-sakura to-cream rounded-soft p-8 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="text-[11px] tracking-[1.5px] text-ash font-medium">固定任务 · 完成率</div>
          <div className="text-[10px] text-ash-light flex items-center gap-1">
            <Flame size={11} strokeWidth={2} className="text-[#E8A878]" />
            最长连续 {longestStreak} 天
          </div>
        </div>
        <div className="flex items-baseline gap-3 mb-3">
          <span className="text-5xl text-ash font-light">{rates.routineRate}%</span>
          <span className="text-sm text-ash-light">
            {rates.routineDone} / {rates.routineTotal} 次
          </span>
        </div>
        <div className="h-2 bg-white/60 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${rates.routineRate}%` }}
            transition={{ duration: 1, delay: 0.2 }}
            className="h-full bg-sakura rounded-full"
          />
        </div>
        {rates.routineTotal === 0 && (
          <div className="text-[11px] text-ash-light mt-3">
            还没有任何 routine 打卡记录，先去「今日」勾选一个 ✨
          </div>
        )}
      </motion.div>

      {/* 分模式统计 */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white border border-beige/40 rounded-soft p-5">
          <div className="text-[10px] tracking-[1.5px] text-ash-light mb-2">⏰ 锚定按时率</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl text-ash font-light">{rates.anchoredRate}%</span>
            <span className="text-xs text-ash-light">
              {rates.anchoredDone}/{rates.anchoredTotal}
            </span>
          </div>
          <div className="mt-3 h-1.5 bg-cream rounded-full overflow-hidden">
            <div
              className="h-full bg-sakura rounded-full"
              style={{ width: `${rates.anchoredRate}%` }}
            />
          </div>
        </div>
        <div className="bg-white border border-beige/40 rounded-soft p-5">
          <div className="text-[10px] tracking-[1.5px] text-ash-light mb-2">☁️ 当天完成率</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl text-ash font-light">{rates.flexibleRate}%</span>
            <span className="text-xs text-ash-light">
              {rates.flexibleDone}/{rates.flexibleTotal}
            </span>
          </div>
          <div className="mt-3 h-1.5 bg-cream rounded-full overflow-hidden">
            <div
              className="h-full bg-ash-light rounded-full"
              style={{ width: `${rates.flexibleRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* 弹性任务 + 延期 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-beige/40 rounded-soft p-5">
          <div className="text-[10px] tracking-[1.5px] text-ash-light mb-2">📋 弹性任务完成率</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl text-ash font-light">{rates.taskRate}%</span>
            <span className="text-xs text-ash-light">
              {rates.taskDone}/{rates.taskTotal}
            </span>
          </div>
          <div className="mt-3 h-1.5 bg-cream rounded-full overflow-hidden">
            <div
              className="h-full bg-beige rounded-full"
              style={{ width: `${rates.taskRate}%` }}
            />
          </div>
        </div>
        <div className="bg-white border border-beige/40 rounded-soft p-5">
          <div className="text-[10px] tracking-[1.5px] text-ash-light mb-2">⚠️ 延期数</div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-3xl font-light ${
                rates.overdueCount > 0 ? 'text-rose-urgent' : 'text-ash'
              }`}
            >
              {rates.overdueCount}
            </span>
            <span className="text-xs text-ash-light">
              {rates.overdueCount > 0 ? '晚于截止' : '没有延期'}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[10px] text-ash-light">
            <TrendingUp size={10} strokeWidth={1.5} />
            仅统计尚未完成的任务
          </div>
        </div>
      </div>

      {/* 热力图 */}
      <Heatmap days={heatmap} period={period} />

      {/* 最坚持 routine */}
      <div className="mt-6">
        <div className="text-[11px] tracking-[1.5px] text-ash font-medium mb-3">
          🏆 当前最坚持
        </div>
        {topRoutine ? (
          <div className="bg-white border border-sakura rounded-soft p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-sakura rounded-soft flex items-center justify-center">
                <Trophy size={22} strokeWidth={1.5} className="text-ash" />
              </div>
              <div className="flex-1">
                <div className="text-base text-ash">{topRoutine.title}</div>
                <div className="text-xs text-ash-light mt-1">
                  连续 {topRoutine.currentStreak} 天 · 累计完成 {topRoutine.totalCompletions} 次
                </div>
              </div>
              <div className="text-2xl">🔥</div>
            </div>
          </div>
        ) : (
          <div className="bg-white/60 border border-dashed border-beige/60 rounded-soft p-5 text-center text-xs text-ash-light">
            还没有连续打卡的 routine，先去勾选一个吧 🌿
          </div>
        )}
      </div>
    </div>
  )
}

/** GitHub 风格热力图：按周分列、每天一行；月视图走 5 周、年视图走 53 周 */
function Heatmap({ days, period }: { days: { date: string; level: 0 | 1 | 2 | 3 | 4 }[]; period: Period }) {
  // 把"每天"按周分列：第一列是第一个周日及其之前几天
  const cells = days.map((d, i) => ({ ...d, i }))
  const firstWeekday = new Date(days[0].date).getDay() // 0=Sun
  const padded: ({ date: string; level: 0 | 1 | 2 | 3 | 4; i: number; pad?: boolean } | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...cells.map((c) => ({ ...c })),
  ]
  const weeks: (typeof padded)[] = []
  for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7))

  const gapClass = 'gap-1'
  const cellClass = 'aspect-square rounded-sm'

  return (
    <div className="bg-white border border-beige/40 rounded-soft p-6">
      <div className="text-[11px] tracking-[1.5px] text-ash font-medium mb-4">
        {period === 'month' ? '本月' : '本年'}活动热力图
        <span className="text-[10px] text-ash-light font-normal ml-2">
          颜色越深 · 当天完成的事越多
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className={`grid grid-rows-7 ${gapClass} inline-grid`} style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}>
          {Array.from({ length: 7 }).map((_, row) => (
            weeks.map((week, col) => {
              const cell = week[row]
              return (
                <motion.div
                  key={`${col}-${row}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: (col * 7 + row) * 0.002 }}
                  className={`${cellClass} ${
                    cell ? HEAT_COLORS[cell.level] : 'bg-transparent'
                  }`}
                  title={cell ? `${cell.date} · 强度 ${cell.level}` : ''}
                />
              )
            })
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 text-[10px] text-ash-light">
        <span>{HEAT_LEGEND[0]}</span>
        {HEAT_COLORS.map((c, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
        ))}
        <span>{HEAT_LEGEND[1]}</span>
      </div>
    </div>
  )
}
