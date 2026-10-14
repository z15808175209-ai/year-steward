import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Lightbulb } from 'lucide-react'
import type { Routine, Category, TimeMode, Recurrence } from '../types'

interface Props {
  onClose: () => void
  onSave: (r: Routine) => void
}

export default function AddRoutine({ onClose, onSave }: Props) {
  const [title, setTitle] = useState('')
  const [timeMode, setTimeMode] = useState<TimeMode>('flexible')
  const [category, setCategory] = useState<Category>('morning')
  const [recurrence, setRecurrence] = useState<Recurrence>('daily')
  const [time, setTime] = useState('07:30')
  const [duration, setDuration] = useState(30)

  const handleSave = () => {
    if (!title.trim()) return
    const r: Routine = {
      id: 'r' + Date.now(),
      title,
      category,
      timeMode,
      recurrence,
      scheduledTime: timeMode === 'anchored' ? time : undefined,
      dueByTime: timeMode === 'flexible' ? '22:00' : undefined,
      duration,
      currentStreak: 0,
      longestStreak: 0,
      totalCompletions: 0,
      totalSkips: 0,
    }
    onSave(r)
  }

  const categoryOptions: { value: Category; label: string }[] = [
    { value: 'morning', label: '晨间' },
    { value: 'workout', label: '运动' },
    { value: 'work', label: '工作' },
    { value: 'evening', label: '晚间' },
    { value: 'sleep', label: '睡前' },
    { value: 'anytime', label: '随时' },
  ]

  const recurrenceOptions: { value: Recurrence; label: string }[] = [
    { value: 'daily', label: '每日' },
    { value: 'weekdays', label: '工作日' },
    { value: 'weekly', label: '每周' },
    { value: 'custom', label: '自定义' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-ash/30 backdrop-blur-sm z-50 flex items-center justify-center p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-soft w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-beige/30">
          <div>
            <div className="text-[10px] tracking-[1.5px] text-ash-light">新建 routine</div>
            <div className="text-base text-ash font-medium mt-0.5">添加固定任务</div>
          </div>
          <button onClick={onClose} className="text-ash-light hover:text-ash transition-colors">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Mode tabs */}
          <div className="flex bg-cream rounded-soft p-1">
            <button
              onClick={() => setTimeMode('anchored')}
              className={`flex-1 py-2 px-3 rounded-soft text-xs transition-all ${
                timeMode === 'anchored' ? 'bg-sakura text-ash font-medium' : 'text-ash-light'
              }`}
            >
              ⏰ 锚定时间
            </button>
            <button
              onClick={() => setTimeMode('flexible')}
              className={`flex-1 py-2 px-3 rounded-soft text-xs transition-all ${
                timeMode === 'flexible' ? 'bg-sakura text-ash font-medium' : 'text-ash-light'
              }`}
            >
              ☁️ 当天完成
            </button>
          </div>

          {/* Tip */}
          <div className="bg-cream border-l-2 border-sakura rounded p-3 flex gap-2">
            <Lightbulb size={14} strokeWidth={1.5} className="text-rose-urgent flex-shrink-0 mt-0.5" />
            <div className="text-[11px] text-ash leading-relaxed">
              <strong className="font-medium">上班族建议：</strong>选「☁️ 当天完成」模式更轻松，精力好就做、累了也不焦虑
            </div>
          </div>

          {/* Title */}
          <div>
            <div className="text-[10px] tracking-[1.5px] text-ash-light mb-1.5">标题</div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例：晨跑 30min"
              className="w-full bg-cream border border-beige/60 rounded-soft px-3 py-2 text-sm text-ash placeholder:text-ash-light focus:outline-none focus:border-sakura transition-colors"
            />
          </div>

          {/* Category */}
          <div>
            <div className="text-[10px] tracking-[1.5px] text-ash-light mb-1.5">分类</div>
            <div className="flex flex-wrap gap-1.5">
              {categoryOptions.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`px-3 py-1.5 rounded-pill text-[11px] transition-all ${
                    category === c.value
                      ? 'bg-sakura text-ash'
                      : 'bg-cream text-ash-light border border-beige/40 hover:border-ash-light'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recurrence */}
          <div>
            <div className="text-[10px] tracking-[1.5px] text-ash-light mb-1.5">重复</div>
            <div className="flex flex-wrap gap-1.5">
              {recurrenceOptions.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRecurrence(r.value)}
                  className={`px-3 py-1.5 rounded-pill text-[11px] transition-all ${
                    recurrence === r.value
                      ? 'bg-sakura text-ash'
                      : 'bg-cream text-ash-light border border-beige/40 hover:border-ash-light'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time + Duration */}
          {timeMode === 'anchored' ? (
            <div>
              <div className="text-[10px] tracking-[1.5px] text-ash-light mb-1.5">提醒时间</div>
              <div className="flex gap-2">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="flex-1 bg-cream border border-beige/60 rounded-soft px-3 py-2 text-sm text-ash focus:outline-none focus:border-sakura"
                />
                <div className="flex items-center gap-1 bg-cream border border-beige/60 rounded-soft px-3 py-2">
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-12 bg-transparent text-sm text-ash focus:outline-none"
                  />
                  <span className="text-xs text-ash-light">分</span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-[10px] tracking-[1.5px] text-ash-light mb-1.5">最晚完成时间（可选）</div>
              <div className="flex gap-2">
                <input
                  type="time"
                  defaultValue="22:00"
                  className="flex-1 bg-cream border border-beige/60 rounded-soft px-3 py-2 text-sm text-ash focus:outline-none focus:border-sakura"
                />
                <div className="flex items-center gap-1 bg-cream border border-beige/60 rounded-soft px-3 py-2">
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-12 bg-transparent text-sm text-ash focus:outline-none"
                  />
                  <span className="text-xs text-ash-light">分</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-3 border-t border-beige/30 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm text-ash-light hover:text-ash transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="flex-1 py-2.5 bg-sakura text-ash text-sm font-medium rounded-soft hover:bg-sakura/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            保存 routine
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
