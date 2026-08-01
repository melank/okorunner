import assert from 'node:assert/strict'
import test from 'node:test'
import { pickTask, motivatedRate } from '../src/suggestLogic.ts'
import { getTimeBand } from '../src/timeBand.ts'

test('getTimeBand should map local hours to morning, afternoon, and evening', () => {
  assert.equal(getTimeBand(new Date(2026, 7, 1, 8, 0, 0)), 'morning')
  assert.equal(getTimeBand(new Date(2026, 7, 1, 14, 0, 0)), 'afternoon')
  assert.equal(getTimeBand(new Date(2026, 7, 1, 21, 0, 0)), 'evening')
  assert.equal(getTimeBand(new Date(2026, 7, 1, 2, 0, 0)), 'evening')
})

test('pickTask should explore randomly when random is below epsilon', () => {
  const tasks = [
    { id: 1, title: 'A', active: 1 },
    { id: 2, title: 'B', active: 1 },
  ]
  const scores = new Map([[1, { motivated: 1, done: 1 }]])

  const picked = pickTask(tasks, scores, () => 0.1)
  assert.equal(picked.id, 1)
})

test('pickTask should prefer the highest motivated rate in the current time band', () => {
  const tasks = [
    { id: 1, title: 'A', active: 1 },
    { id: 2, title: 'B', active: 1 },
  ]
  const scores = new Map([
    [1, { motivated: 1, done: 2 }],
    [2, { motivated: 2, done: 2 }],
  ])

  const picked = pickTask(tasks, scores, () => 0.9)
  assert.equal(picked.id, 2)
  assert.equal(motivatedRate(scores.get(2)), 1)
})
