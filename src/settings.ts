import { getDatabase } from './database'
import {
  DEFAULT_EPSILON,
  EPSILON_SETTING_KEY,
  MAX_EPSILON,
  MIN_EPSILON,
  parseEpsilon,
} from './settingsLogic'

export {
  DEFAULT_EPSILON,
  EPSILON_SETTING_KEY,
  MAX_EPSILON,
  MIN_EPSILON,
  parseEpsilon,
} from './settingsLogic'

export async function getEpsilon(): Promise<number> {
  const database = await getDatabase()
  const rows = await database.select<Array<{ value: string }>>(
    'SELECT value FROM settings WHERE key = $1',
    [EPSILON_SETTING_KEY],
  )
  const stored = rows[0]?.value
  if (stored === undefined) {
    return DEFAULT_EPSILON
  }

  return parseEpsilon(stored) ?? DEFAULT_EPSILON
}

export async function setEpsilon(value: number): Promise<void> {
  if (!Number.isFinite(value) || value < MIN_EPSILON || value > MAX_EPSILON) {
    throw new Error('εは0から1の範囲で指定してください')
  }

  const database = await getDatabase()
  await database.execute(
    `INSERT INTO settings (key, value) VALUES ($1, $2)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [EPSILON_SETTING_KEY, String(value)],
  )
}
