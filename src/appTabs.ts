export const MAIN_WINDOW_LABEL = 'main'
export const MANAGE_WINDOW_LABEL = 'manage'

export type ManageTab = 'tasks' | 'stats' | 'settings'

export const MANAGE_TABS: Array<{ id: ManageTab; label: string }> = [
  { id: 'tasks', label: 'タスク' },
  { id: 'stats', label: '統計' },
  { id: 'settings', label: '設定' },
]
