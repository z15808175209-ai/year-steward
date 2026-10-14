// 数据类型定义

export type Priority = 'P0' | 'P1' | 'P2'
export type Category = 'morning' | 'workout' | 'work' | 'evening' | 'sleep' | 'anytime'
export type TimeMode = 'anchored' | 'flexible'
export type Recurrence = 'daily' | 'weekdays' | 'weekly' | 'custom'
export type CountdownCategory = 'personal' | 'work' | 'family'
export type DayState = 'done' | 'skip'

export interface Routine {
  id: string
  title: string
  category: Category
  timeMode: TimeMode
  recurrence: Recurrence
  scheduledTime?: string        // anchored 必填
  dueByTime?: string            // flexible 可选
  duration: number
  // 以下四项由 routineLogs 实时算出（见 repo.refreshRoutineStats）
  currentStreak: number
  longestStreak: number
  totalCompletions: number
  totalSkips: number
}

/** 每条 routine 每天最多一条记录，id = `${routineId}_${date}` */
export interface RoutineLog {
  id: string
  routineId: string
  date: string                  // YYYY-MM-DD
  state: DayState
}

export interface Task {
  id: string
  title: string
  priority: Priority
  dueDate?: string              // YYYY-MM-DD
  pinned: boolean
  done: boolean
  completedAt?: string          // ISO datetime，复盘按此聚合
}

export interface Countdown {
  id: string
  title: string
  date: string                  // YYYY-MM-DD
  category: CountdownCategory
}

export interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  updatedAt: string             // ISO datetime
}
