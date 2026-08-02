import { useLayoutEffect, useRef, type RefObject } from 'react'
import { SuggestionView } from './views/SuggestionView'
import { openManageWindow, schedulePopoverResize } from './windowBehavior'

const APPLICATION_TITLE = 'やる気起こrunner'

function usePopoverAutoResize(appRef: RefObject<HTMLElement | null>): void {
  useLayoutEffect(() => {
    document.documentElement.classList.add('popover-window')

    const target = appRef.current
    if (target === null) {
      return () => {
        document.documentElement.classList.remove('popover-window')
      }
    }

    const resize = () => {
      schedulePopoverResize()
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(target)

    return () => {
      observer.disconnect()
      document.documentElement.classList.remove('popover-window')
    }
  }, [appRef])
}

export function PopoverApp() {
  const appRef = useRef<HTMLElement>(null)
  usePopoverAutoResize(appRef)

  return (
    <main ref={appRef} className="app app--popover">
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
