export type TimeBand = 'morning' | 'afternoon' | 'evening'

export const TIME_BAND_LABELS: Record<TimeBand, string> = {
  morning: '朝',
  afternoon: '昼',
  evening: '夜',
}

const DEFAULT_MOTIVATED_RATE = 0.5

type TaskScore = {
  motivated: number
  done: number
}

export type BandStat = {
  motivated: number
  done: number
  rate: number
}

export type TaskStat = {
  taskId: number
  title: string
  active: boolean
  bands: Record<TimeBand, BandStat>
}

const TIME_BANDS: TimeBand[] = ['morning', 'afternoon', 'evening']

function motivatedRate(score: TaskScore | undefined): number {
  if (!score || score.done === 0) {
    return DEFAULT_MOTIVATED_RATE
  }

  return score.motivated / score.done
}

export function buildTaskStats(
  tasks: Array<{ id: number; title: string; active: number }>,
  scoresByBand: Record<TimeBand, Map<number, TaskScore>>,
): TaskStat[] {
  return tasks.map((task) => {
    const bands = TIME_BANDS.reduce((accumulator, band) => {
      const score = scoresByBand[band].get(task.id)
      accumulator[band] = {
        motivated: score?.motivated ?? 0,
        done: score?.done ?? 0,
        rate: motivatedRate(score),
      }
      return accumulator
    }, {} as Record<TimeBand, BandStat>)

    return {
      taskId: task.id,
      title: task.title,
      active: task.active === 1,
      bands,
    }
  })
}

export function formatRate(rate: number): string {
  return `${Math.round(rate * 100)}%`
}
