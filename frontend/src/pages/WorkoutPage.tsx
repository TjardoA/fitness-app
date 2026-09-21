import { EmptyState, PageHeading } from '../components/ui'
import { workoutTemplates } from '../data/workoutTemplates'
import type { Workout } from '../types/models'

export function WorkoutPage({ workouts, today }: { workouts: Workout[]; today: string }) {
  const completedToday = workouts.filter(workout => workout.date === today && workout.status === 'completed')
  return <>
    <PageHeading eyebrow="TRAINING" title="Build your strength." description="A simple routine. Room to grow." />
    <section className="card">
      {completedToday.length ? <><h2>Today’s completed workouts</h2>{completedToday.map(workout => <p key={workout.id}>{workout.name}</p>)}</> :
        <EmptyState title="No workout completed today"><p>Explore the templates below to plan your next session. Rest days count as part of your routine, too.</p></EmptyState>}
    </section>
    <p className="info-note mb-5">These are exercise templates, not your history. Session logging will be added in the next phase.</p>
    {workoutTemplates.map(template => <section key={template.name} className="card mt-5">
      <div className="section-heading"><h2>{template.name}</h2><span className="pill">TEMPLATE</span></div>
      <p className="muted mb-6">{template.focus}</p>
      <div className="exercise-list">{template.exercises.map(([name, detail], index) => <div key={name}>
        <span className="exercise-index">0{index + 1}</span>
        <div><h3>{name}</h3><p className="muted text-sm">{detail}</p></div>
      </div>)}</div>
    </section>)}
    {!workouts.some(workout => workout.status === 'completed') && <EmptyState title="No previous workouts yet"><p>Your history starts empty. Templates do not add completed sessions or records.</p></EmptyState>}
  </>
}

