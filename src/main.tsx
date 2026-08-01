import { StrictMode, useCallback, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  activateAppWindow,
  GLOBAL_SHORTCUT,
  registerGlobalShortcut,
  unregisterGlobalShortcut,
} from './globalShortcut'
import { startReminderScheduler } from './reminderScheduler'
import {
  completeSuggestion,
  getCurrentSuggestion,
  getLatestPendingSuggestion,
  suggestNextTask,
  TIME_BAND_LABELS,
  type Suggestion,
} from './suggest'
import { initializeAppShell } from './appShell'
import { formatTauriError } from './tauriRuntime'
import './styles.css'

const APPLICATION_TITLE = 'やる気起こrunner'

function App() {
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [completionMessage, setCompletionMessage] = useState<string | null>(null)
  const [isCompleting, setIsCompleting] = useState(false)

  const loadSuggestion = useCallback(async (options?: { forceNew?: boolean }) => {
    setIsLoading(true)
    setError(null)
    setCompletionMessage(null)

    try {
      if (!options?.forceNew) {
        const current = await getCurrentSuggestion()
        if (current !== null) {
          setSuggestion(current)
          return
        }
      }

      const nextSuggestion = await suggestNextTask()
      setSuggestion(nextSuggestion)
    } catch (loadError: unknown) {
      console.error('提案の取得に失敗しました', loadError)
      setError(formatTauriError(loadError))
      setSuggestion(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const completeCurrentSuggestion = useCallback(async (motivated: boolean) => {
    if (suggestion === null || isCompleting) {
      return
    }

    setIsCompleting(true)
    setError(null)

    try {
      await completeSuggestion(suggestion.id, motivated)
      setSuggestion(null)
      setCompletionMessage(motivated ? 'やる気が出た Doneを記録しました' : 'Doneを記録しました')
    } catch (completeError: unknown) {
      console.error('Doneの記録に失敗しました', completeError)
      setError(formatTauriError(completeError))
    } finally {
      setIsCompleting(false)
    }
  }, [isCompleting, suggestion])

  useEffect(() => {
    void loadSuggestion()
  }, [loadSuggestion])

  useEffect(() => {
    let cancelled = false

    const onShortcutPressed = () => {
      void (async () => {
        await activateAppWindow()
        await loadSuggestion()
      })()
    }

    void (async () => {
      try {
        await registerGlobalShortcut(onShortcutPressed)
        if (cancelled) {
          await unregisterGlobalShortcut()
        }
      } catch {
        // ブラウザ単体起動時など Tauri 外ではショートカット登録をスキップする
      }
    })()

    return () => {
      cancelled = true
      void unregisterGlobalShortcut()
    }
  }, [loadSuggestion])

  useEffect(() => {
    return startReminderScheduler({
      getPendingSuggestion: async () => {
        try {
          return await getLatestPendingSuggestion()
        } catch {
          return null
        }
      },
    })
  }, [])

  return (
    <main className="app">
      <h1>{APPLICATION_TITLE}</h1>
      <p className="shortcut-hint">ショートカット: {GLOBAL_SHORTCUT.replace('CommandOrControl', '⌘')}</p>
      {error !== null && <p className="status status-error">{error}</p>}
      {error === null && completionMessage !== null && (
        <p className="status status-success">{completionMessage}</p>
      )}
      {error === null && isLoading && <p className="status">提案を選んでいます…</p>}
      {error === null && !isLoading && suggestion !== null && (
        <section className="suggestion">
          <p className="status">時間帯: {TIME_BAND_LABELS[suggestion.timeBand]}</p>
          <p className="suggestion-title">{suggestion.title}</p>
          <div className="actions">
            <button
              className="button"
              type="button"
              disabled={isCompleting}
              onClick={() => void completeCurrentSuggestion(false)}
            >
              Done
            </button>
            <button
              className="button button-motivated"
              type="button"
              disabled={isCompleting}
              onClick={() => void completeCurrentSuggestion(true)}
            >
              やる気が出た Done
            </button>
            <button
              className="button button-secondary"
              type="button"
              disabled={isCompleting}
              onClick={() => void loadSuggestion({ forceNew: true })}
            >
              別の提案
            </button>
          </div>
        </section>
      )}
      {error === null && !isLoading && suggestion === null && completionMessage === null && (
        <section className="suggestion">
          <p className="status">提案がありません</p>
          <button className="button" type="button" onClick={() => void loadSuggestion({ forceNew: true })}>
            提案をもらう
          </button>
        </section>
      )}
    </main>
  )
}

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Application root element is required')
}

initializeAppShell()

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
