import { StrictMode, useCallback, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  activateAppWindow,
  GLOBAL_SHORTCUT,
  registerGlobalShortcut,
  unregisterGlobalShortcut,
} from './globalShortcut'
import { startReminderScheduler } from './reminderScheduler'
import { getLatestPendingSuggestion, suggestNextTask, TIME_BAND_LABELS, type Suggestion } from './suggest'
import { formatTauriError } from './tauriRuntime'
import './styles.css'

const APPLICATION_TITLE = 'やる気起こrunner'

function App() {
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadSuggestion = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
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
      {error === null && isLoading && <p className="status">提案を選んでいます…</p>}
      {error === null && !isLoading && suggestion !== null && (
        <section className="suggestion">
          <p className="status">時間帯: {TIME_BAND_LABELS[suggestion.timeBand]}</p>
          <p className="suggestion-title">{suggestion.title}</p>
          <button className="button" type="button" onClick={() => void loadSuggestion()}>
            別の提案
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

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
