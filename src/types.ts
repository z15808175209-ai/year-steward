// 数据类型定义

export type Priority = 'P0' | 'P1' | 'P2'
export type Category = 'morning' | 'workout' | 'work' | 'evening' | 'sleep' | 'anytime'
export type TimeMode = 'anchored' | 'flexible'
export type Recurrence = 'daily' | 'weekdays' | 'weekly' | 'custom'

export interface Routine {
  id: string
  title: string
  category: Category
  timeMode: TimeMode
  recurrence: Recurrence
  scheduledTime?: string        // anchored 必填
  dueByTime?: string            // flexible 可选
  duration: number
  currentStreak: number
  longestStreak: number
  totalCompletions: number
  totalSkips: number
}

export interface Task {
  id: string
  title: string
  priority: Priority
  dueDate?: string
  pinned: boolean
  done: boolean
  completedAt?: string
}

export interface Countdown {
  id: string
  title: string
  date: string
  category: 'personal' | 'work' | 'family'
}

export interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  updatedAt: string
}
