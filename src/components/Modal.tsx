import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'

interface Props {
  subtitle?: string
  title: string
  onClose: () => void
  children: ReactNode
  footer: ReactNode
}

export default function Modal({ subtitle, title, onClose, children, footer }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 bg-ash/25 backdrop-blur-sm z-50 flex items-center justify-center p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.18 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-soft w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden"
      >
        <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-beige/30 flex-shrink-0">
          <div>
            {subtitle && <div className="text-[10px] tracking-[1.5px] text-ash-light">{subtitle}</div>}
            <div className="text-base text-ash font-medium mt-0.5">{title}</div>
          </div>
          <button onClick={onClose} className="text-ash-light hover:text-ash transition-colors">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">{children}</div>

        <div className="px-6 pb-5 pt-3 border-t border-beige/30 flex gap-2 flex-shrink-0">{footer}</div>
      </motion.div>
    </motion.div>
  )
}
