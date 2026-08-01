import type { Task } from './db'
import { getDatabase } from './database'
import { swapTaskOrder } from './taskOrder'

type InsertResult = {
  lastInsertId: number
}

const TASK_SELECT = 'SELECT id, title, active, sort_order FROM tasks'

export async function listAllTasks(): Promise<Task[]> {
  const database = await getDatabase()
  return database.select<Task[]>(
    `${TASK_SELECT} ORDER BY sort_order ASC, id ASC`,
  )
}

export async function listActiveTasks(): Promise<Task[]> {
  const database = await getDatabase()
  return database.select<Task[]>(
    `${TASK_SELECT} WHERE active = 1 ORDER BY sort_order ASC, id ASC`,
  )
}

export async function addTask(title: string): Promise<Task> {
  const trimmed = title.trim()
  if (trimmed.length === 0) {
    throw new Error('タスク名を入力してください')
  }

  const database = await getDatabase()
  const rows = await database.select<Array<{ max_order: number | null }>>(
    'SELECT MAX(sort_order) AS max_order FROM tasks',
  )
  const nextOrder = (rows[0]?.max_order ?? 0) + 1

  const result = await database.execute(
    'INSERT INTO tasks (title, active, sort_order) VALUES ($1, 1, $2)',
    [trimmed, nextOrder],
  )

  const taskId = (result as InsertResult).lastInsertId
  const created = await database.select<Task[]>(
    `${TASK_SELECT} WHERE id = $1`,
    [taskId],
  )
  const task = created[0]
  if (task === undefined) {
    throw new Error('タスクの作成に失敗しました')
  }

  return task
}

export async function setTaskActive(taskId: number, active: boolean): Promise<void> {
  const database = await getDatabase()
  await database.execute(
    'UPDATE tasks SET active = $1 WHERE id = $2',
    [active ? 1 : 0, taskId],
  )
}

export async function updateTaskTitle(taskId: number, title: string): Promise<void> {
  const trimmed = title.trim()
  if (trimmed.length === 0) {
    throw new Error('タスク名を入力してください')
  }

  const database = await getDatabase()
  await database.execute(
    'UPDATE tasks SET title = $1 WHERE id = $2',
    [trimmed, taskId],
  )
}

export async function moveTask(taskId: number, direction: 'up' | 'down'): Promise<void> {
  const tasks = await listAllTasks()
  const reordered = swapTaskOrder(tasks, taskId, direction)
  if (reordered === null) {
    return
  }

  const database = await getDatabase()
  for (const task of reordered) {
    await database.execute(
      'UPDATE tasks SET sort_order = $1 WHERE id = $2',
      [task.sort_order, task.id],
    )
  }
}
