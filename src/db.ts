import Dexie, { type Table } from 'dexie'
import type { Routine, RoutineLog, Task, Countdown, Note } from './types'
import {
  initialRoutines,
  initialTasks,
  initialCountdowns,
  initialNotes,
  buildSeedLogs,
} from './mockData'
import { toISODate, todayISO } from './lib/date'

export class YearStewardDB extends Dexie {
  routines!: Table<Routine, string>
  tasks!: Table<Task, string>
  countdowns!: Table<Countdown, string>
  notes!: Table<Note, string>
  routineLogs!: Table<RoutineLog, string>
  meta!: Table<{ key: string; value: any }, string>

  constructor() {
    super('YearStewardDB')

    this.version(1).stores({
      routines: 'id, timeMode, category, recurrence',
      tasks: 'id, priority, pinned, done, dueDate',
      countdowns: 'id, date, category',
      notes: 'id, updatedAt, *tags',
      meta: 'key',
    })

    // v2：新增 routineLogs（routine 的每日完成/跳过记录），并清理早期的伪日期字段
    this.version(2)
      .stores({
        routines: 'id, timeMode, category, recurrence',
        tasks: 'id, priority, pinned, done, dueDate',
        countdowns: 'id, date, category',
        notes: 'id, updatedAt, *tags',
        routineLogs: 'id, routineId, date',
        meta: 'key',
      })
      .upgrade(async (tx) => {
        const isISODate = (v: unknown) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)
        const isISODateTime = (v: unknown) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)

        // 早期 mock 里 dueDate 是「今天 / 周四」这类展示文案，直接清掉
        await tx.table('tasks').toCollection().modify((t: any) => {
          if (t.dueDate && !isISODate(t.dueDate)) delete t.dueDate
          if (t.completedAt && !isISODateTime(t.completedAt)) delete t.completedAt
        })
        await tx.table('notes').toCollection().modify((n: any) => {
          if (n.updatedAt && !isISODateTime(n.updatedAt)) n.updatedAt = new Date().toISOString()
        })

        // 老用户已有 routine 但没有日志：按现有连续天数补一段历史，保证统计连贯
        const routines: Routine[] = await tx.table('routines').toArray()
        const logs: RoutineLog[] = []
        const today = new Date()
        for (const r of routines) {
          const streak = r.currentStreak || 0
          for (let i = 0; i < streak; i++) {
            const d = new Date(today)
            d.setDate(d.getDate() - i)
            const iso = toISODate(d)
            logs.push({ id: `${r.id}_${iso}`, routineId: r.id, date: iso, state: 'done' })
          }
        }
        if (logs.length) await tx.table('routineLogs').bulkPut(logs)
      })
  }
}

export const db = new YearStewardDB()

// 首次访问时填充示例数据
export async function seedIfEmpty() {
  const seeded = await db.meta.get('seeded')
  if (!seeded) {
    await db.transaction(
      'rw',
      [db.routines, db.tasks, db.countdowns, db.notes, db.routineLogs, db.meta],
      async () => {
        await db.routines.bulkPut(initialRoutines)
        await db.tasks.bulkPut(initialTasks)
        await db.countdowns.bulkPut(initialCountdowns)
        await db.notes.bulkPut(initialNotes)
        await db.routineLogs.bulkPut(buildSeedLogs(initialRoutines))
        await db.meta.put({ key: 'seeded', value: todayISO() })
      },
    )
  }
}
