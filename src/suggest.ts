import Database from '@tauri-apps/plugin-sql'
import { DATABASE_URL, type Task } from './db'
import { pickTask } from './suggestLogic'
import { assertTauriRuntime } from './tauriRuntime'
import {
  formatLocalDateTime,
  getTimeBand,
  TIME_BAND_LABELS,
  type TimeBand,
} from './timeBand'

type SqlDatabase = Awaited<ReturnType<typeof Database.load>>

let databaseInstance: SqlDatabase | null = null

export type Suggestion = {
  id: number
  taskId: number
  title: string
  timeBand: TimeBand
  suggestedAt: string
}

type SuggestionHistoryRow = {
  task_id: number
  suggested_at: string
  motivated: number | null
}

type InsertResult = {
  lastInsertId: number
}

async function getDatabase(): Promise<SqlDatabase> {
  assertTauriRuntime()
  databaseInstance ??= await Database.load(DATABASE_URL)
  return databaseInstance
}

export async function loadTaskScores(
  timeBand: TimeBand,
  database?: SqlDatabase,
): Promise<Map<number, { motivated: number; done: number }>> {
  const db = database ?? await getDatabase()
  const rows = await db.select<SuggestionHistoryRow[]>(
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

export async function suggestNextTask(
  now: Date = new Date(),
  random: () => number = Math.random,
): Promise<Suggestion> {
  const database = await getDatabase()
  const tasks = await database.select<Task[]>(
    'SELECT id, title, active FROM tasks WHERE active = 1 ORDER BY id',
  )
  const timeBand = getTimeBand(now)
  const scores = await loadTaskScores(timeBand, database)
  const task = pickTask(tasks, scores, random)
  const suggestedAt = formatLocalDateTime(now)

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
