import { useCallback, useEffect, useState } from 'react'
import { formatRate, loadTaskStats, TIME_BAND_LABELS, type TaskStat } from '../stats'
import { formatTauriError } from '../tauriRuntime'
import type { TimeBand } from '../timeBand'

const TIME_BANDS: TimeBand[] = ['morning', 'afternoon', 'evening']

export function StatsView() {
  const [stats, setStats] = useState<TaskStat[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const reload = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setStats(await loadTaskStats())
    } catch (loadError: unknown) {
      setError(formatTauriError(loadError))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  if (isLoading) {
    return (
      <section className="card card--loading" aria-busy="true" aria-label="統計を読み込み中">
        <span className="spinner" aria-hidden="true" />
        <p className="card__message">統計を読み込んでいます…</p>
      </section>
    )
  }

  if (error !== null) {
    return (
      <section className="card card--error" aria-label="エラー">
        <p className="card__message card__message--error">{error}</p>
        <div className="card__actions">
          <button className="btn btn--primary" type="button" onClick={() => void reload()}>
            もう一度試す
          </button>
        </div>
      </section>
    )
  }

  if (stats.length === 0) {
    return (
      <section className="card" aria-label="統計">
        <p className="card__message">まだ記録がありません</p>
      </section>
    )
  }

  return (
    <section className="card card--scroll" aria-label="統計">
      <div className="card__section">
        <h2 className="card__heading">やる気が出た率</h2>
        <p className="card__hint">時間帯ごとの Done 記録から集計しています。</p>
      </div>

      <div className="stats-table-wrap">
        <table className="stats-table">
          <thead>
            <tr>
              <th scope="col">タスク</th>
              {TIME_BANDS.map((band) => (
                <th key={band} scope="col">{TIME_BAND_LABELS[band]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stats.map((task) => (
              <tr key={task.taskId} className={task.active ? undefined : 'stats-table__row--inactive'}>
                <th scope="row">{task.title}</th>
                {TIME_BANDS.map((band) => {
                  const bandStat = task.bands[band]
                  const label = bandStat.done === 0
                    ? '—'
                    : `${formatRate(bandStat.rate)} (${bandStat.motivated}/${bandStat.done})`

                  return <td key={band}>{label}</td>
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
