import { useCallback, useEffect, useState } from 'react'
import { listRecentCompletions, TIME_BAND_LABELS, undoSuggestionCompletion, type RecentCompletion } from '../suggest'
import { formatRate, loadTaskStats, type TaskStat } from '../stats'
import { formatTauriError } from '../tauriRuntime'
import type { TimeBand } from '../timeBand'

const TIME_BANDS: TimeBand[] = ['morning', 'afternoon', 'evening']

function formatDoneAt(doneAt: string): string {
  const date = new Date(doneAt)
  if (Number.isNaN(date.getTime())) {
    return doneAt
  }

  return date.toLocaleString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function StatsView() {
  const [stats, setStats] = useState<TaskStat[]>([])
  const [recentCompletions, setRecentCompletions] = useState<RecentCompletion[]>([])
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [undoingId, setUndoingId] = useState<number | null>(null)

  const reload = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [nextStats, nextRecent] = await Promise.all([
        loadTaskStats(),
        listRecentCompletions(),
      ])
      setStats(nextStats)
      setRecentCompletions(nextRecent)
    } catch (loadError: unknown) {
      setError(formatTauriError(loadError))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const undoCompletion = useCallback(async (completion: RecentCompletion) => {
    setUndoingId(completion.id)
    setError(null)
    setMessage(null)

    try {
      await undoSuggestionCompletion(completion.id)
      setMessage(`「${completion.title}」の Done を取り消しました`)
      await reload()
    } catch (undoError: unknown) {
      setError(formatTauriError(undoError))
    } finally {
      setUndoingId(null)
    }
  }, [reload])

  if (isLoading) {
    return (
      <section className="card card--loading" aria-busy="true" aria-label="統計を読み込み中">
        <span className="spinner" aria-hidden="true" />
        <p className="card__message">統計を読み込んでいます…</p>
      </section>
    )
  }

  if (error !== null && stats.length === 0 && recentCompletions.length === 0) {
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

  const hasDoneStats = stats.some((task) =>
    TIME_BANDS.some((band) => task.bands[band].done > 0),
  )

  return (
    <section className="card card--scroll" aria-label="統計">
      <div className="card__section">
        <h2 className="card__heading">やる気が出た率</h2>
        <p className="card__hint">時間帯ごとの Done 記録から集計しています。</p>
      </div>

      {error !== null && <p className="form-error">{error}</p>}
      {message !== null && <p className="form-success">{message}</p>}

      {!hasDoneStats ? (
        <p className="card__message">まだ記録がありません</p>
      ) : (
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
      )}

      {recentCompletions.length > 0 && (
        <div className="card__section recent-completions">
          <h3 className="card__heading">最近の記録</h3>
          <p className="card__hint">間違えて Done したときは、ここから取り消せます。</p>
          <ul className="recent-completions__list">
            {recentCompletions.map((completion) => (
              <li key={completion.id} className="recent-completions__item">
                <div className="recent-completions__main">
                  <span className="recent-completions__title">{completion.title}</span>
                  <span className="recent-completions__meta">
                    {formatDoneAt(completion.doneAt)} ・ {TIME_BAND_LABELS[completion.timeBand]}
                    ・ {completion.motivated ? 'やる気が出た Done' : 'Done'}
                  </span>
                </div>
                <button
                  className="recent-completions__undo"
                  type="button"
                  disabled={undoingId !== null}
                  onClick={() => void undoCompletion(completion)}
                >
                  取り消す
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
