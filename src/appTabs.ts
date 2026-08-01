export type AppTab = 'suggestion' | 'tasks' | 'stats' | 'settings'

export const APP_TABS: Array<{ id: AppTab; label: string }> = [
  { id: 'suggestion', label: '提案' },
  { id: 'tasks', label: 'タスク' },
  { id: 'stats', label: '統計' },
  { id: 'settings', label: '設定' },
]
