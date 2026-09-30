import { equipmentLabels, indexExercises, type CatalogExercise } from '../data/exercises'
import { focusLabels, focusTargets, targetMuscleLabels } from '../data/trainingSplits'
import type { PlannedExercise, TrainingFocus, WorkoutPlan } from '../types/models'
import { inRange, isRecord } from './validation'

function validExercise(value: unknown, catalog: Map<string, CatalogExercise>, legacy = false): value is PlannedExercise {
  return isRecord(value) && typeof value.exerciseId === 'string' && catalog.has(value.exerciseId) &&
    inRange(value.sets, 1, 20) && Number.isInteger(value.sets) &&
    inRange(value.reps, 1, catalog.get(value.exerciseId)?.unit === 'sec' ? 600 : 100) && Number.isInteger(value.reps) &&
    (value.repsMax === undefined || (value.repsMax !== null && inRange(value.repsMax, Number(value.reps), 100) && Number.isInteger(value.repsMax) && catalog.get(value.exerciseId)?.unit === 'reps')) &&
    (legacy || ((value.weightKg === null || inRange(value.weightKg, 0, 1000)) && inRange(value.restSeconds, 0, 1800) && Number.isInteger(value.restSeconds)))
}
function common(value: unknown, catalog: Map<string, CatalogExercise>): value is Record<string, unknown> & { days: Record<string, unknown>[]; equipment: string[]; favorites: string[]; gymConfigured: boolean } {
  return isRecord(value) && value.id === 'weekly-plan' && typeof value.gymConfigured === 'boolean' &&
    Array.isArray(value.equipment) && value.equipment.every(item => typeof item === 'string' && Object.hasOwn(equipmentLabels, item)) &&
    Array.isArray(value.favorites) && value.favorites.every(item => typeof item === 'string' && catalog.has(item)) &&
    Array.isArray(value.days) && value.days.length === 7 && value.days.every(day => isRecord(day) && typeof day.name === 'string' && day.name.length <= 60 &&
      Array.isArray(day.exercises) && day.exercises.length <= 20 &&
      new Set(day.exercises.map(item => isRecord(item) ? item.exerciseId : null)).size === day.exercises.length)
}
export function validWorkoutPlan(value: unknown, custom: CatalogExercise[] = []): value is WorkoutPlan {
  const catalog = indexExercises(custom)
  if (!common(value, catalog) || value.schemaVersion !== 2 || typeof value.name !== 'string' || !value.name.trim() || value.name.length > 80 ||
    !(value.templateId === null || (typeof value.templateId === 'string' && value.templateId.length > 0 && value.templateId.length <= 80)) ||
    typeof value.customized !== 'boolean' || new Set(value.days.map(day => day.id)).size !== 7) return false
  return value.days.every(day => typeof day.id === 'string' && !!day.id && day.id.length <= 100 &&
    typeof day.name === 'string' && !!day.name.trim() && (day.type === 'workout' || day.type === 'rest') &&
    Array.isArray(day.targetMuscleGroups) && new Set(day.targetMuscleGroups).size === day.targetMuscleGroups.length &&
    day.targetMuscleGroups.every(target => typeof target === 'string' && Object.hasOwn(targetMuscleLabels, target)) &&
    Array.isArray(day.exercises) && day.exercises.every(item => validExercise(item, catalog)) &&
    (day.type !== 'rest' || (!day.exercises.length && !day.targetMuscleGroups.length)))
}
// Read-only migration: never overwrite a saved plan just because the app opens.
// Existing presets retain their actual day order, names, exercises and prescription.
export function parseWorkoutPlan(value: unknown, custom: CatalogExercise[] = []): WorkoutPlan {
  const catalog = indexExercises(custom)
  if (validWorkoutPlan(value, custom)) return value
  if (!common(value, catalog) || value.schemaVersion !== undefined ||
    (value.split !== undefined && !['custom','ppl3','ppl6','upper-lower','full-body'].includes(String(value.split))) ||
    !value.days.every(day => (day.focus === undefined || (typeof day.focus === 'string' && Object.hasOwn(focusLabels, day.focus))) &&
      Array.isArray(day.exercises) && day.exercises.every(item => validExercise(item, catalog, true)))) {
    throw new Error('Your saved workout plan could not be read. Nothing has been overwritten.')
  }
  const migrated: WorkoutPlan = {
    id: 'weekly-plan', schemaVersion: 2, name: 'My training plan', templateId: typeof value.split === 'string' ? value.split : null, customized: true,
    equipment: [...value.equipment], favorites: [...value.favorites], gymConfigured: value.gymConfigured,
    days: value.days.map((day, index) => {
      const focus = (day.focus ?? 'all') as TrainingFocus
      const entries = day.exercises as PlannedExercise[]
      const rest = focus === 'rest' && !entries.length
      return { id: `migrated-day-${index+1}`, name: String(day.name).trim() || (rest ? 'Rest' : focusLabels[focus] === 'Free choice' ? 'My workout' : focusLabels[focus]),
        type: rest ? 'rest' : 'workout', targetMuscleGroups: rest ? [] : [...focusTargets[focus]],
        exercises: entries.map(entry => ({ exerciseId: entry.exerciseId, sets: entry.sets, reps: entry.reps, weightKg: null, restSeconds: 90 })) }
    }),
  }
  if (!validWorkoutPlan(migrated, custom)) throw new Error('Your saved workout plan could not be upgraded. Nothing has been overwritten.')
  return migrated
}
