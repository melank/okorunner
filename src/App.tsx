import { useState } from 'react'
import { APP_TABS, type AppTab } from './appTabs'
import { SettingsView } from './views/SettingsView'
import { StatsView } from './views/StatsView'
import { SuggestionView } from './views/SuggestionView'
import { TasksView } from './views/TasksView'

const APPLICATION_TITLE = 'やる気起こrunner'

function renderTab(tab: AppTab) {
  switch (tab) {
    case 'suggestion':
      return <SuggestionView />
    case 'tasks':
      return <TasksView />
    case 'stats':
      return <StatsView />
    case 'settings':
      return <SettingsView />
  }
}

export function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('suggestion')

  return (
    <main className="app">
      <header className="app__header">
        <h1 className="app__title">{APPLICATION_TITLE}</h1>
      </header>

      <div className="app__content" aria-live="polite">
        {renderTab(activeTab)}
      </div>

      <nav className="app-nav" aria-label="メイン">
        {APP_TABS.map((tab) => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? 'app-nav__button app-nav__button--active' : 'app-nav__button'}
            type="button"
            aria-current={activeTab === tab.id ? 'page' : undefined}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </main>
  )
}

export { APPLICATION_TITLE }
