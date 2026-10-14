// 业务层：所有写操作集中在这里，UI 只调用这些函数（配合 useLiveQuery 自动刷新）
import { db } from './db'
import type {
  Countdown,
  CountdownCategory,
  DayState,
  Note,
  Priority,
  Routine,
  RoutineLog,
  Task,
} from './types'
import { fromISODate, toISODate, todayISO } from './lib/date'

const uid = (prefix: string) =>
  prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

// ─────────────────────────── Task ───────────────────────────

export interface TaskInput {
  title: string
  priority: Priority
  dueDate?: string
  pinned: boolean
}

export async function createTask(input: TaskInput): Promise<string> {
  const id = uid('t')
  await db.tasks.add({ id, ...input, done: false })
  return id
}

export async function updateTask(id: string, patch: Partial<Task>): Promise<void> {
  const t = await db.tasks.get(id)
  if (!t) return
  const next: Task = { ...t, ...patch, id }
  if (!next.dueDate) delete next.dueDate
  await db.tasks.put(next)
}

export async function setTaskDone(id: string, done: boolean): Promise<void> {
  const t = await db.tasks.get(id)
  if (!t) return
  const next: Task = { ...t, done }
  if (done) next.completedAt = new Date().toISOString()
  else delete next.completedAt
  await db.tasks.put(next)
}

export async function toggleTask(id: string): Promise<void> {
  const t = await db.tasks.get(id)
  if (!t) return
  await setTaskDone(id, !t.done)
}

export async function deleteTask(id: string): Promise<void> {
  await db.tasks.delete(id)
}

// ────────────────────────── Routine ──────────────────────────

export interface RoutineInput {
  title: string
  category: Routine['category']
  timeMode: Routine['timeMode']
  recurrence: Routine['recurrence']
  scheduledTime?: string
  dueByTime?: string
  duration: number
}

export async function createRoutine(input: RoutineInput): Promise<Routine> {
  const routine: Routine = {
    id: uid('r'),
    ...input,
    scheduledTime: input.timeMode === 'anchored' ? input.scheduledTime : undefined,
    dueByTime: input.timeMode === 'flexible' ? input.dueByTime : undefined,
    currentStreak: 0,
    longestStreak: 0,
    totalCompletions: 0,
    totalSkips: 0,
  }
  await db.routines.add(routine)
  return routine
}

export async function updateRoutine(id: string, input: RoutineInput): Promise<void> {
  const r = await db.routines.get(id)
  if (!r) return
  const next: Routine = {
    ...r,
    ...input,
    scheduledTime: input.timeMode === 'anchored' ? input.scheduledTime : undefined,
    dueByTime: input.timeMode === 'flexible' ? input.dueByTime : undefined,
  }
  await db.routines.put(next)
}

export async function deleteRoutine(id: string): Promise<void> {
  await db.transaction('rw', [db.routines, db.routineLogs], async () => {
    await db.routineLogs.where('routineId').equals(id).delete()
    await db.routines.delete(id)
  })
}

/** 标记/取消「今天」的完成或跳过；再由日志重算统计（撤销天然正确） */
export async function setRoutineDayState(
  routineId: string,
  date: string,
  state: DayState,
): Promise<void> {
  const id = `${routineId}_${date}`
  const existing = await db.routineLogs.get(id)
  if (existing?.state === state) {
    await db.routineLogs.delete(id)
  } else {
    await db.routineLogs.put({ id, routineId, date, state })
  }
  await refreshRoutineStats(routineId)
}

function nextDay(iso: string): string {
  const d = fromISODate(iso)
  d.setDate(d.getDate() + 1)
  return toISODate(d)
}

/** 从日志计算：当前连续 / 历史最长 / 累计完成 / 累计跳过 */
export function computeRoutineStats(logs: RoutineLog[], today: string = todayISO()) {
  const doneDates = new Set(logs.filter((l) => l.state === 'done').map((l) => l.date))
  const totalSkips = logs.filter((l) => l.state === 'skip').length

  // 历史最长：把所有完成日排序后找最长连续段
  const sorted = [...doneDates].sort()
  let longest = 0
  let run = 0
  let prev: string | null = null
  for (const d of sorted) {
    run = prev && nextDay(prev) === d ? run + 1 : 1
    if (run > longest) longest = run
    prev = d
  }

  // 当前连续：今天没完成就从昨天开始数，避免「今天还没做」时把连续断掉
  let cursor = fromISODate(today)
  if (!doneDates.has(today)) cursor.setDate(cursor.getDate() - 1)
  let current = 0
  while (doneDates.has(toISODate(cursor))) {
    current += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return {
    currentStreak: current,
    longestStreak: longest,
    totalCompletions: doneDates.size,
    totalSkips,
  }
}

export async function refreshRoutineStats(routineId: string): Promise<void> {
  const r = await db.routines.get(routineId)
  if (!r) return
  const logs = await db.routineLogs.where('routineId').equals(routineId).toArray()
  await db.routines.put({ ...r, ...computeRoutineStats(logs) })
}

/** 新建/修改日志后统一调用，保证面板上的统计与日志一致 */
export async function refreshAllRoutineStats(): Promise<void> {
  const routines = await db.routines.toArray()
  await Promise.all(routines.map((r) => refreshRoutineStats(r.id)))
}

// ───────────────────────── Countdown ─────────────────────────

export interface CountdownInput {
  title: string
  date: string
  category: CountdownCategory
}

export async function createCountdown(input: CountdownInput): Promise<void> {
  await db.countdowns.add({ id: uid('c'), ...input })
}

export async function updateCountdown(id: string, input: CountdownInput): Promise<void> {
  const c = await db.countdowns.get(id)
  if (!c) return
  await db.countdowns.put({ ...c, ...input, id })
}

export async function deleteCountdown(id: string): Promise<void> {
  await db.countdowns.delete(id)
}

// ─────────────────────────── Note ───────────────────────────

export function parseTags(text: string): string[] {
  return Array.from(
    new Set(
      text
        .split(/[\s,，]+/)
        .map((t) => t.replace(/^#/, '').trim())
        .filter(Boolean),
    ),
  )
}

export interface NoteInput {
  title: string
  content: string
  tags: string[]
}

export async function createNote(partial: Partial<NoteInput> = {}): Promise<string> {
  const id = uid('n')
  await db.notes.add({
    id,
    title: partial.title ?? '未命名笔记',
    content: partial.content ?? '',
    tags: partial.tags ?? [],
    updatedAt: new Date().toISOString(),
  })
  return id
}

export async function updateNote(id: string, patch: Partial<NoteInput>): Promise<void> {
  await db.notes.update(id, { ...patch, updatedAt: new Date().toISOString() })
}

export async function deleteNote(id: string): Promise<void> {
  await db.notes.delete(id)
}
