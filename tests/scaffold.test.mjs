import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { loadConfigFromFile } from 'vite'

const readProjectFile = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('should define the required application metadata and connect Vite to Tauri', async () => {
  const [packageJson, tauriConfig, viteConfigResult] = await Promise.all([
    readProjectFile('package.json'),
    readProjectFile('src-tauri/tauri.conf.json'),
    loadConfigFromFile(
      { command: 'serve', mode: 'test' },
      fileURLToPath(new URL('../vite.config.ts', import.meta.url)),
    ),
  ])
  const packageManifest = JSON.parse(packageJson)
  const config = JSON.parse(tauriConfig)

  assert.ok(viteConfigResult)
  const viteConfig = viteConfigResult.config

  assert.equal(packageManifest.name, 'okorunner')
  assert.equal(packageManifest.scripts.build, 'tsc -b && vite build')
  assert.equal(packageManifest.scripts.tauri, 'tauri')
  assert.deepEqual(
    Object.keys(packageManifest.dependencies)
      .filter((name) => name.startsWith('@tauri-apps/'))
      .sort(),
    ['@tauri-apps/api', '@tauri-apps/plugin-sql'].sort(),
  )
  assert.equal(config.productName, 'やる気起こrunner')
  assert.equal(config.identifier, 'com.melank.okorunner')
  assert.equal(config.app.windows[0].label, 'main')
  assert.equal(config.app.windows[0].width, 360)
  assert.equal(config.app.windows[0].height, 300)
  assert.notEqual(config.app.windows[0].decorations, false)
  assert.equal(config.app.windows[0].visible, false)
  assert.equal(config.app.windows[1].label, 'manage')
  assert.equal(config.app.windows[1].resizable, true)
  assert.equal(config.build.beforeDevCommand, 'npm run dev')
  assert.equal(config.build.beforeBuildCommand, 'npm run build')
  assert.equal(config.build.frontendDist, '../dist')
  assert.deepEqual(config.app.security.csp, {
    'default-src': "'self' asset:",
    'connect-src': 'ipc: http://ipc.localhost',
    'img-src': "'self' asset: http://asset.localhost blob: data:",
  })
  assert.ok(viteConfig.server)
  assert.equal(viteConfig.server.strictPort, true)
  assert.equal(viteConfig.server.port, Number(new URL(config.build.devUrl).port))
  assert.ok(
    viteConfig.optimizeDeps?.exclude?.includes('@tauri-apps/plugin-sql'),
    'Tauri packages must be excluded from Vite pre-bundling',
  )
})

test('should render popover and manage UIs from the React entry point', async () => {
  const [popoverSource, manageSource, mainSource] = await Promise.all([
    readProjectFile('src/PopoverApp.tsx'),
    readProjectFile('src/ManageApp.tsx'),
    readProjectFile('src/main.tsx'),
  ])

  assert.match(popoverSource, /SuggestionView/)
  assert.doesNotMatch(popoverSource, /app__close/)
  assert.doesNotMatch(popoverSource, /openManageWindow/)
  assert.match(manageSource, /TasksView/)
  assert.match(manageSource, /StatsView/)
  assert.match(manageSource, /SettingsView/)
  assert.match(mainSource, /initializeAppShell\(\)/)
  assert.match(mainSource, /PopoverApp/)
  assert.match(mainSource, /ManageApp/)
  assert.match(mainSource, /MAIN_WINDOW_LABEL/)
  assert.match(mainSource, /createRoot\(rootElement\)\.render/)
})

test('should define the SQLite schema and initial task seed', async () => {
  const [schema, seed, sortOrderMigration, settingsMigration, deletedMigration, capabilities] = await Promise.all([
    readProjectFile('src-tauri/migrations/001_schema.sql'),
    readProjectFile('src-tauri/migrations/002_seed_tasks.sql'),
    readProjectFile('src-tauri/migrations/003_task_sort_order.sql'),
    readProjectFile('src-tauri/migrations/004_settings.sql'),
    readProjectFile('src-tauri/migrations/005_task_deleted.sql'),
    readProjectFile('src-tauri/capabilities/default.json'),
  ])
  const capabilitiesConfig = JSON.parse(capabilities)

  assert.match(schema, /CREATE TABLE tasks/)
  assert.match(schema, /CREATE TABLE suggestions/)
  assert.match(seed, /INSERT INTO tasks/)
  assert.match(sortOrderMigration, /sort_order/)
  assert.match(settingsMigration, /CREATE TABLE settings/)
  assert.match(deletedMigration, /deleted/)
  assert.ok(capabilitiesConfig.permissions.includes('sql:allow-execute'))
  assert.deepEqual(capabilitiesConfig.windows, ['main', 'manage'])
})

