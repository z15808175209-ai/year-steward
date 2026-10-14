import Dexie, { type Table } from 'dexie'
import type { Routine, Task, Countdown, Note } from './types'
import { initialRoutines, initialTasks, initialCountdowns, initialNotes } from './mockData'

export class YearStewardDB extends Dexie {
  routines!: Table<Routine, string>
  tasks!: Table<Task, string>
  countdowns!: Table<Countdown, string>
  notes!: Table<Note, string>
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
  }
}

export const db = new YearStewardDB()

// 首次访问时填充 mock 数据
export async function seedIfEmpty() {
  const seeded = await db.meta.get('seeded')
  if (seeded) return

  await db.transaction('rw', db.routines, db.tasks, db.countdowns, db.notes, db.meta, async () => {
    await db.routines.bulkPut(initialRoutines)
    await db.tasks.bulkPut(initialTasks)
    await db.countdowns.bulkPut(initialCountdowns)
    await db.notes.bulkPut(initialNotes)
    await db.meta.put({ key: 'seeded', value: new Date().toISOString() })
  })
}
