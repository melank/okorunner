import { useCallback, useEffect, useState } from 'react'
import {
  DEFAULT_EPSILON,
  getEpsilon,
  MAX_EPSILON,
  MIN_EPSILON,
  setEpsilon,
} from '../settings'
import { formatTauriError } from '../tauriRuntime'

export function SettingsView() {
  const [epsilon, setEpsilonValue] = useState(String(DEFAULT_EPSILON))
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState(false)

  const load = useCallback(async () => {
    setError(null)
    try {
      const current = await getEpsilon()
      setEpsilonValue(String(current))
    } catch (loadError: unknown) {
      setError(formatTauriError(loadError))
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <section className="card" aria-label="設定">
      <div className="card__section">
        <h2 className="card__heading">提案の設定</h2>
        <p className="card__hint">
          0に近いほどこの時間帯のやる気実績を優先し、1に近いほど無作為に選びます。
        </p>
      </div>

      {error !== null && <p className="form-error">{error}</p>}
      {message !== null && <p className="form-success">{message}</p>}

      <form
        className="settings-form"
        onSubmit={(event) => {
          event.preventDefault()
          void (async () => {
            setIsBusy(true)
            setError(null)
            setMessage(null)
            try {
              const value = Number(epsilon)
              await setEpsilon(value)
              setMessage('設定を保存しました')
            } catch (saveError: unknown) {
              setError(formatTauriError(saveError))
            } finally {
              setIsBusy(false)
            }
          })()
        }}
      >
        <label className="field">
          <span className="field__label">無作為に選ぶ割合（0〜1）</span>
          <input
            className="field-input"
            type="number"
            min={MIN_EPSILON}
            max={MAX_EPSILON}
            step="0.05"
            value={epsilon}
            disabled={isBusy}
            onChange={(event) => setEpsilonValue(event.target.value)}
          />
        </label>
        <button className="btn btn--primary" type="submit" disabled={isBusy}>
          保存
        </button>
      </form>
    </section>
  )
}
