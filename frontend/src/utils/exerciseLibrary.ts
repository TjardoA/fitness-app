import { equipmentLabels, exerciseById, muscleGroups, type CatalogExercise } from '../data/exercises'
import { equipmentTypeLabels, exerciseTypeLabels, movementLabels, muscleSubgroups } from '../data/exerciseTaxonomy'
import { targetMuscleLabels } from '../data/trainingSplits'
import { isRecord } from './validation'

const list = (value: unknown, valid: (value: unknown) => boolean, limit = 100): value is unknown[] => Array.isArray(value) && value.length <= limit && value.every(valid)
const key = (labels: object) => (value: unknown) => typeof value === 'string' && Object.hasOwn(labels,value)
const text = (value: unknown) => typeof value === 'string' && value.length <= 1000
export function validCustomExercises(value: unknown): value is CatalogExercise[] {
  return list(value, entry => isRecord(entry) && typeof entry.id === 'string' && /^custom-[a-z0-9-]{8,80}$/.test(entry.id) && !exerciseById.has(entry.id) &&
    entry.isCustom === true && typeof entry.name === 'string' && !!entry.name.trim() && entry.name.length <= 100 &&
    key(targetMuscleLabels)(entry.primaryMuscle) && list(entry.secondaryMuscles,key(targetMuscleLabels)) &&
    list(entry.aliases,text,30) && list(entry.muscleSubgroups,key(muscleSubgroups)) &&
    list(entry.equipment,key(equipmentLabels)) && list(entry.equipmentTypes,key(equipmentTypeLabels)) &&
    key(exerciseTypeLabels)(entry.exerciseType) && key(movementLabels)(entry.movementPattern) &&
    typeof entry.unilateral === 'boolean' && list(entry.instructions,text,20) &&
    (entry.notes === undefined || text(entry.notes)) &&
    (entry.unit === 'reps' || entry.unit === 'sec') && muscleGroups.some(group=>group===entry.muscle),10000) &&
    new Set(value.map(entry => (entry as CatalogExercise).id)).size === value.length
}
