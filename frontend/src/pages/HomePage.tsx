import { Icon } from '../components/Icon'
import { EmptyState, Meter, PageHeading } from '../components/ui'
import { totalNutrition } from '../utils/nutrition'
import { formatDate, localDate } from '../utils/dates'
import type { AppData, UserProfile } from '../types/models'

export function HomePage({ data, profile, today }: { data: AppData; profile: UserProfile; today: string }) {
  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening'
  const day = data.nutrition.find(item => item.date === today)
  const consumed = totalNutrition(day?.entries ?? [])
  const targets = day?.targets ?? profile.targets
  const remaining = Math.round((targets.calories - consumed.calories) * 10) / 10
  const percentage = Math.min(100, consumed.calories / targets.calories * 100)
  const latestWeight = [...data.weights].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))[0]
  const completed = data.workouts.filter(workout => workout.status === 'completed')
  const completedToday = completed.filter(workout => workout.date === today)
  const monday = new Date(today + 'T12:00:00')
  monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7)
  const weekStart = localDate(monday)
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday)
    date.setDate(date.getDate() + index)
    return { date: localDate(date), label: date.toLocaleDateString('en-GB', { weekday: 'short' }) }
  })
  const trainedDays = new Set(completed.filter(workout => workout.date >= weekStart && workout.date <= today).map(workout => workout.date))
  const plannedToday = data.workoutPlan.days[(new Date(today + 'T12:00:00').getDay() + 6) % 7]
  const scheduledDays = data.workoutPlan.days.filter(day => day.type === 'workout').length
  return <>
    <PageHeading eyebrow={formatDate(today)} title={`${greeting}, ${profile.name}.`} description="Make time for yourself. Make today count."
      action={<a className="date-chip" href="#/progress"><span className="status-dot" /> Your daily overview</a>} />
    <div className="dashboard-grid">
      <section className="card workout-card">
        <div className="flex justify-between items-center"><p className="eyebrow">TODAY’S WORKOUT</p><span className="pill">YOUR PACE</span></div>
        <div className="workout-art" aria-hidden="true"><div className="weight-bar" /><div className="weight-plate plate-one" /><div className="weight-plate plate-two" /><div className="weight-plate plate-three" /><div className="weight-plate plate-four" /></div>
        <div className="workout-copy">
          <h2>Show up.<br />Get stronger.</h2>
          <p className="muted">{completedToday.length ? `${completedToday.length} workout(s) completed today` : 'No workout completed today.'}</p>
          <p className="muted text-sm my-5">{scheduledDays ? `${scheduledDays} training ${scheduledDays === 1 ? 'day' : 'days'} in your weekly plan.` : `Your goal: ${profile.trainingDaysPerWeek} training ${profile.trainingDaysPerWeek === 1 ? 'day' : 'days'} per week.`}</p>
          <p className="muted text-sm mb-4">{plannedToday.exercises.length ? `${plannedToday.name || 'Your plan'} · ${plannedToday.exercises.length} exercises today` : plannedToday.type === 'rest' ? 'Rest day. A little space to recover.' : 'No exercises planned today. Make it yours.'}</p>
          <a href="#/workout" className="button button-primary">Your workout plan <Icon name="arrow" /></a>
          <p className="text-xs muted mt-3">Workout logging is coming next.</p>
        </div>
      </section>
      <section className="card nutrition-card">
        <div className="section-heading"><h2>Daily fuel</h2><a href="#/nutrition" aria-label="View nutrition"><Icon name="arrow" /></a></div>
        <p className="muted text-sm">{day?.entries.length ? 'Your logged food, all in one place.' : 'No meals logged yet.'}</p>
        <div className="calorie-overview">
          <div className="calorie-ring" style={{ background: `conic-gradient(var(--color-lime) 0 ${percentage}%, #343a2e ${percentage}% 100%)` }}
            role="img" aria-label={`${consumed.calories} of ${targets.calories} kcal consumed`}>
            <div><Icon name="flame" /><strong>{consumed.calories.toLocaleString('en-GB')}</strong><span>of {targets.calories.toLocaleString('en-GB')} kcal</span></div>
          </div>
          <div><span className="eyebrow">{remaining < 0 ? 'OVER TARGET' : 'LEFT TODAY'}</span><p className="remaining-value">{Math.abs(remaining).toLocaleString('en-GB')}<span> kcal</span></p></div>
        </div>
        <Meter label="Protein" value={consumed.protein} target={targets.protein} tone="purple" />
        <div className="grid grid-cols-2 gap-5 mt-5"><Meter label="Carbs" value={consumed.carbohydrates} target={targets.carbohydrates} /><Meter label="Fat" value={consumed.fat} target={targets.fat} tone="orange" /></div>
      </section>
      <section className="card stat-card">
        <div className="stat-icon tone-purple"><Icon name="progress" /></div><p className="muted">Latest weight</p>
        <div className="stat-value">{latestWeight?.weightKg ?? '—'} <span>kg</span></div>
        <p className="text-xs muted">{latestWeight ? formatDate(latestWeight.date) : 'Add your first weigh-in.'}</p>
        {data.weights.length < 2 && <p className="muted text-xs mt-2">Add more weigh-ins to see your trend.</p>}
      </section>
      <section className="card stat-card">
        <div className="stat-icon tone-orange"><Icon name="workout" /></div><p className="muted">Completed sessions</p>
        <div className="stat-value">{completed.length} <span>total</span></div>
        <p className="text-xs muted">{completed.length ? 'Every session is part of your story.' : 'No previous workouts yet. Your progress starts here.'}</p>
      </section>
    </div>
    <div className="lower-grid">
      <section className="card">
        <div className="section-heading"><h2>Your weekly rhythm</h2><span className="muted text-sm">{trainedDays.size} / {profile.trainingDaysPerWeek} days</span></div>
        <div className="week-strip">{weekDays.map(day => <div key={day.date}><span className="muted text-xs">{day.label}</span><span className={`day-dot ${trainedDays.has(day.date) ? 'day-done' : ''}`} aria-label={`${day.label}: ${trainedDays.has(day.date) ? 'trained' : 'no session recorded'}`}>{trainedDays.has(day.date) ? '✓' : '—'}</span></div>)}</div>
        {!trainedDays.size && <p className="muted text-sm">No training days recorded this week.</p>}
      </section>
      <section className="quick-actions">
        <p className="eyebrow">A SMALL STEP FORWARD</p>
        <a href="#/nutrition"><span className="action-icon tone-lime"><Icon name="plus" /></span><span>Log your food<small>Add a meal to your daily diary</small></span><Icon name="arrow" /></a>
        <a href="#/progress"><span className="action-icon tone-purple"><Icon name="progress" /></span><span>Add a weigh-in<small>Your progress, beyond the scale</small></span><Icon name="arrow" /></a>
        <a href="#/profile"><span className="action-icon tone-orange"><Icon name="profile" /></span><span>Your goals, your way<small>Review your profile and targets</small></span><Icon name="arrow" /></a>
      </section>
    </div>
    {!data.weights.length && <EmptyState title="Your progress starts here"><a href="#/progress" className="text-button">Add your first weight measurement</a></EmptyState>}
  </>
}

