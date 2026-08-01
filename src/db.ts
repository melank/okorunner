export const DATABASE_URL = 'sqlite:okorunner.db'

export type Task = {
  id: number
  title: string
  active: number
  sort_order: number
}
