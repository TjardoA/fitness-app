import { activityOptions, goalLabels, mealLabels } from '../data/profileOptions'
import type { FoodEntry, NutritionTargets, UserProfile, WeightEntry } from '../types/models'
import { isDate, localDate } from './dates'


export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
export function inRange(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max
}
export function validTargets(value: unknown): value is NutritionTargets {
  return isRecord(value) && inRange(value.calories, 1, 20000) &&
    ['protein', 'carbohydrates', 'fat'].every(key => inRange(value[key], 0, 5000))
}
export function validProfile(value: unknown): value is UserProfile {
  return isRecord(value) && typeof value.id === 'string' && !!value.id &&
    typeof value.name === 'string' && !!value.name.trim() && value.name.length <= 60 &&
    inRange(value.age, 18, 100) && Number.isInteger(value.age) &&
    ['female', 'male'].includes(String(value.sex)) &&
    inRange(value.heightCm, 100, 250) && inRange(value.weightKg, 30, 350) &&
    Object.hasOwn(activityOptions, String(value.activityLevel)) &&
    Object.hasOwn(goalLabels, String(value.goal)) &&
    inRange(value.trainingDaysPerWeek, 0, 7) && Number.isInteger(value.trainingDaysPerWeek) &&
    validTargets(value.targets)
}
export function validFood(value: unknown): value is FoodEntry {
  return isRecord(value) && typeof value.id === 'string' && !!value.id &&
    typeof value.name === 'string' && !!value.name.trim() && value.name.length <= 100 &&
    typeof value.serving === 'string' && !!value.serving.trim() && value.serving.length <= 100 &&
    Object.hasOwn(mealLabels, String(value.mealType)) &&
    ['calories', 'protein', 'carbohydrates', 'fat'].every(key => inRange(value[key], 0, key === 'calories' ? 20000 : 5000))
}
export function validWeight(value: unknown): value is WeightEntry {
  return isRecord(value) && typeof value.id === 'string' && !!value.id &&
    isDate(value.date) && value.date <= localDate() && inRange(value.weightKg, 30, 350) &&
    typeof value.createdAt === 'string' && Number.isFinite(Date.parse(value.createdAt))
}

