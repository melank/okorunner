export type TimeBand = 'morning' | 'afternoon' | 'evening'

export const TIME_BAND_LABELS: Record<TimeBand, string> = {
  morning: '朝',
  afternoon: '昼',
  evening: '夜',
}

export function getTimeBand(date: Date): TimeBand {
  const hour = date.getHours()

  if (hour >= 5 && hour < 12) {
    return 'morning'
  }

  if (hour >= 12 && hour < 18) {
    return 'afternoon'
  }

  return 'evening'
}

export function formatLocalDateTime(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0')

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('-').concat(
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`,
  )
}
