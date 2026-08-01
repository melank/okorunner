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
    Object.keys(packageManifest.dependencies).filter((name) => name.startsWith('@tauri-apps/')),
    ['@tauri-apps/plugin-sql'],
  )
  assert.equal(config.productName, 'やる気起こrunner')
  assert.equal(config.identifier, 'com.melank.okorunner')
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
})

test('should render the application title from the React entry point', async () => {
  const source = await readProjectFile('src/main.tsx')

  assert.match(source, /const APPLICATION_TITLE = 'やる気起こrunner'/)
  assert.match(source, /listActiveTasks\(\)/)
  assert.match(source, /createRoot\(rootElement\)\.render/)
})

test('should define the SQLite schema and initial task seed', async () => {
  const [schema, seed] = await Promise.all([
    readProjectFile('src-tauri/migrations/001_schema.sql'),
    readProjectFile('src-tauri/migrations/002_seed_tasks.sql'),
  ])

  assert.match(schema, /CREATE TABLE tasks/)
  assert.match(schema, /CREATE TABLE suggestions/)
  assert.match(seed, /INSERT INTO tasks/)
})

test('should register only the required Rust Tauri plugins', async () => {
  const [cargoManifest, rustSource] = await Promise.all([
    readProjectFile('src-tauri/Cargo.toml'),
    readProjectFile('src-tauri/src/lib.rs'),
  ])

  assert.match(cargoManifest, /^tauri-plugin-sql = \{ version = "2", features = \["sqlite"\] \}$/m)
  assert.match(cargoManifest, /^tauri-plugin-global-shortcut = "2"$/m)
  assert.match(cargoManifest, /^tauri-plugin-notification = "2"$/m)
  assert.match(rustSource, /tauri_plugin_sql::Builder::default\(\)/)
  assert.match(rustSource, /\.add_migrations\(db::DATABASE_URL, db::migrations\(\)\)/)
  assert.match(rustSource, /tauri_plugin_global_shortcut::Builder::new\(\)\.build\(\)/)
  assert.match(rustSource, /tauri_plugin_notification::init\(\)/)
  assert.equal((rustSource.match(/\.plugin\(/g) ?? []).length, 3)
})
