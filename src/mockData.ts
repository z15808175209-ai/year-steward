import type { Routine, RoutineLog, Task, Countdown, Note } from './types'
import { toISODate, todayISO, shiftDate } from './lib/date'

const TODAY = todayISO()

export const initialRoutines: Routine[] = [
  {
    id: 'r1',
    title: '晨跑 30min',
    category: 'workout',
    timeMode: 'anchored',
    recurrence: 'daily',
    scheduledTime: '07:30',
    duration: 30,
    currentStreak: 0,
    longestStreak: 0,
    totalCompletions: 0,
    totalSkips: 0,
  },
  {
    id: 'r2',
    title: '冥想 10min',
    category: 'morning',
    timeMode: 'anchored',
    recurrence: 'daily',
    scheduledTime: '08:00',
    duration: 10,
    currentStreak: 0,
    longestStreak: 0,
    totalCompletions: 0,
    totalSkips: 0,
  },
  {
    id: 'r3',
    title: '吃药',
    category: 'anytime',
    timeMode: 'anchored',
    recurrence: 'daily',
    scheduledTime: '08:30',
    duration: 1,
    currentStreak: 0,
    longestStreak: 0,
    totalCompletions: 0,
    totalSkips: 0,
  },
  {
    id: 'r4',
    title: '健身 1h',
    category: 'workout',
    timeMode: 'anchored',
    recurrence: 'weekdays',
    scheduledTime: '19:00',
    duration: 60,
    currentStreak: 0,
    longestStreak: 0,
    totalCompletions: 0,
    totalSkips: 0,
  },
  {
    id: 'r5',
    title: '写日记',
    category: 'evening',
    timeMode: 'flexible',
    recurrence: 'daily',
    dueByTime: '22:00',
    duration: 10,
    currentStreak: 0,
    longestStreak: 0,
    totalCompletions: 0,
    totalSkips: 0,
  },
  {
    id: 'r6',
    title: '阅读 30min',
    category: 'evening',
    timeMode: 'flexible',
    recurrence: 'daily',
    dueByTime: '22:00',
    duration: 30,
    currentStreak: 0,
    longestStreak: 0,
    totalCompletions: 0,
    totalSkips: 0,
  },
  {
    id: 'r7',
    title: '每周复盘',
    category: 'work',
    timeMode: 'flexible',
    recurrence: 'weekly',
    duration: 30,
    currentStreak: 0,
    longestStreak: 0,
    totalCompletions: 0,
    totalSkips: 0,
  },
]

export const initialTasks: Task[] = [
  { id: 't1', title: '写 PRD v0.4', priority: 'P0', dueDate: TODAY, pinned: true, done: false },
  { id: 't2', title: '和老张确认周末聚餐', priority: 'P1', dueDate: shiftDate(TODAY, 2), pinned: false, done: false },
  { id: 't3', title: '买生日礼物', priority: 'P2', dueDate: shiftDate(TODAY, 6), pinned: false, done: false },
  { id: 't4', title: '整理周报', priority: 'P1', dueDate: shiftDate(TODAY, 3), pinned: false, done: false },
  {
    id: 't5',
    title: '清理浏览器书签',
    priority: 'P2',
    pinned: false,
    done: true,
    completedAt: new Date(new Date().getTime() - 86400000).toISOString(),
  },
]

export const initialCountdowns: Countdown[] = [
  { id: 'c1', title: 'PRD v0.4 deadline', date: shiftDate(TODAY, 6), category: 'work' },
  { id: 'c2', title: '妈妈生日', date: '2026-11-05', category: 'family' },
  { id: 'c3', title: '春节', date: '2027-01-29', category: 'family' },
  { id: 'c4', title: '年度报告 deadline', date: '2027-01-08', category: 'work' },
]

export const initialNotes: Note[] = [
  {
    id: 'n1',
    title: '产品灵感',
    content: '私人助理不是替你决定，是在你冲动时帮你冷静 3 秒。\n\n它不催你，只是把后果摆给你看。',
    tags: ['灵感', '产品'],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'n2',
    title: '韩系盐系色板',
    content: '#FCF5EC 奶白\n#F1DBDB 樱粉\n#D4D1C6 米灰\n#938C83 深灰\n\n圆角 14px · 无阴影 · 大量留白',
    tags: ['设计'],
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'n3',
    title: '二八定律应用',
    content: '20% 固定任务 = 生活的骨架\n80% 弹性任务 = 生活的血肉\n\n骨架稳了，血肉才有地方长。',
    tags: ['产品', '方法'],
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
]

/** 生成示例的 routine 每日记录，让统计和热力图一打开就有内容 */
export function buildSeedLogs(routines: Routine[]): RoutineLog[] {
  const logs: RoutineLog[] = []
  const today = new Date()

  routines.forEach((r, idx) => {
    const seedStreak = [12, 5, 30, 4, 8, 6, 3][idx] ?? 5
    for (let back = 0; back < 90; back++) {
      const d = new Date(today)
      d.setDate(d.getDate() - back)
      const iso = toISODate(d)

      const weekday = d.getDay()
      const scheduled =
        r.recurrence === 'weekly'
          ? weekday === 0
          : r.recurrence === 'weekdays'
            ? weekday >= 1 && weekday <= 5
            : true
      if (!scheduled) continue

      const h = (back * 37 + idx * 53) % 100
      if (back < seedStreak) {
        logs.push({ id: `${r.id}_${iso}`, routineId: r.id, date: iso, state: 'done' })
      } else if (h < 58) {
        logs.push({ id: `${r.id}_${iso}`, routineId: r.id, date: iso, state: 'done' })
      } else if (h < 66) {
        logs.push({ id: `${r.id}_${iso}`, routineId: r.id, date: iso, state: 'skip' })
      }
    }
  })

  return logs
}
