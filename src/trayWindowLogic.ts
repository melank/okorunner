export type TrayWindowState = {
  popoverVisible: boolean
  manageVisible: boolean
  popoverFocused: boolean
  manageFocused: boolean
}

export type TrayWindowAction = 'show-popover' | 'hide-all' | 'raise-manage' | 'raise-popover'

export function decideTrayWindowAction(state: TrayWindowState): TrayWindowAction {
  const anyVisible = state.popoverVisible || state.manageVisible
  const anyFocused = state.popoverFocused || state.manageFocused

  if (!anyVisible) {
    return 'show-popover'
  }

  if (anyFocused) {
    return 'hide-all'
  }

  if (state.manageVisible) {
    return 'raise-manage'
  }

  if (state.popoverVisible) {
    return 'raise-popover'
  }

  return 'show-popover'
}
