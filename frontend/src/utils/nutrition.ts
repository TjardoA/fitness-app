import { activityOptions } from '../data/profileOptions'
import type { FoodEntry, NutritionTargets, UserProfile } from '../types/models'

export type NutritionInputs = Pick<UserProfile, 'age' | 'sex' | 'heightCm' | 'weightKg' | 'activityLevel' | 'goal'>
// Mifflin-St Jeor: https://pubmed.ncbi.nlm.nih.gov/2305711/
// These activity factors and goal adjustments are transparent starting heuristics.
export function calculateRecommendation(profile: NutritionInputs) {
  const bmr = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age + (profile.sex === 'male' ? 5 : -161)
  const multiplier = activityOptions[profile.activityLevel].multiplier
  const maintenance = bmr * multiplier
  const adjustment = { 'fat-loss': 0.9, 'muscle-gain': 1.05, recomposition: 1, maintenance: 1 }[profile.goal]
  const calories = Math.round(maintenance * adjustment)
  // 1.4–2.0 g/kg is the ISSN range for most exercising adults.
  // https://pmc.ncbi.nlm.nih.gov/articles/PMC5477153/
  const protein = Math.round(profile.weightKg * (profile.goal === 'maintenance' ? 1.6 : 2))
  const fat = Math.round(calories * 0.3 / 9)
  const carbohydrates = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4))
  return { bmr: Math.round(bmr), maintenance: Math.round(maintenance), multiplier, adjustment,
    targets: { calories, protein, carbohydrates, fat } }
}
export function totalNutrition(entries: FoodEntry[]): NutritionTargets {
  const total = entries.reduce((sum, entry) => ({
    calories: sum.calories + entry.calories, protein: sum.protein + entry.protein,
    carbohydrates: sum.carbohydrates + entry.carbohydrates, fat: sum.fat + entry.fat,
  }), { calories: 0, protein: 0, carbohydrates: 0, fat: 0 })
  const round = (value: number) => Math.round(value * 10) / 10
  return { calories: round(total.calories), protein: round(total.protein),
    carbohydrates: round(total.carbohydrates), fat: round(total.fat) }
}
export function macroCalories(targets: NutritionTargets) {
  return Math.round(targets.protein * 4 + targets.carbohydrates * 4 + targets.fat * 9)
}

