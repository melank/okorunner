import { useState } from 'react'
import { MANAGE_TABS, type ManageTab } from './appTabs'
import { SettingsView } from './views/SettingsView'
import { StatsView } from './views/StatsView'
import { TasksView } from './views/TasksView'

const MANAGE_TITLE = 'やる気起こrunner — 管理'

function renderTab(tab: ManageTab) {
  switch (tab) {
    case 'tasks':
      return <TasksView />
    case 'stats':
      return <StatsView />
    case 'settings':
      return <SettingsView />
  }
}

export function ManageApp() {
  const [activeTab, setActiveTab] = useState<ManageTab>('tasks')

  return (
    <main className="app app--manage">
      <header className="app__header app__header--manage">
        <h1 className="app__title">{MANAGE_TITLE}</h1>
        <p className="card__hint">タスクの追加・名称変更、統計の確認、提案の設定を行います。</p>
      </header>

      <nav className="app-nav app-nav--manage" aria-label="管理メニュー">
        {MANAGE_TABS.map((tab) => (
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

      <div className="app__content app__content--manage" aria-live="polite">
        {renderTab(activeTab)}
      </div>
    </main>
  )
}
