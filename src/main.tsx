import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const APPLICATION_TITLE = 'やる気起こrunner'

function App() {
  return <main>{APPLICATION_TITLE}</main>
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
