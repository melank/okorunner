import assert from 'node:assert/strict'
import test from 'node:test'
import { buildTaskStats, formatRate } from '../src/statsLogic.ts'

test('buildTaskStats should aggregate motivated rates by time band', () => {
  const stats = buildTaskStats(
    [{ id: 1, title: '洗う', active: 1 }],
    {
      morning: new Map([[1, { motivated: 1, done: 2 }]]),
      afternoon: new Map([[1, { motivated: 0, done: 1 }]]),
      evening: new Map(),
    },
  )

  assert.equal(stats.length, 1)
  assert.equal(stats[0]?.bands.morning.rate, 0.5)
  assert.equal(stats[0]?.bands.afternoon.rate, 0)
  assert.equal(stats[0]?.bands.evening.rate, 0.5)
})

test('formatRate should render a percentage label', () => {
  assert.equal(formatRate(0.5), '50%')
  assert.equal(formatRate(0.333), '33%')
})
