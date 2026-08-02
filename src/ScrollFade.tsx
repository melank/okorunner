import { useCallback, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { getScrollFadeStrength } from './scrollEdges'

type ScrollFadeProps = {
  className?: string
  children: ReactNode
}

export function ScrollFade({ className, children }: ScrollFadeProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [fade, setFade] = useState({ up: 0, down: 0 })

  const updateFade = useCallback(() => {
    const viewport = viewportRef.current
    if (viewport === null) {
      return
    }

    setFade(getScrollFadeStrength(
      viewport.scrollTop,
      viewport.clientHeight,
      viewport.scrollHeight,
    ))
  }, [])

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (viewport === null) {
      return
    }

    updateFade()

    const observer = new ResizeObserver(updateFade)
    observer.observe(viewport)

    viewport.addEventListener('scroll', updateFade, { passive: true })

    return () => {
      observer.disconnect()
      viewport.removeEventListener('scroll', updateFade)
    }
  }, [updateFade, children])

  const classNames = ['scroll-fade', className].filter((value): value is string => (
    value !== undefined && value.length > 0
  )).join(' ')

  const style = {
    '--scroll-fade-strength-top': fade.up,
    '--scroll-fade-strength-bottom': fade.down,
  } as CSSProperties

  return (
    <div className={classNames} style={style}>
      <div className="scroll-fade__shadow scroll-fade__shadow--top" aria-hidden="true" />
      <div ref={viewportRef} className="scroll-fade__viewport">
        {children}
      </div>
      <div className="scroll-fade__shadow scroll-fade__shadow--bottom" aria-hidden="true" />
    </div>
  )
}
