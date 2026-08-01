import { useCallback, useEffect, useState } from 'react'
import type { Task } from '../db'
import { addTask, listAllTasks, moveTask, setTaskActive, updateTaskTitle } from '../tasks'
import { formatTauriError } from '../tauriRuntime'

export function TasksView() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState(false)

  const reload = useCallback(async () => {
    setError(null)
    try {
      setTasks(await listAllTasks())
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
    try {
      await action()
      await reload()
    } catch (actionError: unknown) {
      setError(formatTauriError(actionError))
    } finally {
      setIsBusy(false)
    }
  }, [reload])

  return (
    <section className="card card--scroll" aria-label="タスク管理">
      <div className="card__section">
        <h2 className="card__heading">タスク一覧</h2>
        <p className="card__hint">並び順は提案時の優先度に影響しません。表示順のみです。</p>
      </div>

      {error !== null && <p className="form-error">{error}</p>}

      <ul className="task-list">
        {tasks.map((task, index) => (
          <li key={task.id} className="task-item">
            <div className="task-item__main">
              {editingId === task.id ? (
                <input
                  className="field-input"
                  value={editingTitle}
                  disabled={isBusy}
                  onChange={(event) => setEditingTitle(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      void runAction(async () => {
                        await updateTaskTitle(task.id, editingTitle)
                        setEditingId(null)
                      })
                    }
                  }}
                />
              ) : (
                <span className={task.active === 1 ? 'task-item__title' : 'task-item__title task-item__title--inactive'}>
                  {task.title}
                </span>
              )}
              <label className="task-item__toggle">
                <input
                  type="checkbox"
                  checked={task.active === 1}
                  disabled={isBusy}
                  onChange={() => void runAction(async () => {
                    await setTaskActive(task.id, task.active !== 1)
                  })}
                />
                有効
              </label>
            </div>
            <div className="task-item__actions">
              <button
                className="btn btn--ghost"
                type="button"
                disabled={isBusy || index === 0}
                onClick={() => void runAction(async () => moveTask(task.id, 'up'))}
              >
                ↑
              </button>
              <button
                className="btn btn--ghost"
                type="button"
                disabled={isBusy || index === tasks.length - 1}
                onClick={() => void runAction(async () => moveTask(task.id, 'down'))}
              >
                ↓
              </button>
              {editingId === task.id ? (
                <button
                  className="btn btn--secondary"
                  type="button"
                  disabled={isBusy}
                  onClick={() => void runAction(async () => {
                    await updateTaskTitle(task.id, editingTitle)
                    setEditingId(null)
                  })}
                >
                  保存
                </button>
              ) : (
                <button
                  className="btn btn--secondary"
                  type="button"
                  disabled={isBusy}
                  onClick={() => {
                    setEditingId(task.id)
                    setEditingTitle(task.title)
                  }}
                >
                  編集
                </button>
              )}
            </div>
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
