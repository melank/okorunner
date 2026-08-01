import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initializeAppShell } from './appShell'
import './styles.css'

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
