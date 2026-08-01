import { getCurrentWindow } from '@tauri-apps/api/window'
import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { MAIN_WINDOW_LABEL } from './appTabs'
import { initializeAppShell } from './appShell'
import { ManageApp } from './ManageApp'
import { PopoverApp } from './PopoverApp'
import './styles.css'

function Root() {
  const [windowLabel, setWindowLabel] = useState(() => getCurrentWindow().label)

  useEffect(() => {
    setWindowLabel(getCurrentWindow().label)
  }, [])

  if (windowLabel === MAIN_WINDOW_LABEL) {
    return <PopoverApp />
  }

  return <ManageApp />
}

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Application root element is required')
}

initializeAppShell()

createRoot(rootElement).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
