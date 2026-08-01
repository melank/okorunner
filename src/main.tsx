import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { listActiveTasks, type Task } from './db'
import './styles.css'

const APPLICATION_TITLE = 'やる気起こrunner'

function App() {
  const [tasks, setTasks] = useState<Task[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    listActiveTasks()
      .then((loadedTasks) => {
        if (!cancelled) {
          setTasks(loadedTasks)
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          const message =
            loadError instanceof Error ? loadError.message : 'タスクの読み込みに失敗しました'
          setError(message)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="app">
      <h1>{APPLICATION_TITLE}</h1>
      {error !== null && <p className="status status-error">{error}</p>}
      {error === null && tasks === null && <p className="status">読み込み中…</p>}
      {error === null && tasks !== null && (
        <section className="task-list">
          <p className="status">{tasks.length}件のタスク</p>
          <ul>
            {tasks.map((task) => (
              <li key={task.id}>{task.title}</li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Application root element is required')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
