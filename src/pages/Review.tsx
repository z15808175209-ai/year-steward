import { motion } from 'framer-motion'
import { Flame, TrendingUp } from 'lucide-react'
import type { Routine, Task } from '../types'

interface Props {
  routines: Routine[] | undefined
  tasks: Task[] | undefined
}

export default function Review({ routines = [], tasks = [] }: Props) {
  const anchored = routines.filter((r) => r.timeMode === 'anchored')
  const flexible = routines.filter((r) => r.timeMode === 'flexible')
  const doneTasks = tasks.filter((t) => t.done).length
  const totalTasks = tasks.length

  // 计算完成率（mock 数据）
  const routineRate = 87
  const anchoredRate = 92
  const flexibleRate = 82
  const taskRate = Math.round((doneTasks / totalTasks) * 100)
  const longestStreak = Math.max(...routines.map((r) => r.longestStreak))

  // 生成 365 天热力图 mock 数据
  const heatmap = Array.from({ length: 35 }, (_, i) => {
    const seed = (i * 7) % 100
    if (seed < 15) return 0      // 空
    if (seed < 35) return 1      // 浅
    if (seed < 60) return 2      // 中
    if (seed < 85) return 3      // 深
    return 4                     // 最深
  })

  const heatColors = ['bg-cream border border-beige/40', 'bg-sakura/40', 'bg-sakura/70', 'bg-sakura', 'bg-ash']

  return (
    <div className="max-w-4xl mx-auto px-10 py-10">
      <div className="mb-8">
        <div className="text-[11px] tracking-[2px] text-ash-light mb-2">2026 年 10 月</div>
        <h1 className="text-3xl text-ash font-light">复盘</h1>
        <p className="text-sm text-ash-light mt-2">看见时间 · 看见自己</p>
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
          <span className="text-5xl text-ash font-light">{routineRate}%</span>
          <span className="text-sm text-ash-light">87 / 100 次</span>
        </div>
        <div className="h-2 bg-white/60 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${routineRate}%` }}
            transition={{ duration: 1, delay: 0.2 }}
            className="h-full bg-sakura rounded-full"
          />
        </div>
      </motion.div>

      {/* 分模式统计 */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white border border-beige/40 rounded-soft p-5">
          <div className="text-[10px] tracking-[1.5px] text-ash-light mb-2">⏰ 锚定按时率</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl text-ash font-light">{anchoredRate}%</span>
            <span className="text-xs text-ash-light">{anchored.length} 项</span>
          </div>
          <div className="mt-3 h-1.5 bg-cream rounded-full overflow-hidden">
            <div className="h-full bg-sakura rounded-full" style={{ width: `${anchoredRate}%` }} />
          </div>
        </div>
        <div className="bg-white border border-beige/40 rounded-soft p-5">
          <div className="text-[10px] tracking-[1.5px] text-ash-light mb-2">☁️ 当天完成率</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl text-ash font-light">{flexibleRate}%</span>
            <span className="text-xs text-ash-light">{flexible.length} 项</span>
          </div>
          <div className="mt-3 h-1.5 bg-cream rounded-full overflow-hidden">
            <div className="h-full bg-ash-light rounded-full" style={{ width: `${flexibleRate}%` }} />
          </div>
        </div>
      </div>

      {/* 弹性任务 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-beige/40 rounded-soft p-5">
          <div className="text-[10px] tracking-[1.5px] text-ash-light mb-2">📋 弹性任务完成率</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl text-ash font-light">{taskRate}%</span>
            <span className="text-xs text-ash-light">{doneTasks}/{totalTasks}</span>
          </div>
          <div className="mt-3 h-1.5 bg-cream rounded-full overflow-hidden">
            <div className="h-full bg-beige rounded-full" style={{ width: `${taskRate}%` }} />
          </div>
        </div>
        <div className="bg-white border border-beige/40 rounded-soft p-5">
          <div className="text-[10px] tracking-[1.5px] text-ash-light mb-2">⚠️ 延期数</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl text-rose-urgent font-light">5</span>
            <span className="text-xs text-ash-light">晚于截止</span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[10px] text-ash-light">
            <TrendingUp size={10} strokeWidth={1.5} />
            较上月 ↓ 2
          </div>
        </div>
      </div>

      {/* 365 热力图 */}
      <div className="bg-white border border-beige/40 rounded-soft p-6 mb-6">
        <div className="text-[11px] tracking-[1.5px] text-ash font-medium mb-4">2026 年活动热力图</div>
        <div className="grid grid-cols-[repeat(35,1fr)] gap-1.5">
          {heatmap.map((level, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.005 }}
              className={`aspect-square rounded ${heatColors[level]}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-4 text-[10px] text-ash-light">
          <span>少</span>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={`w-3 h-3 rounded ${heatColors[i]}`} />
          ))}
          <span>多</span>
        </div>
      </div>

      {/* 最坚持 routine */}
      <div>
        <div className="text-[11px] tracking-[1.5px] text-ash font-medium mb-3">🏆 本月最坚持</div>
        <div className="bg-white border border-sakura rounded-soft p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-sakura rounded-soft flex items-center justify-center text-2xl">🏃</div>
            <div className="flex-1">
              <div className="text-base text-ash">{routines[0]?.title}</div>
              <div className="text-xs text-ash-light mt-1">连续 12 天 · 累计完成 87 次</div>
            </div>
            <div className="text-2xl text-rose-urgent">🔥</div>
          </div>
        </div>
      </div>
    </div>
  )
}
