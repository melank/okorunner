import { StrictMode, useCallback, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { suggestNextTask, TIME_BAND_LABELS, type Suggestion } from './suggest'
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
      const message =
        loadError instanceof Error ? loadError.message : '提案の取得に失敗しました'
      setError(message)
      setSuggestion(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadSuggestion()
  }, [loadSuggestion])

  return (
    <main className="app">
      <h1>{APPLICATION_TITLE}</h1>
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
