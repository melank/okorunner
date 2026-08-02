/** Full shadow strength is reached after this many pixels from the edge. */
export const SCROLL_FADE_RAMP_DISTANCE = 48

export type ScrollFadeStrength = {
  up: number
  down: number
}

export type ScrollEdges = {
  up: boolean
  down: boolean
}

function clampStrength(distance: number, rampDistance: number): number {
  if (distance <= 0 || rampDistance <= 0) {
    return 0
  }

  return Math.min(1, distance / rampDistance)
}

export function getScrollFadeStrength(
  scrollTop: number,
  clientHeight: number,
  scrollHeight: number,
  rampDistance = SCROLL_FADE_RAMP_DISTANCE,
): ScrollFadeStrength {
  const scrollableUp = Math.max(0, scrollTop)
  const scrollableDown = Math.max(0, scrollHeight - scrollTop - clientHeight)

  return {
    up: clampStrength(scrollableUp, rampDistance),
    down: clampStrength(scrollableDown, rampDistance),
  }
}

export function getScrollEdges(
  scrollTop: number,
  clientHeight: number,
  scrollHeight: number,
  threshold = 1,
): ScrollEdges {
  return {
    up: scrollTop > threshold,
    down: scrollTop + clientHeight < scrollHeight - threshold,
  }
}
