import { useState } from 'react'
import { Trash2 } from 'lucide-react'

interface Props {
  onConfirm: () => void
  size?: number
  className?: string
  title?: string
}

/** 两步确认删除：先点垃圾桶，再点「删除」，避免误删 */
export default function DeleteButton({ onConfirm, size = 13, className = '', title = '删除' }: Props) {
  const [confirming, setConfirming] = useState(false)

  if (confirming) {
    return (
      <span className={`flex items-center gap-1 ${className}`}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setConfirming(false)
          }}
          className="px-1.5 py-0.5 rounded-pill text-[10px] text-ash-light hover:text-ash transition-colors"
        >
          取消
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onConfirm()
          }}
          className="px-1.5 py-0.5 rounded-pill text-[10px] bg-rose-urgent/15 text-rose-urgent hover:bg-rose-urgent/25 transition-colors"
        >
          删除
        </button>
      </span>
    )
  }

  return (
    <button
      type="button"
      title={title}
      onClick={(e) => {
        e.stopPropagation()
        setConfirming(true)
      }}
      className={`text-ash-light hover:text-rose-urgent transition-colors ${className}`}
    >
      <Trash2 size={size} strokeWidth={1.5} />
    </button>
  )
}
