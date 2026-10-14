import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, Tag } from 'lucide-react'
import type { Note } from '../types'

interface Props {
  notes: Note[] | undefined
}

export default function Notes({ notes = [] }: Props) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Note | null>(notes[0] || null)

  const filtered = notes.filter((n) =>
    n.title.includes(search) || n.content.includes(search) || n.tags.some((t) => t.includes(search))
  )

  return (
    <div className="max-w-5xl mx-auto px-10 py-10">
      <div className="mb-6">
        <div className="text-[11px] tracking-[2px] text-ash-light mb-2">手帐 · 灵感</div>
        <h1 className="text-3xl text-ash font-light">备忘录</h1>
      </div>

      <div className="grid grid-cols-[280px_1fr] gap-6">
        {/* List */}
        <div className="space-y-3">
          <div className="relative">
            <Search size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-ash-light" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索笔记..."
              className="w-full bg-white border border-beige/60 rounded-soft pl-9 pr-3 py-2 text-sm text-ash placeholder:text-ash-light focus:outline-none focus:border-sakura"
            />
          </div>
          <button className="w-full bg-sakura rounded-soft py-2 text-sm text-ash font-medium flex items-center justify-center gap-2 hover:bg-sakura/80 transition-colors">
            <Plus size={14} strokeWidth={2} />
            新建笔记
          </button>

          <div className="space-y-2 mt-4">
            {filtered.map((n) => (
              <motion.div
                key={n.id}
                whileHover={{ x: 2 }}
                onClick={() => setSelected(n)}
                className={`p-3 rounded-soft cursor-pointer transition-all ${
                  selected?.id === n.id ? 'bg-white border border-sakura' : 'bg-white/60 hover:bg-white border border-transparent'
                }`}
              >
                <div className="text-sm text-ash font-medium mb-1">{n.title}</div>
                <div className="text-xs text-ash-light line-clamp-2 mb-2">{n.content}</div>
                <div className="flex items-center gap-2 text-[10px] text-ash-light">
                  <span>{n.updatedAt}</span>
                  {n.tags.map((t) => (
                    <span key={t} className="px-1.5 py-0.5 bg-cream rounded">#{t}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Detail */}
        <div>
          {selected ? (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-soft p-8 border border-beige/40"
            >
              <div className="text-2xl text-ash font-light mb-4">{selected.title}</div>
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-beige/30">
                <Tag size={11} strokeWidth={1.5} className="text-ash-light" />
                {selected.tags.map((t) => (
                  <span key={t} className="text-[11px] px-2 py-0.5 bg-cream rounded-full text-ash">#{t}</span>
                ))}
              </div>
              <div className="text-sm text-ash leading-relaxed whitespace-pre-wrap">
                {selected.content}
              </div>
            </motion.div>
          ) : (
            <div className="bg-cream/50 rounded-soft p-12 text-center text-ash-light">
              选择一条笔记查看详情
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
