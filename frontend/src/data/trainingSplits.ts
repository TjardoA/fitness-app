import type { TargetMuscle, TrainingFocus, WorkoutDay, WorkoutPlan, WorkoutSplit } from '../types/models'
import type { CatalogExercise } from './exercises'

export const targetMuscleLabels: Record<TargetMuscle, string> = {
  chest: 'Chest', back: 'Back / lats', 'front-delts': 'Front delts', 'side-delts': 'Side delts', 'rear-delts': 'Rear delts',
  biceps: 'Biceps', triceps: 'Triceps', quads: 'Quadriceps', hamstrings: 'Hamstrings', glutes: 'Glutes', calves: 'Calves', core: 'Core', forearms: 'Forearms', adductors: 'Hip adductors', abductors: 'Hip abductors', 'hip-flexors': 'Hip flexors', erectors: 'Erector spinae', neck: 'Neck',
}
const shoulders: TargetMuscle[] = ['front-delts', 'side-delts', 'rear-delts']
const legs: TargetMuscle[] = ['quads', 'hamstrings', 'glutes', 'calves']
const upper: TargetMuscle[] = ['chest', 'back', ...shoulders, 'biceps', 'triceps']
export const focusLabels: Record<TrainingFocus, string> = {
  all: 'Free choice', push: 'Push', pull: 'Pull', legs: 'Legs', arms: 'Full arms', upper: 'Upper body',
  'upper-main': 'Upper body · chest, back & shoulders', 'shoulders-arms': 'Shoulders + Arms',
  'chest-back': 'Chest + Back', chest: 'Chest', back: 'Back', shoulders: 'Shoulders', full: 'Full body', rest: 'Rest',
}
export const focusTargets: Record<TrainingFocus, TargetMuscle[]> = {
  all: [], push: ['chest', 'front-delts', 'side-delts', 'triceps'], pull: ['back', 'biceps', 'rear-delts'],
  legs, arms: ['biceps', 'triceps'], upper, 'upper-main': ['chest', 'back', ...shoulders],
  'shoulders-arms': [...shoulders, 'biceps', 'triceps'], 'chest-back': ['chest', 'back'],
  chest: ['chest'], back: ['back', 'rear-delts'], shoulders, full: [...upper, ...legs, 'core'], rest: [],
}
export const focusDescriptions: Record<TrainingFocus, string> = Object.fromEntries(Object.entries(focusTargets).map(([key, targets]) => [key,
  key === 'rest' ? 'A little space to recover.' : key === 'all' ? 'Choose your own muscle groups below.' : targets.map(target => targetMuscleLabels[target]).join(' · '),
])) as Record<TrainingFocus, string>
export function createTrainingDay(id: string, focus: TrainingFocus, name = focusLabels[focus]): WorkoutDay {
  return { id, name: focus === 'all' ? 'My workout' : name, type: focus === 'rest' ? 'rest' : 'workout', targetMuscleGroups: [...focusTargets[focus]], exercises: [] }
}
function template(id: string, name: string, description: string, focuses: TrainingFocus[]): WorkoutSplit {
  return { id, name, description, recommendedDaysPerWeek: focuses.filter(focus => focus !== 'rest').length,
    days: focuses.map((focus, index) => ({ ...createTrainingDay(`${id}-day-${index+1}`, focus, focus === 'upper-main' ? 'Upper Body' : focusLabels[focus]),
      exercises: (starterExercises[focus] ?? []).map(exerciseId => ({ exerciseId, sets: 3, reps: 10, weightKg: null, restSeconds: 90 })) })) }
}
// Editable starting examples from the supplied split brief, not logged workouts.
const starterExercises: Partial<Record<TrainingFocus, string[]>> = {
  push: ['bench-press','incline-press','shoulder-press','lateral-raise','triceps-pushdown','overhead-triceps'],
  pull: ['lat-pulldown','chest-supported-row','cable-row','face-pull','bicep-curl','hammer-curl'],
  legs: ['squat','leg-press','rdl','leg-curl','leg-extension','calf-raise'],
  upper: ['bench-press','lat-pulldown','cable-row','shoulder-press','bicep-curl','triceps-pushdown'],
  'upper-main': ['bench-press','incline-press','lat-pulldown','cable-row','shoulder-press','lateral-raise'],
  'shoulders-arms': ['shoulder-press','lateral-raise','rear-delt-fly','bicep-curl','hammer-curl','triceps-pushdown','overhead-triceps'],
  'chest-back': ['bench-press','incline-press','lat-pulldown','chest-supported-row'],
  chest: ['bench-press','incline-press','chest-fly'], back: ['lat-pulldown','cable-row','chest-supported-row','face-pull'],
  shoulders: ['shoulder-press','lateral-raise','rear-delt-fly'], arms: ['bicep-curl','hammer-curl','triceps-pushdown','overhead-triceps'],
  full: ['squat','rdl','bench-press','lat-pulldown','shoulder-press'],
}
// Templates describe data. Every template uses the same editable day and exercise UI.
export const trainingSplits: WorkoutSplit[] = [
  template('ppl5', 'Push Pull Legs', 'Push · Pull · Legs · Upper · Shoulders & Arms', ['push','pull','legs','rest','upper-main','shoulders-arms','rest']),
  template('upper-lower', 'Upper / Lower', 'Upper · Lower · Upper · Lower', ['upper','legs','rest','upper','legs','rest','rest']),
  template('full-body', 'Full Body', 'Full Body · Full Body · Full Body', ['full','rest','full','rest','full','rest','rest']),
  template('arnold', 'Arnold Split', 'Chest & Back · Shoulders & Arms · Legs', ['chest-back','shoulders-arms','legs','chest-back','shoulders-arms','legs','rest']),
  template('bro', 'Bro Split', 'Chest · Back · Shoulders · Legs · Arms', ['chest','back','shoulders','legs','arms','rest','rest']),
]
// Keeping lower-day naming in the template doesn't create a separate type of page.
trainingSplits.find(split => split.id === 'upper-lower')!.days.forEach(day => { if (day.name === 'Legs') day.name = 'Lower' })
export function getDayFocus(day: WorkoutDay): TrainingFocus {
  if (day.type === 'rest') return 'rest'
  return (Object.keys(focusTargets) as TrainingFocus[]).find(focus => focus !== 'rest' &&
    focusTargets[focus].length === day.targetMuscleGroups.length && focusTargets[focus].every(target => day.targetMuscleGroups.includes(target))) ?? 'all'
}
export function matchesDay(exercise: CatalogExercise, day: WorkoutDay) {
  return day.type === 'workout' && (!day.targetMuscleGroups.length || day.targetMuscleGroups.includes(exercise.primaryMuscle))
}
export function applySplit(plan: WorkoutPlan, templateId: string): WorkoutPlan {
  const selected = trainingSplits.find(split => split.id === templateId)
  if (!selected && templateId !== 'custom') throw new Error('Unknown workout template.')
  return { ...plan, name: selected?.name ?? 'My training plan', templateId: selected?.id ?? null, customized: false,
    days: selected ? structuredClone(selected.days) : Array.from({length:7}, (_, index) => createTrainingDay(`custom-day-${index+1}`, 'rest')) }
}
export function updatePlanDay(plan: WorkoutPlan, day: WorkoutDay): WorkoutPlan {
  return { ...plan, customized: true, days: plan.days.map(item => item.id === day.id ? day : item) }
}
export function movePlanDay(plan: WorkoutPlan, from: number, to: number): WorkoutPlan {
  if (from < 0 || to < 0 || from >= plan.days.length || to >= plan.days.length) return plan
  const days = [...plan.days]
  const [day] = days.splice(from, 1)
  days.splice(to, 0, day)
  return { ...plan, customized: true, days }
}
