export type FitnessGoal = 'fat-loss' | 'muscle-gain' | 'recomposition' | 'maintenance'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'high'
export type Sex = 'female' | 'male'
export interface NutritionTargets {
  calories: number
  protein: number
  carbohydrates: number
  fat: number
}
export type MacroTargets = NutritionTargets
export interface UserProfile {
  id: string
  name: string
  age: number
  sex: Sex
  heightCm: number
  weightKg: number
  activityLevel: ActivityLevel
  trainingDaysPerWeek: number
  goal: FitnessGoal
  targets: NutritionTargets
}
export interface WorkoutSet { id: string; reps: number; weightKg: number; completed: boolean }
export interface Exercise { id: string; name: string; sets: WorkoutSet[] }
export interface Workout {
  id: string
  name: string
  kind: 'push' | 'pull' | 'legs' | 'rest'
  date: string
  status: 'planned' | 'active' | 'completed'
  startedAt?: string
  completedAt?: string
  exercises: Exercise[]
}
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks'
// Nutrients describe the entire entered serving, never implicitly per 100 g.
export interface FoodEntry extends NutritionTargets {
  id: string
  name: string
  mealType: MealType
  serving: string
  source?: { provider: string; externalId: string; barcode?: string }
}
export interface NutritionDay {
  id: string // YYYY-MM-DD in the user's local timezone
  date: string
  targets: NutritionTargets // Historical snapshot, independent of later profile edits.
  entries: FoodEntry[]
}
export interface WeightEntry {
  id: string
  date: string
  weightKg: number
  createdAt: string
}
export interface ProgressEntry {
  id: string
  date: string
  weightKg?: number
  measurements?: { waistCm?: number; chestCm?: number; hipsCm?: number }
  photoIds?: string[]
  note?: string
}
export interface AppData {
  profile: UserProfile | null
  nutrition: NutritionDay[]
  weights: WeightEntry[]
  workouts: Workout[]
}

