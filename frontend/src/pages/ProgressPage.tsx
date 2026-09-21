import { useState, type SubmitEvent } from 'react'
import { EmptyState, PageHeading } from '../components/ui'
import { formatDate, newId } from '../utils/dates'
import type { WeightEntry, Workout } from '../types/models'
import { validWeight } from '../utils/validation'

interface Props { weights: WeightEntry[]; workouts: Workout[]; today: string; saving: boolean; error: string; onAdd: (entry: WeightEntry) => Promise<boolean> }
export function ProgressPage({ weights, workouts, today, saving, error, onAdd }: Props) {
  const [message, setMessage] = useState('')
  const ordered = [...weights].sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt))
  const latest = ordered.at(-1)
  const completed = workouts.filter(workout => workout.status === 'completed')
  const enoughDates = new Set(ordered.map(entry => entry.date)).size > 1
  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const entry: WeightEntry = { id: newId(), date: String(data.get('date')), weightKg: Number(data.get('weightKg')), createdAt: new Date().toISOString() }
    if (!validWeight(entry)) { setMessage('Enter a valid weight and date.'); return }
    if (await onAdd(entry)) { form.reset(); setMessage('Weigh-in saved. Earlier measurements and nutrition targets are unchanged.') }
  }
  return <>
    <PageHeading eyebrow="PROGRESS" title="Every little win." description="Strength, consistency and how you feel. It all counts." />
    <div className="grid lg:grid-cols-2 gap-5">
      <section className="card">
        <p className="eyebrow">LATEST WEIGH-IN</p>
        {latest ? <><div className="stat-value">{latest.weightKg} <span>kg</span></div><p className="muted text-sm">{formatDate(latest.date)}</p></> : <EmptyState title="Your progress starts here"><p>Add your first weigh-in.</p></EmptyState>}
        {!enoughDates ? <p className="muted mt-5">Add more weigh-ins to see your trend.</p> : <WeightChart entries={ordered} />}
        <p className="muted text-sm mt-5">For body recomposition, stable weight can accompany changes in strength and body composition.</p>
      </section>
      <section className="card profile-form"><h2>Add a weigh-in</h2>
        <form onSubmit={submit} className="profile-form">
          <fieldset disabled={saving} className="profile-form">
            <label>Date<input key={today} required type="date" name="date" max={today} defaultValue={today} /></label>
            <label>Weight (kg)<input required type="number" name="weightKg" inputMode="decimal" min={30} max={350} step="0.1" /></label>
            <button className="button button-primary" type="submit">{saving ? 'Saving…' : 'Save weigh-in'}</button>
          </fieldset>
        </form>
        <p role="status" className="text-sm text-lime">{message}</p>
        {error && <p role="alert" className="text-sm text-orange">{error}</p>}
        <p className="muted text-xs">A new weight does not change your targets. <a className="text-button" href="#/profile">Review your recommendations in Profile.</a></p>
      </section>
    </div>
    <section className="card mt-5"><h2>Weight history</h2>
      {ordered.length ? <ul className="weight-list">{[...ordered].reverse().map(entry => <li key={entry.id}><time dateTime={entry.date}>{formatDate(entry.date)}</time><strong>{entry.weightKg} kg</strong></li>)}</ul> : <EmptyState title="No weigh-ins yet"><p>Your measurements will stay here as you add new ones.</p></EmptyState>}
    </section>
    <section className="card mt-5"><h2>Workout history</h2>
      {!completed.length ? <EmptyState title="No previous workouts yet"><p>Your completed sessions will appear here once workout logging is available.</p></EmptyState> : <ul className="weight-list">{completed.map(workout => <li key={workout.id}><span>{workout.name}</span><time>{formatDate(workout.date)}</time></li>)}</ul>}
    </section>
  </>
}
function WeightChart({ entries }: { entries: WeightEntry[] }) {
  const firstTime = new Date(entries[0].date + 'T12:00:00').getTime()
  const lastTime = new Date(entries[entries.length - 1].date + 'T12:00:00').getTime()
  const min = Math.min(...entries.map(entry => entry.weightKg)) - 0.5
  const max = Math.max(...entries.map(entry => entry.weightKg)) + 0.5
  const points = entries.map(entry => ({
    x: 12 + (new Date(entry.date + 'T12:00:00').getTime() - firstTime) / (lastTime - firstTime) * 296,
    y: 100 - (entry.weightKg - min) / (max - min) * 80,
  }))
  return <figure className="weight-chart mt-5">
    <svg viewBox="0 0 320 120" role="img" aria-label="Recorded weight over time. Exact values are listed in weight history.">
      <path d="M12 110H308" stroke="var(--color-line)" />
      <polyline points={points.map(point => `${point.x},${point.y}`).join(' ')} fill="none" stroke="var(--color-purple)" strokeWidth="2" />
      {points.map((point, index) => <circle key={entries[index].id} cx={point.x} cy={point.y} r="3" fill="var(--color-purple)" />)}
    </svg>
    <figcaption className="muted text-xs">{formatDate(entries[0].date)} — {formatDate(entries[entries.length - 1].date)} · {min.toFixed(1)}–{max.toFixed(1)} kg</figcaption>
  </figure>
}

