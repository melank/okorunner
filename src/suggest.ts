import { getDatabase } from './database'
import { pickTask } from './suggestLogic'
import { getEpsilon } from './settings'
import { listActiveTasks, purgeLogicallyDeletedTaskIfNoDoneHistory } from './tasks'
import {
  formatLocalDateTime,
  getTimeBand,
  TIME_BAND_LABELS,
  type TimeBand,
} from './timeBand'

type InsertResult = {
  lastInsertId: number
}

type SuggestionHistoryRow = {
  task_id: number
  suggested_at: string
  motivated: number | null
}

type PendingSuggestionRow = {
  id: number
  task_id: number
  title: string
  suggested_at: string
}

export type Suggestion = {
  id: number
  taskId: number
  title: string
  timeBand: TimeBand
  suggestedAt: string
}

export type RecentCompletion = {
  id: number
  taskId: number
  title: string
  timeBand: TimeBand
  doneAt: string
  motivated: boolean
}

type CompletedSuggestionRow = {
  id: number
  task_id: number
  title: string
  suggested_at: string
  done_at: string
  motivated: number | null
}

export async function loadTaskScores(
  timeBand: TimeBand,
): Promise<Map<number, { motivated: number; done: number }>> {
  const database = await getDatabase()
  const rows = await database.select<SuggestionHistoryRow[]>(
    `SELECT task_id, suggested_at, motivated
     FROM suggestions
     WHERE done_at IS NOT NULL`,
  )

  const scores = new Map<number, { motivated: number; done: number }>()

  for (const row of rows) {
    const band = getTimeBand(new Date(row.suggested_at))
    if (band !== timeBand) {
      continue
    }

    const current = scores.get(row.task_id) ?? { motivated: 0, done: 0 }
    current.done += 1
    if (row.motivated === 1) {
      current.motivated += 1
    }
    scores.set(row.task_id, current)
  }

  return scores
}

export async function getCurrentSuggestion(): Promise<Suggestion | null> {
  const database = await getDatabase()
  const rows = await database.select<PendingSuggestionRow[]>(
    `SELECT s.id, s.task_id, t.title, s.suggested_at
     FROM suggestions s
     INNER JOIN tasks t ON t.id = s.task_id
     WHERE s.done_at IS NULL
     ORDER BY s.suggested_at DESC
     LIMIT 1`,
  )

  const row = rows[0]
  if (row === undefined) {
    return null
  }

  return {
    id: row.id,
    taskId: row.task_id,
    title: row.title,
    timeBand: getTimeBand(new Date(row.suggested_at)),
    suggestedAt: row.suggested_at,
  }
}

export async function completeSuggestion(
  suggestionId: number,
  motivated: boolean,
  now: Date = new Date(),
): Promise<void> {
  const database = await getDatabase()
  await database.execute(
    `UPDATE suggestions
     SET done_at = $1, motivated = $2
     WHERE id = $3 AND done_at IS NULL`,
    [formatLocalDateTime(now), motivated ? 1 : 0, suggestionId],
  )
}

export async function undoSuggestionCompletion(suggestionId: number): Promise<void> {
  const database = await getDatabase()
  const rows = await database.select<Array<{ id: number; task_id: number }>>(
    `SELECT id, task_id
     FROM suggestions
     WHERE id = $1 AND done_at IS NOT NULL`,
    [suggestionId],
  )

  const row = rows[0]
  if (row === undefined) {
    throw new Error('取り消せる記録が見つかりません')
  }

  await database.execute(
    `UPDATE suggestions
     SET done_at = NULL, motivated = NULL
     WHERE id = $1`,
    [suggestionId],
  )

  await purgeLogicallyDeletedTaskIfNoDoneHistory(row.task_id)
}

export async function listRecentCompletions(limit = 5): Promise<RecentCompletion[]> {
  const database = await getDatabase()
  const rows = await database.select<CompletedSuggestionRow[]>(
    `SELECT s.id, s.task_id, t.title, s.suggested_at, s.done_at, s.motivated
     FROM suggestions s
     INNER JOIN tasks t ON t.id = s.task_id
     WHERE s.done_at IS NOT NULL
     ORDER BY s.done_at DESC, s.id DESC
     LIMIT $1`,
    [limit],
  )

  return rows.map((row) => ({
    id: row.id,
    taskId: row.task_id,
    title: row.title,
    timeBand: getTimeBand(new Date(row.suggested_at)),
    doneAt: row.done_at,
    motivated: row.motivated === 1,
  }))
}

export async function suggestNextTask(
  now: Date = new Date(),
  random: () => number = Math.random,
  options?: {
    excludeTaskIds?: number[]
    replaceSuggestionId?: number
  },
): Promise<Suggestion> {
  const database = await getDatabase()
  const tasks = await listActiveTasks()
  const timeBand = getTimeBand(now)
  const scores = await loadTaskScores(timeBand)
  const epsilon = await getEpsilon()
  const task = pickTask(tasks, scores, random, options?.excludeTaskIds ?? [], epsilon)
  const suggestedAt = formatLocalDateTime(now)

  if (options?.replaceSuggestionId !== undefined) {
    await database.execute(
      `UPDATE suggestions
       SET task_id = $1, suggested_at = $2
       WHERE id = $3 AND done_at IS NULL`,
      [task.id, suggestedAt, options.replaceSuggestionId],
    )

    return {
      id: options.replaceSuggestionId,
      taskId: task.id,
      title: task.title,
      timeBand,
      suggestedAt,
    }
  }

  const result = await database.execute(
    'INSERT INTO suggestions (task_id, suggested_at) VALUES ($1, $2)',
    [task.id, suggestedAt],
  )

  const suggestionId = (result as InsertResult).lastInsertId

  return {
    id: suggestionId,
    taskId: task.id,
    title: task.title,
    timeBand,
    suggestedAt,
  }
}

export { TIME_BAND_LABELS }
