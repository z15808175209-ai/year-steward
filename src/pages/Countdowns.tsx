import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Calendar, Pencil } from 'lucide-react'
import type { Countdown, CountdownCategory } from '../types'
import { deleteCountdown } from '../repo'
import { daysUntil } from '../lib/date'
import CountdownModal from '../components/CountdownModal'
import DeleteButton from '../components/DeleteButton'

interface Props {
  countdowns: Countdown[] | undefined
}

const CATEGORY_LABEL: Record<CountdownCategory, string> = {
  personal: '个人',
  work: '工作',
  family: '家人',
}

function urgencyStyle(days: number) {
  if (days < 0) return { color: 'text-ash-light', bg: 'bg-cream/60', label: '已过去' }
  if (days <= 7) return { color: 'text-rose-urgent', bg: 'bg-rose-urgent/10', label: '紧急' }
  if (days <= 30) return { color: 'text-[#C8854D]', bg: 'bg-[#E8A878]/15', label: '提醒' }
  return { color: 'text-[#5A8FA8]', bg: 'bg-[#A8C8D8]/20', label: '远期' }
}

export default function Countdowns({ countdowns = [] }: Props) {
  const [modal, setModal] = useState<{ open: boolean; editing?: Countdown }>({ open: false })

  const sorted = [...countdowns].sort((a, b) => {
    const da = daysUntil(a.date)
    const db = daysUntil(b.date)
    // 未来的正序，过去的排到最后
    if (da < 0 && db >= 0) return 1
    if (db < 0 && da >= 0) return -1
    return da - db
  })

  return (
    <div className="max-w-4xl mx-auto px-10 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="text-[11px] tracking-[2px] text-ash-light mb-2">重要日期</div>
          <h1 className="text-3xl text-ash font-light">倒计时</h1>
          <p className="text-sm text-ash-light mt-2">颜色随紧急度变化 · 不会再忘记</p>
        </div>
        <button
          onClick={() => setModal({ open: true })}
          className="bg-sakura rounded-soft px-4 py-2 text-sm text-ash font-medium flex items-center gap-2 hover:bg-sakura/80 transition-colors"
        >
          <Plus size={14} strokeWidth={2} />
          新建倒计时
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white/60 border border-dashed border-beige/60 rounded-soft p-12 text-center text-sm text-ash-light">
          还没有重要日期，添加一个吧 🌷
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {sorted.map((c) => {
            const days = daysUntil(c.date)
            const style = urgencyStyle(days)
            return (
              <motion.div
                key={c.id}
                layout
                whileHover={{ y: -2 }}
                className={`${style.bg} rounded-soft p-6 group relative transition-all`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className={`text-4xl font-light ${style.color} mb-2`}>
                      {days > 0 ? days : Math.abs(days)}
                    </div>
                    <div className="text-base text-ash">{c.title}</div>
                    <div className="text-[10px] text-ash-light mt-1 flex items-center gap-1">
                      <Calendar size={10} strokeWidth={1.5} />
                      {c.date} · {CATEGORY_LABEL[c.category]}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-[10px] px-2 py-1 rounded-full ${style.bg} ${style.color}`}>
                      {style.label}
                    </span>
                    <span className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setModal({ open: true, editing: c })}
                        title="编辑"
                        className="text-ash-light hover:text-ash transition-colors"
                      >
                        <Pencil size={13} strokeWidth={1.5} />
                      </button>
                      <DeleteButton onConfirm={() => deleteCountdown(c.id)} />
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <AnimatePresence>
        {modal.open && (
          <CountdownModal countdown={modal.editing} onClose={() => setModal({ open: false })} />
        )}
      </AnimatePresence>
    </div>
  )
}
