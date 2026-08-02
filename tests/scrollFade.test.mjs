import assert from 'node:assert/strict'
import test from 'node:test'
import { getScrollEdges, getScrollFadeStrength } from '../src/scrollEdges.ts'

test('getScrollEdges should detect scrollable content above and below', () => {
  assert.deepEqual(getScrollEdges(0, 100, 100), { up: false, down: false })
  assert.deepEqual(getScrollEdges(0, 100, 200), { up: false, down: true })
  assert.deepEqual(getScrollEdges(50, 100, 200), { up: true, down: true })
  assert.deepEqual(getScrollEdges(100, 100, 200), { up: true, down: false })
})

test('getScrollFadeStrength should scale with distance from each edge', () => {
  assert.deepEqual(getScrollFadeStrength(0, 100, 100), { up: 0, down: 0 })
  assert.deepEqual(getScrollFadeStrength(0, 100, 200), { up: 0, down: 1 })
  assert.deepEqual(getScrollFadeStrength(100, 100, 200), { up: 1, down: 0 })

  assert.equal(getScrollFadeStrength(24, 100, 200, 48).up, 0.5)
  assert.equal(getScrollFadeStrength(76, 100, 200, 48).down, 0.5)
  assert.equal(getScrollFadeStrength(50, 100, 160, 48).down, 10 / 48)
})
