export const EPSILON_SETTING_KEY = 'epsilon'
export const DEFAULT_EPSILON = 0.2
export const MIN_EPSILON = 0
export const MAX_EPSILON = 1

export function parseEpsilon(value: string): number | null {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < MIN_EPSILON || parsed > MAX_EPSILON) {
    return null
  }

  return parsed
}
