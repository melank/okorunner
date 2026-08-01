import type { Task } from './db'

export const EPSILON = 0.2
export const DEFAULT_MOTIVATED_RATE = 0.5

export type TaskScore = {
  motivated: number
  done: number
}

export function motivatedRate(score: TaskScore | undefined): number {
  if (!score || score.done === 0) {
    return DEFAULT_MOTIVATED_RATE
  }

  return score.motivated / score.done
}

export function filterTasks(tasks: Task[], excludeTaskIds: Iterable<number>): Task[] {
  const excluded = new Set(excludeTaskIds)
  if (excluded.size === 0) {
    return tasks
  }

  const filtered = tasks.filter((task) => !excluded.has(task.id))
  return filtered.length > 0 ? filtered : tasks
}

export function pickTask(
  tasks: Task[],
  scores: Map<number, TaskScore>,
  random: () => number,
  excludeTaskIds: number[] = [],
  epsilon: number = EPSILON,
): Task {
  const candidates = filterTasks(tasks, excludeTaskIds)

  if (candidates.length === 0) {
    throw new Error('提案できるタスクがありません')
  }

  if (random() < epsilon) {
    const index = Math.floor(random() * candidates.length)
    return candidates[index]
  }

  let bestRate = -1
  let bestCandidates: Task[] = []

  for (const task of candidates) {
    const rate = motivatedRate(scores.get(task.id))

    if (rate > bestRate) {
      bestRate = rate
      bestCandidates = [task]
      continue
    }

    if (rate === bestRate) {
      bestCandidates.push(task)
    }
  }

  const index = Math.floor(random() * bestCandidates.length)
  return bestCandidates[index]
}
