import { useLayoutEffect } from 'react'
import { SuggestionView } from './views/SuggestionView'

export function PopoverApp() {
  useLayoutEffect(() => {
    document.documentElement.classList.add('popover-window')
    return () => {
      document.documentElement.classList.remove('popover-window')
    }
  }, [])

  return (
    <main className="app app--popover">
      <div className="app__content" aria-live="polite">
        <SuggestionView />
      </div>
    </main>
  )
}
