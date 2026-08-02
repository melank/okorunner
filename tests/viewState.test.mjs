import assert from 'node:assert/strict'
import test from 'node:test'
import { completionMessage } from '../src/viewState.ts'

test('completionMessage should describe motivated and regular Done', () => {
  assert.equal(completionMessage(false), 'Doneを記録しました（やる気は出なかった）')
  assert.equal(completionMessage(true), 'Doneを記録しました（やる気が出た）')
})
