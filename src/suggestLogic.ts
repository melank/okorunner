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

export function pickTask(
  tasks: Task[],
  scores: Map<number, TaskScore>,
  random: () => number,
): Task {
  if (tasks.length === 0) {
    throw new Error('提案できるタスクがありません')
  }

  if (random() < EPSILON) {
    const index = Math.floor(random() * tasks.length)
    return tasks[index]
  }

  let bestRate = -1
  let candidates: Task[] = []

  for (const task of tasks) {
    const rate = motivatedRate(scores.get(task.id))

    if (rate > bestRate) {
      bestRate = rate
      candidates = [task]
      continue
    }

    if (rate === bestRate) {
      candidates.push(task)
    }
  }

  const index = Math.floor(random() * candidates.length)
  return candidates[index]
}
