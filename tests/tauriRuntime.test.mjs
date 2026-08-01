import assert from 'node:assert/strict'
import test from 'node:test'
import { formatTauriError } from '../src/tauriRuntime.ts'

test('formatTauriError should surface string and object-shaped Tauri errors', () => {
  assert.equal(formatTauriError('no such table: tasks'), 'データベースの初期化に失敗しています。アプリを再起動しても直らない場合は、開発中の okorunner.db を削除してから再度起動してください')
  assert.equal(formatTauriError({ message: 'database is locked' }), 'database is locked')
  assert.equal(formatTauriError(new Error('提案できるタスクがありません')), '提案できるタスクがありません')
})
