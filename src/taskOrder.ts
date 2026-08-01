import type { Task } from './db'

export function swapTaskOrder(
  tasks: Task[],
  taskId: number,
  direction: 'up' | 'down',
): Task[] | null {
  const index = tasks.findIndex((task) => task.id === taskId)
  if (index === -1) {
    return null
  }

  const targetIndex = direction === 'up' ? index - 1 : index + 1
  if (targetIndex < 0 || targetIndex >= tasks.length) {
    return null
  }

  const next = [...tasks]
  const current = next[index]
  const target = next[targetIndex]
  next[index] = { ...target, sort_order: current.sort_order }
  next[targetIndex] = { ...current, sort_order: target.sort_order }
  return next
}
