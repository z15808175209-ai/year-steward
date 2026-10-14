import { motion } from 'framer-motion'

const PULSE = {
  initial: { opacity: 0.4 },
  animate: { opacity: 0.85 },
  transition: {
    duration: 1.2,
    repeat: Infinity,
    repeatType: 'reverse' as const,
    ease: 'easeInOut',
  },
}

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <motion.div
      initial={PULSE.initial}
      animate={PULSE.animate}
      transition={PULSE.transition}
      className={`rounded-soft bg-beige/50 ${className}`}
    />
  )
}

export function SkeletonRow() {
  return (
    <div className="bg-white rounded-soft p-4 flex items-center gap-3">
      <Skeleton className="w-5 h-5 rounded-full flex-shrink-0" />
      <Skeleton className="h-3 flex-1" />
      <Skeleton className="h-3 w-12 flex-shrink-0" />
    </div>
  )
}

export function SkeletonCard({ tall = false }: { tall?: boolean }) {
  return (
    <div className="bg-white border border-beige/40 rounded-soft p-6">
      <Skeleton className="h-8 w-16 mb-3" />
      <Skeleton className="h-3 w-3/4 mb-2" />
      <Skeleton className={`h-3 ${tall ? 'w-full' : 'w-1/2'}`} />
    </div>
  )
}
