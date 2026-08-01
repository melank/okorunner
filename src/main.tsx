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
} from './suggest'
import { initializeAppShell } from './appShell'
import { formatTauriError } from './tauriRuntime'
import { completionMessage, type ViewState } from './viewState'
import './styles.css'

const APPLICATION_TITLE = 'やる気起こrunner'

function App() {
  const [view, setView] = useState<ViewState>({ kind: 'loading' })
  const [isCompleting, setIsCompleting] = useState(false)

  const loadSuggestion = useCallback(async (options?: {
    forceNew?: boolean
    excludeTaskId?: number
    replaceSuggestionId?: number
  }) => {
    setView({ kind: 'loading' })

    try {
      if (!options?.forceNew) {
        const current = await getCurrentSuggestion()
        if (current !== null) {
          setView({ kind: 'suggestion', suggestion: current })
          return
        }
      }

      const nextSuggestion = await suggestNextTask(new Date(), Math.random, {
        excludeTaskIds: options?.excludeTaskId !== undefined ? [options.excludeTaskId] : undefined,
        replaceSuggestionId: options?.replaceSuggestionId,
      })
      setView({ kind: 'suggestion', suggestion: nextSuggestion })
    } catch (loadError: unknown) {
      console.error('提案の取得に失敗しました', loadError)
      setView({ kind: 'error', message: formatTauriError(loadError) })
    }
  }, [])

  const completeCurrentSuggestion = useCallback(async (motivated: boolean) => {
    if (view.kind !== 'suggestion' || isCompleting) {
      return
    }

    setIsCompleting(true)

    try {
      await completeSuggestion(view.suggestion.id, motivated)
      setView({ kind: 'completed', message: completionMessage(motivated) })
    } catch (completeError: unknown) {
      console.error('Doneの記録に失敗しました', completeError)
      setView({ kind: 'error', message: formatTauriError(completeError) })
    } finally {
      setIsCompleting(false)
    }
  }, [isCompleting, view])

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
        // ブラウザ単体起動時など Tauri 外ではスキップする
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

      {view.kind === 'loading' && <p className="status">提案を選んでいます…</p>}

      {view.kind === 'error' && (
        <section className="panel">
          <p className="status status-error">{view.message}</p>
          <button className="button" type="button" onClick={() => void loadSuggestion({ forceNew: true })}>
            もう一度試す
          </button>
        </section>
      )}

      {view.kind === 'completed' && (
        <section className="panel">
          <p className="status status-success">{view.message}</p>
          <button className="button" type="button" onClick={() => void loadSuggestion({ forceNew: true })}>
            次の提案をもらう
          </button>
        </section>
      )}

      {view.kind === 'suggestion' && (
        <section className="suggestion">
          <p className="status">時間帯: {TIME_BAND_LABELS[view.suggestion.timeBand]}</p>
          <p className="suggestion-title">{view.suggestion.title}</p>
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
              onClick={() => {
                if (view.kind !== 'suggestion') {
                  return
                }

                void loadSuggestion({
                  forceNew: true,
                  excludeTaskId: view.suggestion.taskId,
                  replaceSuggestionId: view.suggestion.id,
                })
              }}
            >
              別の提案
            </button>
          </div>
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
