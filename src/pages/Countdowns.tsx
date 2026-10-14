import { motion } from 'framer-motion'
import { Plus, Calendar } from 'lucide-react'
import type { Countdown } from '../types'

interface Props {
  countdowns: Countdown[] | undefined
}

function daysUntil(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function urgencyStyle(days: number) {
  if (days < 0) return { color: 'text-ash-light', bg: 'bg-cream/50', label: '已过去' }
  if (days <= 7) return { color: 'text-rose-urgent', bg: 'bg-rose-urgent/10', label: '紧急' }
  if (days <= 30) return { color: 'text-[#C8854D]', bg: 'bg-[#E8A878]/15', label: '提醒' }
  return { color: 'text-[#5A8FA8]', bg: 'bg-[#A8C8D8]/20', label: '远期' }
}

export default function Countdowns({ countdowns = [] }: Props) {
  return (
    <div className="max-w-4xl mx-auto px-10 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="text-[11px] tracking-[2px] text-ash-light mb-2">重要日期</div>
          <h1 className="text-3xl text-ash font-light">倒计时</h1>
          <p className="text-sm text-ash-light mt-2">颜色随紧急度变化 · 不会再忘记</p>
        </div>
        <button className="bg-sakura rounded-soft px-4 py-2 text-sm text-ash font-medium flex items-center gap-2 hover:bg-sakura/80 transition-colors">
          <Plus size={14} strokeWidth={2} />
          新建倒计时
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {countdowns.map((c) => {
          const days = daysUntil(c.date)
          const style = urgencyStyle(days)
          return (
            <motion.div
              key={c.id}
              whileHover={{ y: -2 }}
              className={`${style.bg} rounded-soft p-6 cursor-pointer transition-all`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className={`text-4xl font-light ${style.color} mb-2`}>
                    {days > 0 ? days : Math.abs(days)}
                  </div>
                  <div className="text-base text-ash">{c.title}</div>
                  <div className="text-[10px] text-ash-light mt-1 flex items-center gap-1">
                    <Calendar size={10} strokeWidth={1.5} />
                    {c.date} · {c.category === 'work' ? '工作' : c.category === 'family' ? '家人' : '个人'}
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-full ${style.bg} ${style.color}`}>
                  {style.label}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
