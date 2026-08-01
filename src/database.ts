import Database from '@tauri-apps/plugin-sql'
import { DATABASE_URL } from './db'
import { assertTauriRuntime } from './tauriRuntime'

export type SqlDatabase = Awaited<ReturnType<typeof Database.load>>

let databaseInstance: SqlDatabase | null = null

export async function getDatabase(): Promise<SqlDatabase> {
  assertTauriRuntime()
  databaseInstance ??= await Database.load(DATABASE_URL)
  return databaseInstance
}
