// 复盘统计：所有数据从 Dexie 实时读出，不写任何 mock

import type { Routine, RoutineLog, Task } from '../types'
import { fromISODate, lastNDays, todayISO, toISODate } from './date'

export type Period = 'month' | 'year'

export interface CompletionRates {
  /** 全部 routine 的总完成率：done / (done + skip) */
  routineRate: number
  anchoredRate: number
  flexibleRate: number
  /** 分子分母（用于显示「87 / 100 次」） */
  routineDone: number
  routineTotal: number
  anchoredDone: number
  anchoredTotal: number
  flexibleDone: number
  flexibleTotal: number

  /** 弹性任务完成率 */
  taskRate: number
  taskDone: number
  taskTotal: number

  /** 延期数：截止日 < 今天且未完成的任务 */
  overdueCount: number
}

export interface HeatmapDay {
  date: string
  level: 0 | 1 | 2 | 3 | 4
}

export interface ReviewStats {
  rates: CompletionRates
  /** 当期内的热力图数据（按时间正序） */
  heatmap: HeatmapDay[]
  /** 全周期最长连续（来自所有 routine） */
  longestStreak: number
  /** 当期最坚持的 routine（currentStreak 最长且 > 0） */
  topRoutine: Routine | null
}

/** 区间端点 [start, end]（含两端，YYYY-MM-DD） */
export function periodRange(period: Period, anchor: string = todayISO()): { start: string; end: string } {
  const a = fromISODate(anchor)
  if (period === 'month') {
    const start = new Date(a.getFullYear(), a.getMonth(), 1)
    const end = new Date(a.getFullYear(), a.getMonth() + 1, 0)
    return { start: toISODate(start), end: toISODate(end) }
  }
  const start = new Date(a.getFullYear(), 0, 1)
  const end = new Date(a.getFullYear(), 11, 31)
  return { start: toISODate(start), end: toISODate(end) }
}

/** 完成率（0-100 整数；分母为 0 时返回 0） */
function rate(done: number, total: number): number {
  return total === 0 ? 0 : Math.round((done / total) * 100)
}

/** 给一组日期+完成状态，按"区间内 done 数"算强度等级 0-4 */
function levelize(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0
  if (count === 1) return 1
  if (count <= 3) return 2
  if (count <= 5) return 3
  return 4
}

/** 计算热力图：把"当天活跃度"（routine done 数 + 任务 done 数）分级 */
function buildHeatmap(
  logs: RoutineLog[],
  tasks: Task[],
  period: Period,
  anchor: string,
): HeatmapDay[] {
  const days = period === 'month' ? lastNDays(31) : lastNDays(365)
  const start = days[0]
  const end = days[days.length - 1]

  // 区间内 routine done 数按日期聚合
  const routineDoneByDate = new Map<string, number>()
  for (const l of logs) {
    if (l.state !== 'done') continue
    if (l.date < start || l.date > end) continue
    routineDoneByDate.set(l.date, (routineDoneByDate.get(l.date) ?? 0) + 1)
  }

  // 区间内任务完成数按日期聚合（取 completedAt 的日期部分）
  const taskDoneByDate = new Map<string, number>()
  for (const t of tasks) {
    if (!t.done || !t.completedAt) continue
    const d = toISODate(new Date(t.completedAt))
    if (d < start || d > end) continue
    taskDoneByDate.set(d, (taskDoneByDate.get(d) ?? 0) + 1)
  }

  return days.map((date) => {
    const count = (routineDoneByDate.get(date) ?? 0) + (taskDoneByDate.get(date) ?? 0)
    return { date, level: levelize(count) }
  })
}

export function computeReviewStats(
  routines: Routine[],
  tasks: Task[],
  logs: RoutineLog[],
  period: Period,
  anchor: string = todayISO(),
): ReviewStats {
  const anchored = routines.filter((r) => r.timeMode === 'anchored')
  const flexible = routines.filter((r) => r.timeMode === 'flexible')

  // 用累计完成/跳过算总完成率（routine 自身就带这俩字段，实时由 repo 计算）
  const sum = (arr: Routine[], key: 'totalCompletions' | 'totalSkips') =>
    arr.reduce((s, r) => s + r[key], 0)

  const anchoredDone = sum(anchored, 'totalCompletions')
  const anchoredSkip = sum(anchored, 'totalSkips')
  const flexibleDone = sum(flexible, 'totalCompletions')
  const flexibleSkip = sum(flexible, 'totalSkips')
  const allDone = anchoredDone + flexibleDone
  const allSkip = anchoredSkip + flexibleSkip

  const doneTasks = tasks.filter((t) => t.done).length
  const today = todayISO()
  const overdueCount = tasks.filter((t) => !t.done && t.dueDate && t.dueDate < today).length

  const rates: CompletionRates = {
    routineRate: rate(allDone, allDone + allSkip),
    anchoredRate: rate(anchoredDone, anchoredDone + anchoredSkip),
    flexibleRate: rate(flexibleDone, flexibleDone + flexibleSkip),
    routineDone: allDone,
    routineTotal: allDone + allSkip,
    anchoredDone,
    anchoredTotal: anchoredDone + anchoredSkip,
    flexibleDone,
    flexibleTotal: flexibleDone + flexibleSkip,
    taskRate: rate(doneTasks, tasks.length),
    taskDone: doneTasks,
    taskTotal: tasks.length,
    overdueCount,
  }

  const heatmap = buildHeatmap(logs, tasks, period, anchor)

  const longestStreak = routines.reduce((m, r) => Math.max(m, r.longestStreak), 0)

  // 当前最坚持：currentStreak 最长且 > 0
  const candidates = routines.filter((r) => r.currentStreak > 0)
  const topRoutine =
    candidates.length === 0
      ? null
      : candidates.reduce((a, b) => (b.currentStreak > a.currentStreak ? b : a))

  return { rates, heatmap, longestStreak, topRoutine }
}

/** Review 顶部副标题：2026 年 10 月 / 2026 年 */
export function formatPeriodLabel(period: Period, anchor: string = todayISO()): string {
  const d = fromISODate(anchor)
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  if (period === 'month') return `${y} 年 ${m} 月`
  return `${y} 年`
}