test('should link documentation from README', async () => {
  const [readme, doc] = await Promise.all([
    readProjectFile('README.md'),
    readProjectFile('docs/suggestion-logic.md'),
  ])

  assert.match(readme, /docs\/suggestion-logic\.md/)
  assert.doesNotMatch(readme, /docs\/ROADMAP\.md/)
  assert.match(doc, /ε-greedy/)
  assert.match(doc, /EPSILON/)
})

test('should record Done completion in suggestions', async () => {
  const source = await readProjectFile('src/suggest.ts')

  assert.match(source, /completeSuggestion/)
  assert.match(source, /undoSuggestionCompletion/)
  assert.match(source, /purgeLogicallyDeletedTaskIfNoDoneHistory/)
  assert.match(source, /listRecentCompletions/)
  assert.match(source, /excludeTaskIds/)
  assert.match(source, /replaceSuggestionId/)
})

test('should delete tasks based on done execution count', async () => {
  const source = await readProjectFile('src/tasks.ts')

  assert.match(source, /deleteTask/)
  assert.match(source, /deleted = 1/)
  assert.match(source, /purgeLogicallyDeletedTaskIfNoDoneHistory/)
  assert.match(source, /listVisibleTasks/)
})

test('should initialize tray and window shell outside React', async () => {
  const [appShellSource, mainSource] = await Promise.all([
    readProjectFile('src/appShell.ts'),
    readProjectFile('src/main.tsx'),
  ])

  assert.match(appShellSource, /initializeAppShell/)
  assert.match(appShellSource, /registerTrayIcon/)
  assert.match(appShellSource, /MAIN_WINDOW_LABEL/)
  assert.match(mainSource, /initializeAppShell\(\)/)
  assert.doesNotMatch(mainSource, /hideMainWindowOnClose/)
})

test('should toggle application windows only on tray mouse up', async () => {
  const [traySource, windowSource, trayWindowLogicSource] = await Promise.all([
    readProjectFile('src/tray.ts'),
    readProjectFile('src/windowBehavior.ts'),
    readProjectFile('src/trayWindowLogic.ts'),
  ])

  assert.match(traySource, /TRAY_ID = 'okorunner-main-tray'/)
  assert.match(traySource, /removeById\(TRAY_ID\)/)
  assert.match(traySource, /buttonState === 'Up'/)
  assert.match(traySource, /showMenuOnLeftClick: false/)
  assert.match(traySource, /createTrayMenu/)
  assert.match(traySource, /loadTrayIcon/)
  assert.match(traySource, /toggleTrayWindows/)
  assert.match(windowSource, /activatePopoverWindow/)
  assert.match(windowSource, /raise_app_window/)
  assert.match(windowSource, /toggleTrayWindows/)
  assert.match(windowSource, /hideManageWindow/)
  assert.match(windowSource, /openManageWindow/)
  assert.match(windowSource, /hideWindowOnClose/)
  assert.match(windowSource, /await window\.hide\(\)/)
  assert.match(trayWindowLogicSource, /decideTrayWindowAction/)
})

test('should register only the required Rust Tauri plugins', async () => {
  const [cargoManifest, rustSource, macosWindowSource] = await Promise.all([
    readProjectFile('src-tauri/Cargo.toml'),
    readProjectFile('src-tauri/src/lib.rs'),
    readProjectFile('src-tauri/src/macos_window.rs'),
  ])

  assert.match(cargoManifest, /^tauri = \{ version = "2", features = \["tray-icon", "image-png"\] \}$/m)
  assert.match(cargoManifest, /^tauri-plugin-sql = \{ version = "2", features = \["sqlite"\] \}$/m)
  assert.match(rustSource, /tauri_plugin_sql::Builder::default\(\)/)
  assert.match(rustSource, /\.add_migrations\(db::DATABASE_URL, db::migrations\(\)\)/)
  assert.match(rustSource, /ActivationPolicy::Accessory/)
  assert.match(rustSource, /configure_popover_for_active_space/)
  assert.match(macosWindowSource, /MoveToActiveSpace/)
  assert.match(macosWindowSource, /makeKeyAndOrderFront/)
  assert.match(rustSource, /raise_app_window/)
  assert.equal((rustSource.match(/\.plugin\(/g) ?? []).length, 1)
})
