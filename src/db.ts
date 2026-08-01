import Database from '@tauri-apps/plugin-sql'

export const DATABASE_URL = 'sqlite:okorunner.db'

export type Task = {
  id: number
  title: string
  active: number
}

export async function listActiveTasks(): Promise<Task[]> {
  const database = await Database.load(DATABASE_URL)
  return database.select<Task[]>(
    'SELECT id, title, active FROM tasks WHERE active = 1 ORDER BY id',
  )
}
