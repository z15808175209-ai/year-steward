// 日期工具：全部以「本地时区 + YYYY-MM-DD」为准，避免 UTC 偏移导致的差一天

export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayISO(): string {
  return toISODate(new Date())
}

/** 把 YYYY-MM-DD 解析为本地零点 */
export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** 距今天数：正数=未来，0=今天，负数=已过 */
export function daysUntil(iso: string): number {
  const target = fromISODate(iso).getTime()
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  return Math.round((target - start) / 86400000)
}

export function shiftDate(iso: string, days: number): string {
  const d = fromISODate(iso)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

/** 「今天 / 明天 / 周三 / 10月20日 / 2027/1/8」 */
export function formatFriendly(iso: string): string {
  const diff = daysUntil(iso)
  if (diff === 0) return '今天'
  if (diff === 1) return '明天'
  if (diff === 2) return '后天'
  if (diff === -1) return '昨天'
  const d = fromISODate(iso)
  if (diff > 0 && diff < 7) return `周${WEEKDAYS[d.getDay()]}`
  if (d.getFullYear() === new Date().getFullYear()) return `${d.getMonth() + 1}月${d.getDate()}日`
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
}

export function isOverdue(iso: string): boolean {
  return daysUntil(iso) < 0
}

/** 时间戳（ISO datetime）的友好显示：今天显示 HH:mm，否则显示日期 */
export function formatTimestamp(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  if (sameDay) {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }
  return formatFriendly(toISODate(d))
}

/** 最近 N 天（含今天）的 ISO 日期数组，按时间正序 */
export function lastNDays(n: number): string[] {
  const out: string[] = []
  const cursor = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(cursor)
    d.setDate(d.getDate() - i)
    out.push(toISODate(d))
  }
  return out
}
