import { SuggestionView } from './views/SuggestionView'
import { openManageWindow } from './windowBehavior'

const APPLICATION_TITLE = 'やる気起こrunner'

export function PopoverApp() {
  return (
    <main className="app app--popover">
      <header className="app__header">
        <h1 className="app__title">{APPLICATION_TITLE}</h1>
      </header>

      <div className="app__content" aria-live="polite">
        <SuggestionView />
      </div>

      <footer className="app__footer">
        <button
          className="app__manage-link"
          type="button"
          onClick={() => {
            void openManageWindow().catch((error: unknown) => {
              console.error('管理画面を開けませんでした', error)
            })
          }}
        >
          タスク・統計・設定を開く
        </button>
      </footer>
    </main>
  )
}

export { APPLICATION_TITLE }
