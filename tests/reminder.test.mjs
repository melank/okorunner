import assert from 'node:assert/strict'
import test from 'node:test'
import {
  msUntilReminder,
  REMINDER_INTERVAL_MS,
  shouldRemind,
} from '../src/reminder.ts'

const THIRTY_MINUTES_MS = REMINDER_INTERVAL_MS

test('shouldRemind should be false before the reminder interval elapses', () => {
  const suggestion = {
    id: 1,
    title: '皿洗い',
    suggestedAt: '2026-08-01T10:00:00',
  }

  assert.equal(
    shouldRemind(suggestion, new Date('2026-08-01T10:29:59'), THIRTY_MINUTES_MS),
    false,
  )
})

test('shouldRemind should be true once the reminder interval has passed', () => {
  const suggestion = {
    id: 1,
    title: '皿洗い',
    suggestedAt: '2026-08-01T10:00:00',
  }

  assert.equal(
    shouldRemind(suggestion, new Date('2026-08-01T10:30:00'), THIRTY_MINUTES_MS),
    true,
  )
})

test('msUntilReminder should return remaining milliseconds until reminder', () => {
  const suggestion = {
    id: 1,
    title: '皿洗い',
    suggestedAt: '2026-08-01T10:00:00',
  }

  assert.equal(
    msUntilReminder(suggestion, new Date('2026-08-01T10:10:00'), THIRTY_MINUTES_MS),
    20 * 60 * 1000,
  )
  assert.equal(
    msUntilReminder(suggestion, new Date('2026-08-01T10:45:00'), THIRTY_MINUTES_MS),
    0,
  )
})
