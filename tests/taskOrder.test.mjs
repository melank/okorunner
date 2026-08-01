import assert from 'node:assert/strict'
import test from 'node:test'
import { swapTaskOrder } from '../src/taskOrder.ts'

test('swapTaskOrder should move a task up by swapping sort_order', () => {
  const tasks = [
    { id: 1, title: 'A', active: 1, sort_order: 1 },
    { id: 2, title: 'B', active: 1, sort_order: 2 },
    { id: 3, title: 'C', active: 1, sort_order: 3 },
  ]

  const reordered = swapTaskOrder(tasks, 2, 'up')
  assert.equal(reordered?.[0]?.id, 2)
  assert.equal(reordered?.[1]?.id, 1)
  assert.equal(reordered?.[0]?.sort_order, 1)
  assert.equal(reordered?.[1]?.sort_order, 2)
})

test('swapTaskOrder should return null when the task cannot move further', () => {
  const tasks = [
    { id: 1, title: 'A', active: 1, sort_order: 1 },
  ]

  assert.equal(swapTaskOrder(tasks, 1, 'up'), null)
})
