import { Plus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Props {
  icon: LucideIcon
  title: string
  hint?: string
  actionLabel?: string
  onAction?: () => void
}

/**
 * 统一空白态：图标 + 标题 + 引导文案 + 醒目 CTA 按钮。
 * 4 个核心页面（任务/倒计时/备忘录/复盘）都共用。
 */
export default function EmptyState({ icon: Icon, title, hint, actionLabel, onAction }: Props) {
  return (
    <div className="bg-white/70 border border-dashed border-beige/70 rounded-soft p-14 text-center">
      <div className="w-20 h-20 mx-auto bg-sakura/40 rounded-full flex items-center justify-center mb-5">
        <Icon size={30} strokeWidth={1.5} className="text-rose-urgent" />
      </div>
      <div className="text-base text-ash font-medium mb-2">{title}</div>
      {hint && (
        <div className="text-xs text-ash-light mb-7 max-w-xs mx-auto leading-relaxed">{hint}</div>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-sakura hover:bg-sakura/80 transition-colors rounded-soft px-5 py-2.5 text-sm text-ash font-medium inline-flex items-center gap-2"
        >
          <Plus size={14} strokeWidth={2} />
          {actionLabel}
        </button>
      )}
    </div>
  )
}
