import assert from 'node:assert/strict'
import test from 'node:test'
import { DEFAULT_EPSILON, MAX_EPSILON, MIN_EPSILON, parseEpsilon } from '../src/settingsLogic.ts'

test('parseEpsilon should accept values between 0 and 1', () => {
  assert.equal(parseEpsilon('0'), 0)
  assert.equal(parseEpsilon('0.2'), 0.2)
  assert.equal(parseEpsilon('1'), 1)
})

test('parseEpsilon should reject invalid values', () => {
  assert.equal(parseEpsilon('-0.1'), null)
  assert.equal(parseEpsilon('1.1'), null)
  assert.equal(parseEpsilon('abc'), null)
})

test('DEFAULT_EPSILON should stay within the allowed range', () => {
  assert.ok(DEFAULT_EPSILON >= MIN_EPSILON)
  assert.ok(DEFAULT_EPSILON <= MAX_EPSILON)
})
