import type { CatalogExercise } from '../data/exercises'
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
  customExercises: CatalogExercise[]
  workoutPlan: WorkoutPlan
}

export type TargetMuscle = 'chest' | 'back' | 'front-delts' | 'side-delts' | 'rear-delts' | 'biceps' | 'triceps' | 'quads' | 'hamstrings' | 'glutes' | 'calves' | 'core' | 'forearms' | 'adductors' | 'abductors' | 'hip-flexors' | 'erectors' | 'neck'
export interface PlannedExercise {
  exerciseId: string
  sets: number
  reps: number
  repsMax?: number // Optional upper end of a rep range; omitted for a fixed target.
  weightKg: number | null // null means not set; zero is a deliberate unloaded setting.
  restSeconds: number
}
export type TrainingFocus = 'all' | 'push' | 'pull' | 'legs' | 'arms' | 'upper' | 'upper-main' | 'shoulders-arms' | 'chest-back' | 'chest' | 'back' | 'shoulders' | 'full' | 'rest'
export interface WorkoutDay {
  id: string
  name: string
  type: 'workout' | 'rest'
  targetMuscleGroups: TargetMuscle[]
  exercises: PlannedExercise[]
}
export type TrainingDay = WorkoutDay
export interface WorkoutSplit {
  id: string
  name: string
  description: string
  recommendedDaysPerWeek: number
  days: WorkoutDay[]
}
export interface WorkoutPlan {
  id: 'weekly-plan'
  schemaVersion: 2
  name: string
  templateId: string | null
  customized: boolean
  equipment: string[]
  gymConfigured: boolean
  favorites: string[]
  days: WorkoutDay[] // Ordered Monday through Sunday, independent of the chosen template.
}
// Input contract for a future recommendation service; not an automatic prescription.
export interface WorkoutGenerationPreferences {
  daysPerWeek: number
  goal: FitnessGoal | 'strength' | 'general-fitness'
  experience: 'beginner' | 'intermediate' | 'advanced'
  equipment: string[]
  favoriteExerciseIds: string[]
  excludedExerciseIds: string[]
  minutesPerSession: number
  priorityMuscles: TargetMuscle[]
}
