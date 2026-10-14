import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, ListTodo, Timer, FileText, BarChart3, Plus } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Countdowns from './pages/Countdowns'
import Notes from './pages/Notes'
import Review from './pages/Review'
import AddRoutine from './pages/AddRoutine'
import { db, seedIfEmpty } from './db'
import type { Routine, Task } from './types'

type Page = 'dashboard' | 'tasks' | 'countdowns' | 'notes' | 'review'

export default function App() {
  const [page, setPage] = useState<Page>('dashboard')
  const [showAddRoutine, setShowAddRoutine] = useState(false)
  const [seeded, setSeeded] = useState(false)

  // 首次访问填充 mock 数据
  useEffect(() => {
    seedIfEmpty().then(() => setSeeded(true))
  }, [])

  // 实时从 IndexedDB 读取
  const routines = useLiveQuery(() => db.routines.toArray(), [], [])
  const tasks = useLiveQuery(() => db.tasks.toArray(), [], [])
  const countdowns = useLiveQuery(() => db.countdowns.toArray(), [], [])
  const notes = useLiveQuery(() => db.notes.toArray(), [], [])

  const toggleTask = async (id: string) => {
    const t = await db.tasks.get(id)
    if (!t) return
    await db.tasks.update(id, {
      done: !t.done,
      completedAt: !t.done ? new Date().toISOString() : undefined,
    })
  }

  const addRoutine = async (routine: Routine) => {
    await db.routines.put(routine)
    setShowAddRoutine(false)
  }

  // 完成 routine（累加统计 + 记录完成时间）
  const completeRoutine = async (id: string, state: 'done' | 'skip') => {
    const r = await db.routines.get(id)
    if (!r) return
    if (state === 'done') {
      await db.routines.update(id, {
        totalCompletions: r.totalCompletions + 1,
        currentStreak: r.currentStreak + 1,
        longestStreak: Math.max(r.longestStreak, r.currentStreak + 1),
      })
    } else {
      await db.routines.update(id, {
        totalSkips: r.totalSkips + 1,
        currentStreak: 0,
      })
    }
  }

  const navItems = [
    { id: 'dashboard' as Page, label: '今日', icon: LayoutDashboard },
    { id: 'tasks' as Page, label: '任务', icon: ListTodo },
    { id: 'countdowns' as Page, label: '倒计时', icon: Timer },
    { id: 'notes' as Page, label: '备忘录', icon: FileText },
    { id: 'review' as Page, label: '复盘', icon: BarChart3 },
  ]

  if (!seeded) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-ash-light text-sm tracking-wider">加载中…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-beige/40 flex flex-col py-6 px-4 sticky top-0 h-screen">
        <div className="px-2 mb-8">
          <div className="text-[10px] tracking-[2px] text-ash-light mb-1">YEAR · STEWARD</div>
          <div className="text-base text-ash font-medium">私人管家</div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = page === item.id
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-soft text-sm transition-all ${
                  active
                    ? 'bg-sakura text-ash font-medium'
                    : 'text-ash-light hover:bg-cream hover:text-ash'
                }`}
              >
                <Icon size={16} strokeWidth={1.5} />
                {item.label}
              </button>
            )
          })}
        </nav>

        <button
          onClick={() => setShowAddRoutine(true)}
          className="mt-4 bg-sakura hover:bg-sakura/80 transition-colors rounded-soft py-2.5 px-3 text-sm text-ash font-medium flex items-center justify-center gap-2"
        >
          <Plus size={16} strokeWidth={2} />
          新建 routine
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="h-full overflow-y-auto"
          >
            {page === 'dashboard' && (
              <Dashboard
                routines={routines}
                tasks={tasks}
                countdowns={countdowns}
                onToggleTask={toggleTask}
                onCompleteRoutine={completeRoutine}
                onAddRoutine={() => setShowAddRoutine(true)}
              />
            )}
            {page === 'tasks' && <Tasks tasks={tasks} onToggle={toggleTask} />}
            {page === 'countdowns' && <Countdowns countdowns={countdowns} />}
            {page === 'notes' && <Notes notes={notes} />}
            {page === 'review' && <Review routines={routines} tasks={tasks} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Add Routine Modal */}
      <AnimatePresence>
        {showAddRoutine && (
          <AddRoutine
            onClose={() => setShowAddRoutine(false)}
            onSave={addRoutine}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
