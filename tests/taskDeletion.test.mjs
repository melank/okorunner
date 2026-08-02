import assert from 'node:assert/strict'
import test from 'node:test'
import { deletionConfirmCopy, shouldPurgeLogicallyDeletedTask, taskDeletionMode } from '../src/taskDeletion.ts'

test('taskDeletionMode should physically delete tasks without done history', () => {
  assert.equal(taskDeletionMode(0), 'physical')
})

test('taskDeletionMode should logically delete tasks with done history', () => {
  assert.equal(taskDeletionMode(1), 'logical')
  assert.equal(taskDeletionMode(3), 'logical')
})

test('deletionConfirmCopy should describe physical and logical deletion differently', () => {
  const physical = deletionConfirmCopy('physical', '洗濯')
  const logical = deletionConfirmCopy('logical', '洗濯')

  assert.match(physical.message, /完全に削除/)
  assert.match(physical.message, /取り消せません/)
  assert.equal(physical.confirmLabel, '完全に削除')

  assert.match(logical.message, /一覧から削除/)
  assert.match(logical.message, /統計に残ります/)
  assert.equal(logical.confirmLabel, '一覧から削除')
})

test('shouldPurgeLogicallyDeletedTask should purge only logically deleted tasks without done history', () => {
  assert.equal(shouldPurgeLogicallyDeletedTask({ deleted: 1 }, 0), true)
  assert.equal(shouldPurgeLogicallyDeletedTask({ deleted: 1 }, 1), false)
  assert.equal(shouldPurgeLogicallyDeletedTask({ deleted: 0 }, 0), false)
})
