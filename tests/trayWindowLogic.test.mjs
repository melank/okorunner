import assert from 'node:assert/strict'
import test from 'node:test'
import { decideTrayWindowAction } from '../src/trayWindowLogic.ts'

test('decideTrayWindowAction should open the popover when both windows are hidden', () => {
  assert.equal(
    decideTrayWindowAction({
      popoverVisible: false,
      manageVisible: false,
      popoverFocused: false,
      manageFocused: false,
    }),
    'show-popover',
  )
})

test('decideTrayWindowAction should hide all windows when either is focused', () => {
  assert.equal(
    decideTrayWindowAction({
      popoverVisible: true,
      manageVisible: false,
      popoverFocused: true,
      manageFocused: false,
    }),
    'hide-all',
  )

  assert.equal(
    decideTrayWindowAction({
      popoverVisible: false,
      manageVisible: true,
      popoverFocused: false,
      manageFocused: true,
    }),
    'hide-all',
  )
})

test('decideTrayWindowAction should raise the visible window when it is behind other apps', () => {
  assert.equal(
    decideTrayWindowAction({
      popoverVisible: true,
      manageVisible: false,
      popoverFocused: false,
      manageFocused: false,
    }),
    'raise-popover',
  )

  assert.equal(
    decideTrayWindowAction({
      popoverVisible: false,
      manageVisible: true,
      popoverFocused: false,
      manageFocused: false,
    }),
    'raise-manage',
  )
})

test('decideTrayWindowAction should prefer manage when both windows are visible behind other apps', () => {
  assert.equal(
    decideTrayWindowAction({
      popoverVisible: true,
      manageVisible: true,
      popoverFocused: false,
      manageFocused: false,
    }),
    'raise-manage',
  )
})
