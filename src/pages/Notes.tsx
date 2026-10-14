import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, Tag, Check } from 'lucide-react'
import type { Note } from '../types'
import { createNote, deleteNote, parseTags, updateNote } from '../repo'
import { formatTimestamp } from '../lib/date'
import DeleteButton from '../components/DeleteButton'

interface Props {
  notes: Note[] | undefined
}

interface Draft {
  title: string
  content: string
  tagsText: string
}

export default function Notes({ notes = [] }: Props) {
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [justCreated, setJustCreated] = useState<string | null>(null)
  const draftRef = useRef<Draft | null>(null)

  const sorted = [...notes].sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''))
  const keyword = search.trim().toLowerCase()
  const filtered = keyword
    ? sorted.filter(
        (n) =>
          n.title.toLowerCase().includes(keyword) ||
          n.content.toLowerCase().includes(keyword) ||
          n.tags.some((t) => t.toLowerCase().includes(keyword)),
      )
    : sorted

  // 保证始终有一个有效的选中项
  useEffect(() => {
    if (notes.length === 0) {
      if (selectedId) setSelectedId(null)
      return
    }
    if (!selectedId || !notes.some((n) => n.id === selectedId)) {
      setSelectedId(notes[0].id)
    }
    // 只在选中项失效时纠正，不跟随内容变化
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes, selectedId])

  // 切换笔记时载入草稿
  useEffect(() => {
    const n = notes.find((x) => x.id === selectedId)
    const d = n ? { title: n.title, content: n.content, tagsText: n.tags.join(' ') } : null
    draftRef.current = d
    setDraft(d)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  const handleEdit = (patch: Partial<Draft>) => {
    const prev = draftRef.current
    if (!prev || !selectedId) return
    const next = { ...prev, ...patch }
    draftRef.current = next
    setDraft(next)
    updateNote(selectedId, {
      title: next.title,
      content: next.content,
      tags: parseTags(next.tagsText),
    })
  }

  const handleCreate = async () => {
    const id = await createNote()
    setJustCreated(id)
    setSelectedId(id)
    setSearch('')
  }

  const handleDelete = async (id: string) => {
    await deleteNote(id)
    if (selectedId === id) setSelectedId(null)
  }

  const selected = notes.find((n) => n.id === selectedId) ?? null

  return (
    <div className="max-w-5xl mx-auto px-10 py-10">
      <div className="mb-6">
        <div className="text-[11px] tracking-[2px] text-ash-light mb-2">手帐 · 灵感</div>
        <h1 className="text-3xl text-ash font-light">备忘录</h1>
        <p className="text-sm text-ash-light mt-2">随手写，自动保存 · 共 {notes.length} 条</p>
      </div>

      <div className="grid grid-cols-[280px_1fr] gap-6">
        {/* 列表 */}
        <div className="space-y-3">
          <div className="relative">
            <Search size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-ash-light" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索标题 / 内容 / 标签..."
              className="w-full bg-white border border-beige/60 rounded-soft pl-9 pr-3 py-2 text-sm text-ash placeholder:text-ash-light focus:outline-none focus:border-sakura"
            />
          </div>
          <button
            onClick={handleCreate}
            className="w-full bg-sakura rounded-soft py-2 text-sm text-ash font-medium flex items-center justify-center gap-2 hover:bg-sakura/80 transition-colors"
          >
            <Plus size={14} strokeWidth={2} />
            新建笔记
          </button>

          <div className="space-y-2 mt-4">
            {filtered.length === 0 && (
              <div className="text-xs text-ash-light text-center py-6">
                {keyword ? '没有匹配的笔记' : '还没有笔记'}
              </div>
            )}
            {filtered.map((n) => (
              <motion.div
                key={n.id}
                whileHover={{ x: 2 }}
                onClick={() => setSelectedId(n.id)}
                className={`p-3 rounded-soft cursor-pointer transition-all group ${
                  selectedId === n.id
                    ? 'bg-white border border-sakura'
                    : 'bg-white/60 hover:bg-white border border-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm text-ash font-medium mb-1 line-clamp-1">
                    {n.title || '未命名笔记'}
                  </div>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <DeleteButton onConfirm={() => handleDelete(n.id)} size={12} />
                  </span>
                </div>
                <div className="text-xs text-ash-light line-clamp-2 mb-2">
                  {n.content || '（空白）'}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-ash-light flex-wrap">
                  <span>{formatTimestamp(n.updatedAt)}</span>
                  {n.tags.map((t) => (
                    <span key={t} className="px-1.5 py-0.5 bg-cream rounded">
                      #{t}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 编辑区 */}
        <div>
          {selected && draft ? (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-soft p-8 border border-beige/40"
            >
              <input
                autoFocus={justCreated === selected.id}
                value={draft.title}
                onChange={(e) => handleEdit({ title: e.target.value })}
                placeholder="标题"
                className="w-full text-2xl text-ash font-light bg-transparent focus:outline-none placeholder:text-ash-light/60 mb-4"
              />

              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-beige/30">
                <Tag size={11} strokeWidth={1.5} className="text-ash-light flex-shrink-0" />
                <input
                  value={draft.tagsText}
                  onChange={(e) => handleEdit({ tagsText: e.target.value })}
                  placeholder="标签，空格分隔，例：工作 灵感"
                  className="flex-1 text-[11px] text-ash bg-transparent focus:outline-none placeholder:text-ash-light/70"
                />
                <span className="text-[10px] text-ash-light flex items-center gap-1 flex-shrink-0">
                  <Check size={10} strokeWidth={2} />
                  自动保存
                </span>
              </div>

              {draft.tagsText.trim() && (
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {parseTags(draft.tagsText).map((t) => (
                    <span key={t} className="text-[11px] px-2 py-0.5 bg-cream rounded-full text-ash">
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              <textarea
                value={draft.content}
                onChange={(e) => handleEdit({ content: e.target.value })}
                placeholder="写点什么…"
                rows={16}
                className="w-full text-sm text-ash leading-relaxed bg-transparent focus:outline-none resize-none placeholder:text-ash-light/60"
              />
            </motion.div>
          ) : (
            <div className="bg-cream/50 rounded-soft p-12 text-center text-ash-light text-sm">
              {notes.length === 0 ? '点「新建笔记」写下第一条' : '选择一条笔记查看'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
