import type { Task } from './db'
import { getDatabase } from './database'
import { taskDeletionMode, shouldPurgeLogicallyDeletedTask, type TaskDeletionMode } from './taskDeletion'
import { swapTaskOrder } from './taskOrder'

type InsertResult = {
  lastInsertId: number
}

const TASK_SELECT = 'SELECT id, title, active, sort_order, deleted FROM tasks'
const VISIBLE_TASKS_WHERE = 'WHERE deleted = 0'

export async function listAllTasks(): Promise<Task[]> {
  const database = await getDatabase()
  return database.select<Task[]>(
    `${TASK_SELECT} ORDER BY sort_order ASC, id ASC`,
  )
}

export async function listVisibleTasks(): Promise<Task[]> {
  const database = await getDatabase()
  return database.select<Task[]>(
    `${TASK_SELECT} ${VISIBLE_TASKS_WHERE} ORDER BY sort_order ASC, id ASC`,
  )
}

export async function listActiveTasks(): Promise<Task[]> {
  const database = await getDatabase()
  return database.select<Task[]>(
    `${TASK_SELECT} WHERE active = 1 AND deleted = 0 ORDER BY sort_order ASC, id ASC`,
  )
}

export async function addTask(title: string): Promise<Task> {
  const trimmed = title.trim()
  if (trimmed.length === 0) {
    throw new Error('タスク名を入力してください')
  }

  const database = await getDatabase()
  const rows = await database.select<Array<{ max_order: number | null }>>(
    'SELECT MAX(sort_order) AS max_order FROM tasks WHERE deleted = 0',
  )
  const nextOrder = (rows[0]?.max_order ?? 0) + 1

  const result = await database.execute(
    'INSERT INTO tasks (title, active, sort_order, deleted) VALUES ($1, 1, $2, 0)',
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
    'UPDATE tasks SET active = $1 WHERE id = $2 AND deleted = 0',
    [active ? 1 : 0, taskId],
  )
}

/** 提案候補に出すか（DB の active=1） */
export function isTaskSuggested(task: Pick<Task, 'active'>): boolean {
  return task.active === 1
}

/** 「しばらくは出さない」がオンか（active=0） */
export function isTaskPaused(task: Pick<Task, 'active'>): boolean {
  return !isTaskSuggested(task)
}

export async function setTaskPaused(taskId: number, paused: boolean): Promise<void> {
  await setTaskActive(taskId, !paused)
}

export async function updateTaskTitle(taskId: number, title: string): Promise<void> {
  const trimmed = title.trim()
  if (trimmed.length === 0) {
    throw new Error('タスク名を入力してください')
  }

  const database = await getDatabase()
  await database.execute(
    'UPDATE tasks SET title = $1 WHERE id = $2 AND deleted = 0',
    [trimmed, taskId],
  )
}

export async function moveTask(taskId: number, direction: 'up' | 'down'): Promise<void> {
  const tasks = await listVisibleTasks()
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

export async function countTaskDoneExecutions(taskId: number): Promise<number> {
  const database = await getDatabase()
  const rows = await database.select<Array<{ count: number }>>(
    `SELECT COUNT(*) AS count
     FROM suggestions
     WHERE task_id = $1 AND done_at IS NOT NULL`,
    [taskId],
  )

  return rows[0]?.count ?? 0
}

export async function previewTaskDeletion(taskId: number): Promise<TaskDeletionMode> {
  const doneCount = await countTaskDoneExecutions(taskId)
  return taskDeletionMode(doneCount)
}

export async function deleteTask(taskId: number): Promise<TaskDeletionMode> {
  const database = await getDatabase()
  const doneCount = await countTaskDoneExecutions(taskId)
  const mode = taskDeletionMode(doneCount)

  if (mode === 'physical') {
    await database.execute('DELETE FROM suggestions WHERE task_id = $1', [taskId])
    await database.execute('DELETE FROM tasks WHERE id = $1', [taskId])
    return mode
  }

  await database.execute(
    'UPDATE tasks SET active = 0, deleted = 1 WHERE id = $1',
    [taskId],
  )
  return mode
}

export async function purgeLogicallyDeletedTaskIfNoDoneHistory(taskId: number): Promise<boolean> {
  const database = await getDatabase()
  const rows = await database.select<Array<{ deleted: number }>>(
    'SELECT deleted FROM tasks WHERE id = $1',
    [taskId],
  )
  const task = rows[0]
  if (task === undefined) {
    return false
  }

  const doneCount = await countTaskDoneExecutions(taskId)
  if (!shouldPurgeLogicallyDeletedTask(task, doneCount)) {
    return false
  }

  await database.execute('DELETE FROM suggestions WHERE task_id = $1', [taskId])
  await database.execute('DELETE FROM tasks WHERE id = $1', [taskId])
  return true
}
