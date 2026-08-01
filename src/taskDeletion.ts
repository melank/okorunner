export type TaskDeletionMode = 'physical' | 'logical'

export type TaskDeletionConfirmCopy = {
  message: string
  confirmLabel: string
  successMessage: string
}

export function taskDeletionMode(doneCount: number): TaskDeletionMode {
  return doneCount === 0 ? 'physical' : 'logical'
}

export function deletionConfirmCopy(mode: TaskDeletionMode, title: string): TaskDeletionConfirmCopy {
  if (mode === 'physical') {
    return {
      message: `「${title}」を完全に削除しますか？この操作は取り消せません。`,
      confirmLabel: '完全に削除',
      successMessage: 'タスクを削除しました',
    }
  }

  return {
    message: `「${title}」を一覧から削除しますか？Done の記録は統計に残ります。`,
    confirmLabel: '一覧から削除',
    successMessage: 'タスクを一覧から削除しました（統計は保持）',
  }
}
