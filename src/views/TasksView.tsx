import { useCallback, useEffect, useState } from 'react'
import type { Task } from '../db'
import { deletionConfirmCopy, type TaskDeletionMode } from '../taskDeletion'
import {
  addTask,
  deleteTask,
  isTaskPaused,
  isTaskSuggested,
  listVisibleTasks,
  moveTask,
  previewTaskDeletion,
  setTaskPaused,
  updateTaskTitle,
} from '../tasks'
import { formatTauriError } from '../tauriRuntime'

type ConfirmingDelete = {
  taskId: number
  mode: TaskDeletionMode
}

export function TasksView() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState<ConfirmingDelete | null>(null)

  const reload = useCallback(async () => {
    setError(null)
    try {
      setTasks(await listVisibleTasks())
    } catch (loadError: unknown) {
      setError(formatTauriError(loadError))
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const runAction = useCallback(async (action: () => Promise<void>) => {
    setIsBusy(true)
    setError(null)
    setMessage(null)
    try {
      await action()
      await reload()
    } catch (actionError: unknown) {
      setError(formatTauriError(actionError))
    } finally {
      setIsBusy(false)
    }
  }, [reload])

  const saveTitle = useCallback(async (task: Task) => {
    const trimmed = editingTitle.trim()
    if (trimmed.length === 0 || trimmed === task.title) {
      setEditingId(null)
      setEditingTitle('')
      return
    }

    setEditingId(null)
    setEditingTitle('')
    setTasks((current) =>
      current.map((item) => (item.id === task.id ? { ...item, title: trimmed } : item)),
    )

    try {
      setError(null)
      await updateTaskTitle(task.id, trimmed)
    } catch (actionError: unknown) {
      setError(formatTauriError(actionError))
      await reload()
    }
  }, [editingTitle, reload])

  const cancelEditing = useCallback(() => {
    setEditingId(null)
    setEditingTitle('')
  }, [])

  return (
    <section className="card card--scroll" aria-label="タスク管理">
      <div className="card__section">
        <h2 className="card__heading">タスク一覧</h2>
        <p className="card__hint">
          タスク名をクリックして名称を変更できます。「しばらくは出さない」にすると提案に出なくなります（一覧には残ります）。
        </p>
      </div>

      {error !== null && <p className="form-error">{error}</p>}
      {message !== null && <p className="form-success">{message}</p>}

      <ul className="task-list">
        {tasks.map((task, index) => (
          <li key={task.id} className="task-item">
            <div className="task-item__header">
              <div className="task-item__title-field">
                {editingId === task.id ? (
                  <input
                    className={
                      isTaskSuggested(task)
                        ? 'task-item__title-input'
                        : 'task-item__title-input task-item__title-input--inactive'
                    }
                    value={editingTitle}
                    size={Math.max(editingTitle.length, 1)}
                    disabled={isBusy}
                    aria-label="タスク名"
                    autoFocus
                    onChange={(event) => setEditingTitle(event.target.value)}
                    onFocus={(event) => event.target.select()}
                    onBlur={() => {
                      void saveTitle(task)
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        void saveTitle(task)
                      }
                      if (event.key === 'Escape') {
                        event.preventDefault()
                        cancelEditing()
                      }
                    }}
                  />
                ) : (
                  <button
                    className={
                      isTaskSuggested(task)
                        ? 'task-item__title-btn'
                        : 'task-item__title-btn task-item__title-btn--inactive'
                    }
                    type="button"
                    disabled={isBusy}
                    title="クリックして名称を変更"
                    aria-label={`${task.title}（クリックして名称を変更）`}
                    onClick={() => {
                      setEditingId(task.id)
                      setEditingTitle(task.title)
                    }}
                  >
                    {task.title}
                  </button>
                )}
              </div>
              <label className="task-item__toggle">
                <input
                  type="checkbox"
                  checked={isTaskPaused(task)}
                  disabled={isBusy}
                  onChange={() => void runAction(async () => {
                    await setTaskPaused(task.id, !isTaskPaused(task))
                  })}
                />
                しばらくは出さない
              </label>
            </div>
            <div className="task-item__footer">
              <div className="task-item__actions">
                <button
                  className="btn btn--ghost"
                  type="button"
                  disabled={isBusy || index === 0}
                  onClick={() => void runAction(async () => moveTask(task.id, 'up'))}
                  aria-label="上へ移動"
                >
                  ↑
                </button>
                <button
                  className="btn btn--ghost"
                  type="button"
                  disabled={isBusy || index === tasks.length - 1}
                  onClick={() => void runAction(async () => moveTask(task.id, 'down'))}
                  aria-label="下へ移動"
                >
                  ↓
                </button>
              </div>
              <button
                className="task-item__delete"
                type="button"
                disabled={isBusy}
                onClick={() => {
                  void previewTaskDeletion(task.id)
                    .then((mode) => {
                      setConfirmingDelete({ taskId: task.id, mode })
                    })
                    .catch((loadError: unknown) => {
                      setError(formatTauriError(loadError))
                    })
                }}
              >
                削除
              </button>
            </div>
            {confirmingDelete?.taskId === task.id && (() => {
              const copy = deletionConfirmCopy(confirmingDelete.mode, task.title)

              return (
              <div
                className={
                  confirmingDelete.mode === 'physical'
                    ? 'task-item__confirm task-item__confirm--physical'
                    : 'task-item__confirm task-item__confirm--logical'
                }
                role="alertdialog"
                aria-labelledby={`delete-${task.id}`}
              >
                <p className="task-item__confirm-text" id={`delete-${task.id}`}>
                  {copy.message}
                </p>
                <div className="task-item__confirm-actions">
                  <button
                    className="btn btn--secondary"
                    type="button"
                    disabled={isBusy}
                    onClick={() => setConfirmingDelete(null)}
                  >
                    キャンセル
                  </button>
                  <button
                    className={
                      confirmingDelete.mode === 'physical'
                        ? 'btn btn--danger'
                        : 'btn btn--primary'
                    }
                    type="button"
                    disabled={isBusy}
                    onClick={() => {
                      void runAction(async () => {
                        const mode = await deleteTask(task.id)
                        setConfirmingDelete(null)
                        if (editingId === task.id) {
                          setEditingId(null)
                        }
                        setMessage(deletionConfirmCopy(mode, task.title).successMessage)
                      })
                    }}
                  >
                    {copy.confirmLabel}
                  </button>
                </div>
              </div>
              )
            })()}
          </li>
        ))}
      </ul>

      <form
        className="task-form"
        onSubmit={(event) => {
          event.preventDefault()
          void runAction(async () => {
            await addTask(newTitle)
            setNewTitle('')
          })
        }}
      >
        <input
          className="field-input"
          value={newTitle}
          placeholder="新しいタスク"
          disabled={isBusy}
          onChange={(event) => setNewTitle(event.target.value)}
        />
        <button className="btn btn--primary" type="submit" disabled={isBusy || newTitle.trim().length === 0}>
          追加
        </button>
      </form>
    </section>
  )
}
