import { loadTaskScores } from './suggest'
import { listAllTasks } from './tasks'
import {
  buildTaskStats,
  formatRate,
  TIME_BAND_LABELS,
  type TaskStat,
} from './statsLogic'

export type { TaskStat } from './statsLogic'
export { formatRate, TIME_BAND_LABELS }

export async function loadTaskStats(): Promise<TaskStat[]> {
  const tasks = await listAllTasks()
  const scoresByBand = {
    morning: await loadTaskScores('morning'),
    afternoon: await loadTaskScores('afternoon'),
    evening: await loadTaskScores('evening'),
  }

  return buildTaskStats(tasks, scoresByBand)
}
