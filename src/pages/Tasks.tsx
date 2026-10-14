import { motion } from 'framer-motion'
import { Check, Pin, Plus } from 'lucide-react'
import type { Task } from '../types'

interface Props {
  tasks: Task[] | undefined
  onToggle: (id: string) => void
}

export default function Tasks({ tasks = [], onToggle }: Props) {
  const active = tasks.filter((t) => !t.done)
  const completed = tasks.filter((t) => t.done)

  return (
    <div className="max-w-3xl mx-auto px-10 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="text-[11px] tracking-[2px] text-ash-light mb-2">弹性任务 · 80%</div>
          <h1 className="text-3xl text-ash font-light">任务清单</h1>
          <p className="text-sm text-ash-light mt-2">{active.length} 个待办 · {completed.length} 个已完成</p>
        </div>
        <button className="bg-sakura rounded-soft px-4 py-2 text-sm text-ash font-medium flex items-center gap-2 hover:bg-sakura/80 transition-colors">
          <Plus size={14} strokeWidth={2} />
          新建任务
        </button>
      </div>

      {/* Active */}
      <div className="space-y-2 mb-8">
        {active.map((t) => (
          <motion.div
            key={t.id}
            whileHover={{ x: 2 }}
            onClick={() => onToggle(t.id)}
            className="bg-white rounded-soft p-4 cursor-pointer flex items-center gap-3 group hover:shadow-sm transition-shadow"
          >
            <button
              onClick={(e) => { e.stopPropagation(); onToggle(t.id) }}
              className="w-5 h-5 rounded-full border-2 border-beige hover:border-ash-light flex items-center justify-center transition-all flex-shrink-0"
            />
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
              t.priority === 'P0' ? 'bg-rose-urgent' : t.priority === 'P1' ? 'bg-[#E8A878]' : 'bg-beige'
            }`}></span>
            <span className="text-sm text-ash flex-1">{t.title}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              t.priority === 'P0' ? 'bg-rose-urgent/15 text-rose-urgent' :
              t.priority === 'P1' ? 'bg-[#E8A878]/15 text-[#C8854D]' :
              'bg-beige/30 text-ash-light'
            }`}>
              {t.priority}
            </span>
            {t.dueDate && (
              <span className="text-[10px] text-ash-light">{t.dueDate}</span>
            )}
            {t.pinned && <Pin size={12} strokeWidth={1.5} className="text-ash-light" />}
          </motion.div>
        ))}
      </div>

      {/* Completed */}
      {completed.length > 0 && (
        <>
          <div className="text-[11px] tracking-[1.5px] text-ash-light mb-3">已完成 · {completed.length}</div>
          <div className="space-y-2">
            {completed.map((t) => (
              <motion.div
                key={t.id}
                onClick={() => onToggle(t.id)}
                className="bg-cream/50 rounded-soft p-4 cursor-pointer flex items-center gap-3 group"
              >
                <button className="w-5 h-5 rounded-full bg-sage-done flex items-center justify-center flex-shrink-0">
                  <Check size={12} strokeWidth={3} className="text-white" />
                </button>
                <span className="text-sm text-ash-light line-through flex-1">{t.title}</span>
                {t.completedAt && (
                  <span className="text-[10px] text-ash-light">{t.completedAt}</span>
                )}
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
